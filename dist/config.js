"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeFromFactory = exports.getFactoryURL = exports.getFactoryPort = exports.getFactoryHostname = exports.getFactoryProtocol = exports.FactoryConfig = void 0;
let { protocol, hostname } = ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.window) === null || _a === void 0 ? void 0 : _a.location) || { protocol: 'https:', hostname: 'localhost' };
exports.FactoryConfig = {
    protocol: protocol,
    host: hostname,
    get port() { return (hostname == 'localhost' ? 8080 : null); },
    get url() {
        return `${this.protocol}//${this.host}${this.port ? `:${this.port}` : ''}`;
    },
    compose(relativePath) {
        return `${this.url}${relativePath}`;
    },
};
const getFactoryProtocol = () => { return exports.FactoryConfig.protocol; };
exports.getFactoryProtocol = getFactoryProtocol;
const getFactoryHostname = () => { return exports.FactoryConfig.host; };
exports.getFactoryHostname = getFactoryHostname;
const getFactoryPort = () => { return exports.FactoryConfig.port; };
exports.getFactoryPort = getFactoryPort;
const getFactoryURL = () => { return exports.FactoryConfig.url; };
exports.getFactoryURL = getFactoryURL;
const composeFromFactory = (relativePath) => { return exports.FactoryConfig.compose(relativePath); };
exports.composeFromFactory = composeFromFactory;
//# sourceMappingURL=config.js.map