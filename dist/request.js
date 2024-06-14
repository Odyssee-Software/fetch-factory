"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestFactory = void 0;
const index_1 = require("./index");
function RequestFactory(options) {
    return {
        Get: (0, index_1.FetchFactory)({
            caller: options.caller,
            method: "GET",
            headers: options.headers,
            parser: options.parser
        }),
        Post: (0, index_1.FetchFactory)({
            caller: options.caller,
            method: "POST",
            headers: options.headers,
            parser: options.parser
        }),
        Put: (0, index_1.FetchFactory)({
            caller: options.caller,
            method: "PUT",
            headers: options.headers,
            parser: options.parser
        }),
        Patch: (0, index_1.FetchFactory)({
            caller: options.caller,
            method: "PATCH",
            headers: options.headers,
            parser: options.parser
        }),
        Delete: (0, index_1.FetchFactory)({
            caller: options.caller,
            method: "DELETE",
            headers: options.headers,
            parser: options.parser
        })
    };
}
exports.RequestFactory = RequestFactory;
//# sourceMappingURL=request.js.map