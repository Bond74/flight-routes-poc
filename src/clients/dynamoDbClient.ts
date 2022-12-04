import { inspect } from "util";
import { DynamoDBClient, PutItemCommand, ScanCommand, ScanCommandInput, paginateScan } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  ROUTES_TABLE_NAME,
  AGGREGATION_CACHE_KEY,
  DYNAMO_DB_TTL_SECONDS,
  CACHE_TTL_SECONDS,
  LAMBDA_AWS_REGION
} from "../infrastructure/constants";
import { IFlightRoutesAggregator } from "../interfaces/IFlightRoutesAggregator";
import { IRoute } from "../interfaces/IRoute";
import { getHashedValue } from "../helpers/utils";
import { CacheProvider } from "./cacheProvider";

export class DynamoRoutesAggregator implements IFlightRoutesAggregator {
  private db: DynamoDBClient;
  public constructor() {
    this.db = new DynamoDBClient({
      region: LAMBDA_AWS_REGION
    });
  }

  public async saveRoute(route: IRoute): Promise<void> {
    const dbItem = {
      ...route,
      ttl: this.getTtl(),
      id: getHashedValue(JSON.stringify(route))
    };
    try {
      await this.db.send(
        new PutItemCommand({
          TableName: ROUTES_TABLE_NAME,
          Item: marshall(dbItem, { removeUndefinedValues: true })
        })
      );
    } catch (err) {
      console.error(inspect(err, false, null));
    }
  }

  public async getRoutes(): Promise<IRoute[]> {
    console.log("Trying to get routes from cache...");
    const cachedItems = CacheProvider.get<IRoute[]>(AGGREGATION_CACHE_KEY);
    if (cachedItems) {
      console.log("Taking cached routes from lambda execution context");
      return cachedItems
    };
    console.log("No cache found");

    const params: ScanCommandInput = {
      TableName: ROUTES_TABLE_NAME
    };

    console.log("Getting routes from db table ", ROUTES_TABLE_NAME);
    const routes: IRoute[] = [];
    try {
      const paginator = paginateScan({ client: this.db }, params);
      let pages = 0;
      for await(const page of paginator) {
        const pageItems: IRoute[] =  (page?.Items?.map(item => unmarshall(item) as IRoute)) || [];
        routes.push(...pageItems);
        console.log("Items in scann page ", pageItems.length);
        ++pages;
      }
      console.log("Number of pages scanned", pages);
      CacheProvider.set<IRoute[]>(AGGREGATION_CACHE_KEY, routes, CACHE_TTL_SECONDS);
      return routes;
    } catch (err) {
      console.error(inspect(err, false, null));
    }
    return [];
  };

  private getTtl(): number {
    const now = Math.floor(Date.now() / 1000);
    return now + DYNAMO_DB_TTL_SECONDS; // now + 1 hour by default
  }
}  