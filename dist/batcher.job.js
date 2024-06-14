"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatcherJob = void 0;
class BatcherJob {
    execute(args) {
        return Promise.resolve(null);
    }
    solver(batch, needs) {
        return (...args) => {
            return batch.solver({
                find: { id: needs },
                args: args,
                on: {
                    success(next, reject, result) {
                        try {
                            next(this.execute);
                        }
                        catch (error) {
                            reject(error);
                        }
                    },
                    error(reject) {
                        reject(false);
                    },
                    pending(wait) {
                        wait();
                    },
                }
            });
        };
    }
}
exports.BatcherJob = BatcherJob;
//# sourceMappingURL=batcher.job.js.map