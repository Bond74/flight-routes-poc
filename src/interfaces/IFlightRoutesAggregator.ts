import { IRoute } from "./IRoute" 
export interface IFlightRoutesAggregator {
    getRoutes: (start: string | undefined) => Promise<IRoute[]>;
    saveRoute: (route: IRoute) => Promise<void>;
}