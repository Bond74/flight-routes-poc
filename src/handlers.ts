import { inspect } from "util";
import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { ConfigProvider } from "./clients/configProvider";
import { DynamoRoutesAggregator } from "./clients/dynamoDbClient";
import { RoutesAggregatorTypes } from "./infrastructure/types";
import { RoutesApiClient } from "./clients/routesApiClient";
import { SqsClient } from "./clients/sqsClient";

const config = new ConfigProvider().getConfig();

export const aggregateRoutesHandler = async (event: SQSEvent): Promise<void> => {
  const { endpoint } = JSON.parse(event.Records[0].body);
  console.log("Endpoint to aggregate: ", endpoint);

  const routesApi = new RoutesApiClient(endpoint.stringValue as string);
  const aggregator = getRoutesAggregator(config.aggregatorType);
  
  const routes = await routesApi.getRoutes(endpoint); // Lambda may retry to retrieve routes from API on error (in 2 minutes)
  console.log(`Number of routes retrieved from endpoint "${endpoint}" is: `, routes?.length || 0);

  let cnt = 0, errs = 0;
  for(const route of routes){
    try {
      await aggregator.saveRoute(route);
      ++cnt;
    } catch (err) {
      console.error(inspect(err, false, null));
      ++errs;
    }
  }
  console.log(`Aggregated routes=${cnt}, errors=${errs}`);
};

export const getRoutesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const start = event.pathParameters?.start;
  const aggregator = getRoutesAggregator(config.aggregatorType);

  try {
    const data = await aggregator.getRoutes(start);
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return handleError(500, error);
  }
}

export const cloudWatchSchedulerHandler = async (): Promise<void> => {
  const endpoints = (process.env?.sourceEndpoints || "").split(",");
  console.log("Endpoints to aggregate: ", endpoints);
  const sqs = new SqsClient();
  for(const ep of endpoints) {
    try {
      await sqs.sendMessage(ep);
      console.log(`Aggregation routes from "${ep}" has started...`);
    } catch (err) {
      console.error(inspect(err, false, null));
    }
  }
}


const handleError = (code: number, error: unknown): APIGatewayProxyResult => {
  const errorMessage = inspect(error, false, null);
  console.error(errorMessage);
  return {
    statusCode: code,
    body: JSON.stringify({ error: errorMessage })
  };
}

const getRoutesAggregator = (aggregatorType: RoutesAggregatorTypes) => {
  if (aggregatorType == RoutesAggregatorTypes.DynamoDb) {
    return new DynamoRoutesAggregator();
  } else {
    throw new Error("Not implemented");
  }
}
