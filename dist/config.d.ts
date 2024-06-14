export interface IFactoryConfig {
    /** Server portocol */
    protocol: "http:" | "https:";
    /** Server host */
    host: string;
    /** Server port */
    port?: number;
    /** Server url */
    url: string;
    /** Return server url config with relative path */
    compose: (relativePath: string) => string;
}
export declare const FactoryConfig: IFactoryConfig;
export declare const getFactoryProtocol: () => "http:" | "https:";
export declare const getFactoryHostname: () => string;
export declare const getFactoryPort: () => number;
export declare const getFactoryURL: () => string;
export declare const composeFromFactory: (relativePath: string) => string;
