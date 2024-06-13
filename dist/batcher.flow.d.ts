import { BatchConfig, Batch, onProgressCallback } from './batcher';
import { BatchFallbackSolver } from './batcher.fallback.query';
import { BatcherJob } from './batcher.job';
export declare class BatcherMergedStep {
    flow: BatcherWorkflow;
    get batch(): Batch;
    jobs: ((BatcherWorkflowStep) | (BatcherWorkflowLinkStep))[];
    jobControllersId: number[];
    constructor(flow: BatcherWorkflow, steps: ((BatcherWorkflowStep) | (BatcherWorkflowLinkStep))[]);
    static init(flow: BatcherWorkflow, steps: ((BatcherWorkflowStep) | (BatcherWorkflowLinkStep))[]): BatcherMergedStep;
    next<Arguments extends Record<string, any> = {}, Result = any>(job: typeof BatcherJob<Arguments, Result>, args: Arguments): void;
}
export declare class BatcherWorkflowStep<Arguments extends Record<string, any> = {}> {
    args: Arguments;
    flow: BatcherWorkflow;
    get batch(): Batch;
    job: typeof BatcherJob<Record<string, any>, any>;
    jobController: (((args: Record<string, any>) => Promise<any>) | ((...args: []) => BatchFallbackSolver<any>));
    jobControllerId: number;
    linked: Map<string, BatcherWorkflowLinkStep>;
    constructor(flow: BatcherWorkflow, job: typeof BatcherJob<Record<string, any>, any>, args: Arguments);
    next<Arguments extends Record<string, any> = {}, Result = any>(job: typeof BatcherJob<Arguments, Result>, args: Arguments): BatcherWorkflowLinkStep<Arguments, any>;
}
export declare class BatcherWorkflowLinkStep<Arguments extends Record<string, any> = {}, Result = any> extends BatcherWorkflowStep<Arguments> {
    parent_step: BatcherWorkflowStep | BatcherWorkflowLinkStep;
    needs: number[];
    constructor(step: BatcherWorkflowStep | BatcherWorkflowLinkStep, job: typeof BatcherJob<Record<string, any>, any>, args: Arguments);
}
export declare class BatcherWorkflowStepConsumer<Arguments extends Record<string, any> = {}, Result = any> extends BatcherWorkflowStep<Arguments> {
}
export interface IBatcherWorkflowConfig {
    batch: Batch;
}
export declare class BatcherWorkflow {
    batch: Batch;
    entries: Map<string, any>;
    static init(config: BatchConfig): BatcherWorkflow;
    constructor(config: IBatcherWorkflowConfig);
    step<Arguments extends Record<string, any> = {}, Result = any>(job: typeof BatcherJob<Arguments, Result>, args: Arguments): BatcherWorkflowStep;
    start(callback?: onProgressCallback): Promise<any>;
    onProgress(callback: onProgressCallback): void;
    useSteps(steps: ((BatcherWorkflowStep) | (BatcherWorkflowLinkStep))[]): BatcherMergedStep;
}
