import { IRoute } from "../interfaces/IRoute";
import axios, { AxiosRequestConfig, AxiosError } from "axios";

export class RoutesApiClient {

    public async getRoutes(url: string): Promise<IRoute[]> {
      const requestConfig: AxiosRequestConfig = {
        method: "GET",
        baseURL: url,
        timeout: 300000 // 5 minutes 
      };
  
      try {
        console.log(`Sending request via axios: ${JSON.stringify(requestConfig)}`);
        const axiosResponse = await axios.request(requestConfig);
        const routes = axiosResponse.data as IRoute[];
        console.log(`Received: ${routes?.length || 0 } items`);
        return routes;
      } catch (err) {
        const e = err as {response:{data: {error: string}}};
        const errMsg = JSON.stringify( (e.response?.data?.error || err) );
        throw new Error(`Axios request failed: ${errMsg}`);
      }
    }    
}