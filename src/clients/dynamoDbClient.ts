import { inspect } from "util";
import { DynamoDBClient, PutItemCommand, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ROUTES_TABLE_NAME } from "../infrastructure/constants";
import { IFlightRoutesAggregator } from "../interfaces/IFlightRoutesAggregator";
import { IRoute } from "../interfaces/IRoute";
import { getHashedValue } from "../helpers/utils";

export class DynamoRoutesAggregator implements IFlightRoutesAggregator {
  private db: DynamoDBClient;
  public constructor () {
    this.db = new DynamoDBClient({
      region: process.env?.region || "eu-west-1"
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
    const params: ScanCommandInput = {
      TableName: "ROUTES_TABLE_NAME",
      ExpressionAttributeValues: {
        ":start": { S: start || "" }
      },
      FilterExpression: "sourceAirport = :start",
      ...( start ? { FilterExpression: "#sourceAirport = :start" } : {} )
    };

    try {
      const data = await this.db.send(new ScanCommand(params));
      console.log("Number or routes retrieved from Dynamo: ", data?.Items?.length || 0);
      return data?.Items?.map(item => unmarshall(item) as IRoute) || [];
    } catch (err) {
      console.error(inspect(err, false, null));
    }
    return [];
  };

  private getTtl(): number {
    const now = Math.floor(Date.now() / 1000);
    return now + (+(process.env?.ttlSeconds || 3600)); // now + 1 hour
  }
}