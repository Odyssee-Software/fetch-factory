"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Solver = exports.Description = void 0;
function Description(description) {
    return function (target) {
        target.prototype.description = description;
        return target;
    };
}
exports.Description = Description;
function Solver(config) {
    return function () {
    };
}
exports.Solver = Solver;
//# sourceMappingURL=batcher.decorator.js.map