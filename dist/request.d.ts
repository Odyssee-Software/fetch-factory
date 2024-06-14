import { IFetchFactory } from './index';
export interface ICRUDFactory {
    /** La fonction utilisée pour effectuer la requête HTTP. */
    caller: IFetchFactory["caller"];
    /** Les en-têtes de la requête HTTP. */
    headers?: IFetchFactory["headers"];
    parser?: IFetchFactory["parser"];
}
export declare function RequestFactory<Response = any>(options: ICRUDFactory): {
    Get: <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<Response & {
        output_data?: OutputData;
    }>;
    Post: <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<Response & {
        output_data?: OutputData;
    }>;
    Put: <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<Response & {
        output_data?: OutputData;
    }>;
    Patch: <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<Response & {
        output_data?: OutputData;
    }>;
    Delete: <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<Response & {
        output_data?: OutputData;
    }>;
};
