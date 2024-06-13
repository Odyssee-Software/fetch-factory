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

let { protocol , hostname } = globalThis?.window?.location || { protocol : 'https:' , hostname : 'localhost' };

export const FactoryConfig:IFactoryConfig = {
  protocol : protocol as 'http:' | 'https:',
  host:hostname,
  get port(){ return ( hostname == 'localhost' ? 8080 : null) },
  get url(){
    return `${this.protocol}//${this.host}${this.port ? `:${this.port}` : ''}`;
  },
  compose(relativePath:string) {
    return `${this.url}${relativePath}`;
  },
};

export const getFactoryProtocol = () => { return FactoryConfig.protocol };
export const getFactoryHostname = () => { return FactoryConfig.host };
export const getFactoryPort = () => { return FactoryConfig.port };
export const getFactoryURL = () => { return FactoryConfig.url };
export const composeFromFactory = (relativePath:string) => { return FactoryConfig.compose(relativePath) };