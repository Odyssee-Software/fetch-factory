"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatcherWorkflow = exports.BatcherWorkflowStepConsumer = exports.BatcherWorkflowLinkStep = exports.BatcherWorkflowStep = exports.BatcherMergedStep = void 0;
const batcher_1 = require("./batcher");
class BatcherMergedStep {
    // Getter du batcher responsable des jobs
    get batch() { return this.flow.batch; }
    constructor(flow, steps) {
        // Context d'éxécution du Flow
        this.flow = null;
        this.jobControllersId = [];
        this.flow = flow;
        this.jobControllersId = steps.reduce((ids, step) => {
            ids.push(step.jobControllerId);
            return ids;
        }, []);
    }
    static init(flow, steps) {
        return new BatcherMergedStep(flow, steps);
    }
    next(job, args) {
        let linked_step = new BatcherWorkflowLinkStep(this.jobs[0], job, args);
        this.jobs.forEach((job) => {
            job.linked.set(`${linked_step.jobControllerId}`, job);
        });
    }
}
exports.BatcherMergedStep = BatcherMergedStep;
class BatcherWorkflowStep {
    // Getter du batcher responsable des jobs
    get batch() { return this.flow.batch; }
    constructor(flow, job, args) {
        // Argument de l'étape
        this.args = null;
        // Context d'éxécution du Flow
        this.flow = null;
        // Job de l'étpe
        this.job = null;
        // Controller exécutable du job
        this.jobController = null;
        // JobId au seins du batcher
        this.jobControllerId = null;
        // Jobs enfants de l'étape
        this.linked = new Map();
        this.flow = flow;
        this.args = args;
        this.job = job;
        if (this instanceof BatcherWorkflowStep) {
            this.jobController = new job().execute;
            this.jobControllerId = this.batch.push(this.jobController, args);
        }
    }
    next(job, args) {
        return new BatcherWorkflowLinkStep(this, job, args);
    }
}
exports.BatcherWorkflowStep = BatcherWorkflowStep;
class BatcherWorkflowLinkStep extends BatcherWorkflowStep {
    constructor(step, job, args) {
        super(step.flow, job, args);
        this.needs = [];
        this.parent_step = step;
        this.parent_step.linked.set(`${this.jobControllerId}`, this);
        this.needs.push(this.parent_step.jobControllerId);
        if (this instanceof BatcherWorkflowLinkStep) {
            this.jobController = new job().solver(this.batch, this.needs);
        }
    }
}
exports.BatcherWorkflowLinkStep = BatcherWorkflowLinkStep;
class BatcherWorkflowStepConsumer extends BatcherWorkflowStep {
}
exports.BatcherWorkflowStepConsumer = BatcherWorkflowStepConsumer;
class BatcherWorkflow {
    static init(config) {
        return new BatcherWorkflow({ batch: (0, batcher_1.createBatch)(config) });
    }
    constructor(config) {
        this.batch = null;
        this.entries = new Map();
        Object.assign(this, config);
    }
    step(job, args) {
        let entryId = this.entries.size;
        this.entries.set(`${entryId}`, new BatcherWorkflowStep(this, job, args));
        return this.entries.get(`${entryId}`);
    }
    start(callback) {
        if (callback)
            this.batch.on('progress', callback);
        return this.batch.start();
    }
    onProgress(callback) {
        this.batch.on('progress', callback);
    }
    useSteps(steps) {
        return BatcherMergedStep.init(this, steps);
    }
}
exports.BatcherWorkflow = BatcherWorkflow;
//# sourceMappingURL=batcher.flow.js.map