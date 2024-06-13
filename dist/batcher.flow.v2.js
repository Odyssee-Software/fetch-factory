"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatcherWorkflow = exports.WorkflowJobConsumer = exports.WorkflowJobStep = void 0;
const batcher_1 = require("./batcher");
class WorkflowJobStep {
    // Getter for the batcher responsible for jobs
    get batch() { return this.workflow.batch; }
    constructor(workflow, job, stepArgs) {
        // Arguments of the step
        this.stepArgs = null;
        // Execution context of the Flow
        this.workflow = null;
        // Job of the step
        this.job = null;
        // Executable job controller
        this.jobExecutor = null;
        // Job ID within the batcher
        this.jobId = null;
        this.workflow = workflow;
        this.stepArgs = stepArgs;
        this.job = job;
        if (this instanceof WorkflowJobStep) {
            this.jobExecutor = new job().execute;
            this.jobId = this.batch.push(this.jobExecutor, stepArgs);
        }
    }
}
exports.WorkflowJobStep = WorkflowJobStep;
class WorkflowJobConsumer {
    get batch() { return this.workflow.batch; }
    constructor(workflow, targets, job, consumerArgs) {
        this.consumerArgs = null;
        this.workflow = null;
        this.job = null;
        this.jobSolver = null;
        this.jobId = null;
        this.dependencyIds = [];
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
    static init(workflow, targets, job, consumerArgs) {
        return new WorkflowJobConsumer(workflow, targets, job, consumerArgs);
    }
}
exports.WorkflowJobConsumer = WorkflowJobConsumer;
class BatcherWorkflow {
    static init(config) {
        return new BatcherWorkflow({ batch: (0, batcher_1.createBatch)(config) });
    }
    constructor(config) {
        this.batch = null;
        this.steps = new Map();
        Object.assign(this, config);
    }
    step(job, stepArgs) {
        return new WorkflowJobStep(this, job, stepArgs);
    }
    start(callback) {
        if (callback)
            this.batch.on('progress', callback);
        return this.batch.start();
    }
    onProgress(callback) {
        this.batch.on('progress', callback);
    }
    consumer(steps, job, consumerArgs) {
        return WorkflowJobConsumer.init(this, steps, job, consumerArgs);
    }
}
exports.BatcherWorkflow = BatcherWorkflow;
//# sourceMappingURL=batcher.flow.v2.js.map