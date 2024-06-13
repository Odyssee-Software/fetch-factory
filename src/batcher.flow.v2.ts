import { createBatch, BatchConfig, Batch, onProgressCallback } from './batcher';
import { BatchFallbackQuery, BatchFallbackSolver } from './batcher.fallback.query';
import { BatcherJob } from './batcher.job';

type BindedArguments<Arguments , ConsumerResults> = {
  [Key in keyof Arguments]: (Arguments[Key]) | ((x: ConsumerResults) => Arguments[Key]);
};

export class WorkflowJobStep<Arguments extends Record<string, any> = {}> {

  // Arguments of the step
  stepArgs: Arguments = null;
  // Execution context of the Flow
  workflow: BatcherWorkflow = null;
  // Getter for the batcher responsible for jobs
  get batch() { return this.workflow.batch; }
  // Job of the step
  job: typeof BatcherJob<Record<string, any>, any> = null;
  // Executable job controller
  jobExecutor: ((args: Record<string, any>) => Promise<any>) | ((...args: []) => BatchFallbackSolver<any>) = null;
  // Job ID within the batcher
  jobId: number = null;

  constructor(workflow: BatcherWorkflow, job: typeof BatcherJob<Record<string, any>, any>, stepArgs: Arguments) {
    this.workflow = workflow;
    this.stepArgs = stepArgs;
    this.job = job;

    if (this instanceof WorkflowJobStep) {
      this.jobExecutor = new job().execute;
      this.jobId = this.batch.push(this.jobExecutor, stepArgs);
    }
  }
}

export class WorkflowJobConsumer<Arguments extends Record<string, any> = {}> {

  consumerArgs: Arguments = null;
  workflow: BatcherWorkflow = null;
  get batch() { return this.workflow.batch; }
  targets;
  job: typeof BatcherJob<Record<string, any>, any> = null;
  jobSolver: ((...args: []) => BatchFallbackSolver<any>) = null;
  jobId: number = null;
  dependencyIds: number[] = [];

  constructor(workflow: BatcherWorkflow, targets: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments>, consumerArgs: Arguments) {
    this.workflow = workflow;
    this.targets = targets;
    this.job = job;
    this.consumerArgs = consumerArgs;

    this.dependencyIds = targets.reduce((ids, target) => {
      ids.push(target.jobId);
      return ids;
    }, []);

    if (this instanceof WorkflowJobConsumer) {
      this.jobSolver = new job().solver(this.batch, this.dependencyIds);
      this.jobId = this.batch.push(this.jobSolver, consumerArgs);
    }
  }

  static init<Arguments extends Record<string, any> = {}>(workflow: BatcherWorkflow, targets: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments>, consumerArgs: Arguments) {
    return new WorkflowJobConsumer(workflow, targets, job, consumerArgs);
  }
}

export interface BatcherWorkflowConfig {
  batch: Batch;
}

export class BatcherWorkflow {

  batch: Batch = null;
  steps: Map<string, any> = new Map();

  static init(config: BatchConfig) {
    return new BatcherWorkflow({ batch: createBatch(config) });
  }

  constructor(config: BatcherWorkflowConfig) {
    Object.assign(this, config);
  }

  step<Arguments extends Record<string, any> = {}, Result = any>(job: typeof BatcherJob<Arguments, Result>, stepArgs: Arguments) {
    return new WorkflowJobStep<Arguments>(this, job, stepArgs);
  }

  start(callback?: onProgressCallback) {
    if (callback) this.batch.on('progress', callback);
    return this.batch.start();
  }

  onProgress(callback: onProgressCallback) {
    this.batch.on('progress', callback);
  }

  consumer< ConsumerResults = [] , Arguments extends Record<string, any> = {}, Result = any>(steps: (WorkflowJobStep | WorkflowJobConsumer)[], job: typeof BatcherJob<Arguments, Result>, consumerArgs: BindedArguments<Arguments , ConsumerResults>) {
    return WorkflowJobConsumer.init(this, steps, job, consumerArgs);
  }

}
