"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __batch__fn, __batch__events, __batch__concurrency, __batch__status, __batch__running_jobStartEventTime, __batch__running_jobLastEventTime;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBatch = exports._batch = exports.Decorators = void 0;
const array_chunk_1 = require("./array_chunk");
const batcher_fallback_query_1 = require("./batcher.fallback.query");
exports.Decorators = __importStar(require("./batcher.decorator"));
/* La classe `_batch` dans TypeScript implémente un système de traitement par lots avec contrôle de
concurrence, suivi de la progression et gestion des événements. */
class _batch {
    get fn() { return __classPrivateFieldGet(this, __batch__fn, "f"); }
    ;
    get events() { return __classPrivateFieldGet(this, __batch__events, "f"); }
    ;
    get status() { return __classPrivateFieldGet(this, __batch__status, "f"); }
    ;
    get summary() {
        let pending = this.pending.length, total = this.fn.length, complete = this.complete.length, error = this.error.length;
        return {
            pending: pending,
            total: total,
            complete: complete,
            error: error,
            percent: Math.round(100 - ((pending / total) * 100)),
            start: __classPrivateFieldGet(this, __batch__running_jobStartEventTime, "f"),
            end: __classPrivateFieldGet(this, __batch__running_jobLastEventTime, "f"),
            duration: __classPrivateFieldGet(this, __batch__running_jobLastEventTime, "f") - __classPrivateFieldGet(this, __batch__running_jobLastEventTime, "f"),
            concurrency: __classPrivateFieldGet(this, __batch__concurrency, "f")
        };
    }
    get pending() {
        return __classPrivateFieldGet(this, __batch__fn, "f").reduce((result, controller) => {
            if (controller.status == "pending")
                result.push(controller);
            return result;
        }, []);
    }
    get complete() {
        return __classPrivateFieldGet(this, __batch__fn, "f").reduce((result, controller) => {
            if (controller.status == "done")
                result.push(controller);
            return result;
        }, []);
    }
    get error() {
        return __classPrivateFieldGet(this, __batch__fn, "f").reduce((result, controller) => {
            if (controller.status == "error")
                result.push(controller);
            return result;
        }, []);
    }
    constructor() {
        __batch__fn.set(this, []);
        __batch__events.set(this, {
            progress: null,
            end: null
        });
        __batch__concurrency.set(this, 4);
        __batch__status.set(this, "idle");
        __batch__running_jobStartEventTime.set(this, null);
        __batch__running_jobLastEventTime.set(this, null);
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, __batch__status, "f") == "running")
                return;
            __classPrivateFieldSet(this, __batch__status, "running", "f");
            __classPrivateFieldSet(this, __batch__running_jobStartEventTime, Date.now(), "f");
            let chunks = (0, array_chunk_1.chunk)(__classPrivateFieldGet(this, __batch__fn, "f"), __classPrivateFieldGet(this, __batch__concurrency, "f"));
            let results = [];
            return new Promise((final) => {
                return Promise.all(Array.from(chunks, (chunk, chunkId) => {
                    return new Promise((next, reject) => __awaiter(this, void 0, void 0, function* () {
                        Promise.all(chunk.reduce((result, controller) => {
                            let control = controller.controller(controller.args);
                            // Ne process pas ce controll qui et done
                            if (controller.status && (controller.status == "done" || controller.status == "error"))
                                control = Promise.resolve(controller.result);
                            // Recuperation du controller du solver pour l'attribuer à la pille des exécution à effectuer
                            if (control instanceof batcher_fallback_query_1._batchFallbackSolver) {
                                let result = control.execute(controller.id);
                                if (result instanceof Promise) {
                                    control = result;
                                }
                            }
                            return [...result, control];
                        }, []))
                            .then((request_results) => {
                            // console.log({ request_results })
                            results.push(request_results);
                            chunks[chunkId].forEach((controller, i) => {
                                let result = request_results[i];
                                let status = __classPrivateFieldGet(this, __batch__fn, "f")[controller.id].status;
                                // Si le résultat est encore un solver , passage du status à 'pending'.
                                if (result instanceof batcher_fallback_query_1._batchFallbackSolver) {
                                    status = 'pending';
                                }
                                // Sinon si le status est `pending` ( pas `done` ou `error` ), passage à `done`.
                                else if (status == "pending")
                                    status = 'done';
                                this.updateControllerStatus(controller.id, status);
                                this.updateControllerResult(controller.id, request_results[i]);
                                // this.#_fn[ controller.id ] = {
                                //   ...this.#_fn[ controller.id ],
                                //   result : request_results[i],
                                //   status : status,
                                // }
                            });
                        })
                            .catch((error) => {
                            // console.log({ error });
                            results.push(error);
                            for (let controller of chunks[chunkId]) {
                                __classPrivateFieldGet(this, __batch__fn, "f")[controller.id] = Object.assign(Object.assign({}, __classPrivateFieldGet(this, __batch__fn, "f")[controller.id]), { status: "error" });
                            }
                        })
                            .finally(() => {
                            __classPrivateFieldSet(this, __batch__running_jobLastEventTime, Date.now(), "f");
                            let progress = Object.assign(Object.assign({}, this.summary), { chunk: results.length, lastChunk: results[results.length - 1] });
                            if (__classPrivateFieldGet(this, __batch__events, "f")["progress"]) {
                                __classPrivateFieldGet(this, __batch__events, "f")["progress"](progress);
                            }
                            next(progress);
                        });
                    }));
                }))
                    .finally(() => __awaiter(this, void 0, void 0, function* () {
                    let stillPending = __classPrivateFieldGet(this, __batch__fn, "f").reduce((result, request) => {
                        // console.log({ request })
                        if (request.status == 'pending')
                            result.push(true);
                        return result;
                    }, []).includes(true);
                    console.log({ stillPending });
                    if (stillPending) {
                        __classPrivateFieldSet(this, __batch__status, "idle", "f");
                        final(this.start());
                    }
                    else {
                        if (__classPrivateFieldGet(this, __batch__events, "f")["end"]) {
                            __classPrivateFieldGet(this, __batch__events, "f")["end"](results, null);
                        }
                        __classPrivateFieldSet(this, __batch__running_jobStartEventTime, null, "f");
                        __classPrivateFieldSet(this, __batch__running_jobLastEventTime, null, "f");
                        // this.#_fn = [];
                        __classPrivateFieldSet(this, __batch__status, "idle", "f");
                        final(results);
                    }
                }));
            });
        });
        this.find = (id) => {
            return __classPrivateFieldGet(this, __batch__fn, "f").find((controller, iterator) => {
                if (controller.id == id)
                    return controller;
            });
        };
    }
    concurrency(n) {
        __classPrivateFieldSet(this, __batch__concurrency, n, "f");
    }
    end(callback) {
        __classPrivateFieldGet(this, __batch__events, "f").end = callback;
    }
    progress(callback) {
        __classPrivateFieldGet(this, __batch__events, "f").progress = callback;
    }
    push(controller, args) {
        __classPrivateFieldGet(this, __batch__fn, "f").push({
            id: __classPrivateFieldGet(this, __batch__fn, "f").length,
            controller: controller,
            description: `job ${__classPrivateFieldGet(this, __batch__fn, "f").length}`,
            args: args || null,
            status: 'pending'
        });
        return __classPrivateFieldGet(this, __batch__fn, "f")[__classPrivateFieldGet(this, __batch__fn, "f").length - 1].id;
    }
    createJob(description, controller, args) {
        __classPrivateFieldGet(this, __batch__fn, "f").push({
            id: __classPrivateFieldGet(this, __batch__fn, "f").length,
            controller: controller,
            description: description,
            args: args || null,
            status: 'pending'
        });
        return __classPrivateFieldGet(this, __batch__fn, "f")[__classPrivateFieldGet(this, __batch__fn, "f").length - 1].id;
    }
    on(event, callback) {
        if (event in __classPrivateFieldGet(this, __batch__events, "f"))
            __classPrivateFieldGet(this, __batch__events, "f")[event] = callback;
    }
    solver(query) {
        return batcher_fallback_query_1._batchFallbackSolver.init(this, query);
    }
    updateControllerStatus(controllerId, status) {
        if (__classPrivateFieldGet(this, __batch__fn, "f")[controllerId]) {
            __classPrivateFieldGet(this, __batch__fn, "f")[controllerId].status = status;
            return true;
        }
        return false;
    }
    updateControllerResult(controllerId, result) {
        if (__classPrivateFieldGet(this, __batch__fn, "f")[controllerId]) {
            __classPrivateFieldGet(this, __batch__fn, "f")[controllerId].result = result;
            return true;
        }
        return false;
    }
}
exports._batch = _batch;
__batch__fn = new WeakMap(), __batch__events = new WeakMap(), __batch__concurrency = new WeakMap(), __batch__status = new WeakMap(), __batch__running_jobStartEventTime = new WeakMap(), __batch__running_jobLastEventTime = new WeakMap();
function createBatch(config) {
    let batch = new _batch();
    if (config === null || config === void 0 ? void 0 : config.concurrency)
        batch.concurrency(config.concurrency);
    if (config === null || config === void 0 ? void 0 : config.end)
        batch.end(config.end);
    if (config === null || config === void 0 ? void 0 : config.progress)
        batch.progress(config.progress);
    return batch;
}
exports.createBatch = createBatch;
//# sourceMappingURL=batcher.js.map