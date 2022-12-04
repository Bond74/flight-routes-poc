import { inspect } from "util";
import { DynamoDBClient, PutItemCommand, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
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

  public async getRoutes(start: string | undefined): Promise<IRoute[]> {
    const cachedItems = CacheProvider.get<IRoute[]>(AGGREGATION_CACHE_KEY);
    if (cachedItems) {
      console.log("Taking cached routes in lambda execution context");
      return cachedItems
    };

    const params: ScanCommandInput = {
      TableName: "ROUTES_TABLE_NAME",
      ExpressionAttributeValues: {
        ":start": { S: start || "" }
      },
      FilterExpression: "sourceAirport = :start",
      ...(start ? { FilterExpression: "#sourceAirport = :start" } : {})
    };

    try {
      const data = await this.db.send(new ScanCommand(params));
      const routes = data?.Items?.map(item => unmarshall(item) as IRoute) || [];
      console.log("Number or routes retrieved from Dynamo: ", routes.length);
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