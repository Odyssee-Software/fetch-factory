import { BatchConfig, Batch, onProgressCallback } from './batcher';
import { BatchFallbackSolver } from './batcher.fallback.query';
import { BatcherJob } from './batcher.job';
type BindedArguments<Arguments, ConsumerResults> = {
    [Key in keyof Arguments]: (Arguments[Key]) | ((x: ConsumerResults) => Arguments[Key]);
};
export declare class WorkflowJobStep<Arguments extends Record<string, any> = {}> {
    stepArgs: Arguments;
    workflow: BatcherWorkflow;
    get batch(): Batch;
    job: typeof BatcherJob<Record<string, any>, any>;
    jobExecutor: ((args: Record<string, any>) => Promise<any>) | ((...args: []) => BatchFallbackSolver<any>);
    jobId: number;
    constructor(workflow: BatcherWorkflow, job: typeof BatcherJob<Record<string, any>, any>, stepArgs: Arguments);
}
export declare class WorkflowJobConsumer<Arguments extends Record<string, any> = {}> {
    consumerArgs: Arguments;
    workflow: BatcherWorkflow;
    get batch(): Batch;
    targets: any;
    job: typeof BatcherJob<Record<string, any>, any>;
    jobSolver: ((...args: []) => BatchFallbackSolver<any>);
    jobId: number;
    dependencyIds: number[];
    constructor(workflow: BatcherWorkflow, targets: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments>, consumerArgs: Arguments);
    static init<Arguments extends Record<string, any> = {}>(workflow: BatcherWorkflow, targets: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments>, consumerArgs: Arguments): WorkflowJobConsumer<Arguments>;
}
export interface BatcherWorkflowConfig {
    batch: Batch;
}
export declare class BatcherWorkflow {
    batch: Batch;
    steps: Map<string, any>;
    static init(config: BatchConfig): BatcherWorkflow;
    constructor(config: BatcherWorkflowConfig);
    step<Arguments extends Record<string, any> = {}, Result = any>(job: typeof BatcherJob<Arguments, Result>, stepArgs: Arguments): WorkflowJobStep<Arguments>;
    start(callback?: onProgressCallback): Promise<any>;
    onProgress(callback: onProgressCallback): void;
    consumer<ConsumerResults = [], Arguments extends Record<string, any> = {}, Result = any>(steps: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments, Result>, consumerArgs: BindedArguments<Arguments, ConsumerResults>): WorkflowJobConsumer<BindedArguments<Arguments, ConsumerResults>>;
}
export {};
