import { APIGatewayProxyEvent, APIGatewayProxyResult, SQSEvent } from "aws-lambda";

export const aggregateRoutesHandler = async (event: SQSEvent): Promise<void> => {
  const { endpoint } = event.Records[0].messageAttributes;
  console.log("Endpoint to aggregate: ", endpoint);
  return;
};

export const getRoutesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const start = event.pathParameters?.start;
 
    return {
      statusCode: 200,
      body: start ? JSON.stringify(start) : ""
    };
  } catch (error) {
    return handleError(500, error);
  }
}

export const janrainExportCloudWatchHandler =  async (): Promise<void> => {
  const endpoints = (process.env?.sourceEndpoints || "").split(",");
  console.log("Endpoints to aggregate: ", endpoints);
  return;
}


function handleError(code: number, error: unknown): APIGatewayProxyResult {
  const errorMessage = (error instanceof Error) ? error.message : error;
  console.error(errorMessage);
  return {
    statusCode: code,
    body: JSON.stringify({ error: errorMessage })
  };
}