
import { IConfig } from "../interfaces/IConfig";
import { RoutesAggregatorTypes } from "../infrastructure/types";

// TO DO: move to Secrets Manager
const config: IConfig = {
    aggregatorType: RoutesAggregatorTypes.DynamoDb 
};

export class ConfigProvider {
    private conf: IConfig;

    public constructor() {
        this.conf = config;
    }

    public getConfig = (): IConfig => this.conf;
}