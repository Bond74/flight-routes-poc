import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AGGREGATION_SQS_URL } from "../infrastructure/constants";

export class SqsClient {
    private sqs: SQSClient;
    public constructor() {
        this.sqs = new SQSClient({
            region: process.env?.region || "eu-west-1"
        })
    }

    public sendMessage = async (endpoint: string): Promise<void> => {
        console.log("Sending message to SQS: ",AGGREGATION_SQS_URL);
        await this.sqs.send(new SendMessageCommand({
            QueueUrl: AGGREGATION_SQS_URL,
            MessageBody: JSON.stringify({ endpoint })
        }));
    }
}