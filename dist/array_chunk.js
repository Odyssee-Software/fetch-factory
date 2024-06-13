"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunk = void 0;
function chunk(array, size) {
    const chunkedArray = [];
    let index = 0;
    while (index < array.length) {
        chunkedArray.push(array.slice(index, index + size));
        index += size;
    }
    return chunkedArray;
}
exports.chunk = chunk;
//# sourceMappingURL=array_chunk.js.map