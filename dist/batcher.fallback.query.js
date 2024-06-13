"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._batchFallbackSolver = void 0;
class _batchFallbackSolver {
    get needs() {
        return this.query.find.id.reduce((needs, idToFind) => {
            let controller = this.batch.find(idToFind);
            if (controller)
                needs.push(controller);
            return needs;
        }, []);
    }
    get needsResult() {
        return this.needs.reduce((results, request) => {
            results.push(request.result);
            return results;
        }, []);
    }
    get pending() {
        return this.needs.reduce((result, controller) => {
            if (controller.status == 'pending')
                result = true;
            return result;
        }, false);
    }
    get resolvable() {
        return this.needs.reduce((result, controller) => {
            if (controller.status == 'error')
                result = false;
            return result;
        }, true);
    }
    constructor(batch, query) {
        this.query = null;
        this._onsuccess = null;
        this._onerror = null;
        this._onwait = null;
        this.onSucces = () => {
            return (nextController) => {
                this._onsuccess = nextController;
            };
        };
        this.onWait = (request) => {
            return () => {
                // console.log('onWait' , { length : this.batch.fn.length })
                // this.batch.push( () => {
                //   _batchFallbackSolver.init( this.batch , this.query );
                // } );
                // console.log('onWait after push' , { length : this.batch.fn.length })
            };
        };
        this.onError = (controllerId) => {
            this.batch.updateControllerStatus(controllerId, 'error');
            return (value) => {
                this._onerror = Promise.resolve(value || false);
            };
        };
        this.onReject = (controllerId) => {
            return (value) => {
                this.batch.updateControllerStatus(controllerId, 'error');
                this._onsuccess = Promise.resolve(value || null);
            };
        };
        this.execute = (controllerId) => {
            var _a, _b, _c;
            // Les jobs parents ( interdépendance )
            let needs = this.needs;
            // Ce job est-il en attente ? ( dépendant des jobs parents )
            let isPending = this.pending;
            // Ce job est-il resolvable ( dépendant des jobs parents )
            let isResolvable = this.resolvable;
            // Les resultats actuel des jobs parents
            let needsResult = this.needsResult;
            if (isPending) {
                return (_a = this.query.on) === null || _a === void 0 ? void 0 : _a.pending(this.onWait(needs));
            }
            else if (isResolvable) {
                (_b = this.query.on) === null || _b === void 0 ? void 0 : _b.success(this.onSucces(), this.onReject(controllerId), needsResult);
                if (!this._onsuccess)
                    this._onsuccess = Promise.reject(console.warn(`REJECT : NO RETURN STATEMENT FOR CONTROLLER ID ${controllerId}`));
                if (this._onsuccess instanceof Promise == false)
                    this._onsuccess = Promise.resolve(this._onsuccess);
                return this._onsuccess;
            }
            else {
                (_c = this.query.on) === null || _c === void 0 ? void 0 : _c.error(this.onError(controllerId));
                if (!this._onerror)
                    this._onerror = Promise.reject(false);
                if (this._onerror instanceof Promise == false)
                    this._onerror = Promise.reject(this._onerror);
                return this._onerror;
            }
        };
        this.query = query;
        Object.assign(this, {
            get batch() { return batch; }
        });
    }
    static init(batch, query) {
        return new _batchFallbackSolver(batch, query);
    }
    get find() { return this.batch.find; }
}
exports._batchFallbackSolver = _batchFallbackSolver;
;
//# sourceMappingURL=batcher.fallback.query.js.map