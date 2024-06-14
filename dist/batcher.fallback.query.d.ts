import { Batch, Controller } from ".";
export interface BatchFallbackQuery<ResultOnSuccess> {
    find: {
        id: number[];
    };
    args: any;
    on: {
        success: (next: (fn: Promise<any>) => void, reject: (value?: any) => void, result: ResultOnSuccess[]) => any;
        pending: (wait: () => void) => any;
        error: (reject: (error: any) => void) => any;
    };
}
export declare class _batchFallbackSolver<ResultOnSuccess> {
    batch: Batch;
    query: BatchFallbackQuery<ResultOnSuccess>;
    get needs(): any[];
    get needsResult(): any;
    get pending(): any;
    get resolvable(): any;
    constructor(batch: Batch, query: BatchFallbackQuery<ResultOnSuccess>);
    static init<ResultOnSuccess = any>(batch: Batch, query: BatchFallbackQuery<ResultOnSuccess>): BatchFallbackSolver<ResultOnSuccess>;
    _onsuccess: any;
    _onerror: any;
    _onwait: any;
    onSucces: () => (nextController: Promise<any>) => void;
    onWait: (request: Controller<any>[]) => () => void;
    onError: (controllerId: number) => (value?: any) => void;
    onReject: (controllerId: number) => (value?: any) => void;
    execute: (controllerId: number) => any;
    get find(): ((id: number) => Controller<any>) | ((id: number) => Controller<any>);
}
export interface BatchFallbackSolver<ResultOnSuccess = any> extends _batchFallbackSolver<ResultOnSuccess> {
}
