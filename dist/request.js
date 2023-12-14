"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = exports.Patch = exports.Put = exports.Post = exports.Get = void 0;
const index_1 = require("./index");
const Get = (headers = {}) => {
    return (0, index_1.FetchFactory)({
        caller: fetch.bind(window),
        method: "GET",
        headers: headers,
    });
};
exports.Get = Get;
const Post = (headers = {}) => {
    return (0, index_1.FetchFactory)({
        caller: fetch.bind(window),
        method: "POST",
        headers: headers
    });
};
exports.Post = Post;
const Put = (headers = {}) => {
    return (0, index_1.FetchFactory)({
        caller: fetch.bind(window),
        method: "PUT",
        headers: headers,
    });
};
exports.Put = Put;
const Patch = (headers = {}) => {
    return (0, index_1.FetchFactory)({
        caller: fetch.bind(window),
        method: "PATCH",
        headers: headers,
    });
};
exports.Patch = Patch;
const Delete = (headers = {}) => {
    return (0, index_1.FetchFactory)({
        caller: fetch.bind(window),
        method: "DELETE",
        headers: headers,
    });
};
exports.Delete = Delete;
//# sourceMappingURL=request.js.map