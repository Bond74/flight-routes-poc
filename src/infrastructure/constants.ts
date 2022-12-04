export const LAMBDA_AWS_REGION = process.env?.region || "eu-west-1";
export const ROUTES_TABLE_NAME = process.env?.routesTable;
export const AGGREGATION_SQS_URL = process.env?.sqsUrl;
export const AGGREGATION_CACHE_KEY = "flightRoutesAggregationCache";
export const DYNAMO_DB_TTL_SECONDS = +(process.env?.dbTtlSeconds || 3600); // 1 hour by default
export const CACHE_TTL_SECONDS = +(process.env?.cacheTtlSeconds || 600); // 10 minutes by default