import { IFetchFactory } from './index';
export declare const Get: (headers?: IFetchFactory['headers']) => <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<any>;
export declare const Post: (headers?: IFetchFactory['headers']) => <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<any>;
export declare const Put: (headers?: IFetchFactory['headers']) => <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<any>;
export declare const Patch: (headers?: IFetchFactory['headers']) => <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<any>;
export declare const Delete: (headers?: IFetchFactory['headers']) => <InputData extends Record<string, any> = any, OutputData = any>(optionalHeaders?: HeadersInit) => (endpoint: string, data?: InputData) => Promise<any>;
