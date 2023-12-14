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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchFactory = void 0;
__exportStar(require("./config"), exports);
__exportStar(require("./request"), exports);
/**
 * Crée une fonction réutilisable pour effectuer des requêtes HTTP avec des options spécifiques.
 * @param options - Les options de la requête HTTP, définies par l'interface IFetchFactory.
 * @returns Une fonction qui renvoie une promesse contenant les données de la réponse.
 */
const FetchFactory = (options) => {
    if ('headers' in options == false)
        options.headers = {};
    /**
     * Fonction de requête HTTP réutilisable créée par FetchFactory.
     * @param endpoint - L'URL de l'endpoint à appeler.
     * @param data - Les données à envoyer avec la requête (facultatif).
     * @returns Une promesse qui résout avec les données de la réponse.
     */
    return (endpoint, data) => {
        return new Promise((next, reject) => {
            options.caller(endpoint, Object.assign({ method: options.method, headers: (options.headers ? options.headers : {}) }, (data ? {
                body: (typeof data == 'string' ? data : JSON.stringify(data))
            } : {})))
                .then((result) => __awaiter(void 0, void 0, void 0, function* () {
                let response = yield result.text();
                try {
                    next(JSON.parse(response));
                }
                catch (error) {
                    next(response);
                }
            }))
                .catch(reject);
        });
    };
};
exports.FetchFactory = FetchFactory;
//# sourceMappingURL=index.js.map