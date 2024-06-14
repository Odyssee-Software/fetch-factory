import { Batch } from "./batcher";
import { BatchFallbackSolver } from "./batcher.fallback.query";
export declare class BatcherJob<Arguments extends Record<string, any> = {}, Result = any> {
    execute(args: Arguments): Promise<Result>;
    solver(batch: Batch, needs: number[]): () => BatchFallbackSolver<any>;
}
