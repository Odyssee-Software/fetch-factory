import { BatchFallbackQuery, BatchFallbackSolver } from './batcher.fallback.query';
export * as Decorators from './batcher.decorator';
export type BatchJob = {
    index: number;
    value: string;
    pending: number;
    total: number;
    complete: number;
    percent: number;
    start: string;
    end: string;
    duration: number;
};
export type BatchProgressEvent = BatchJob[];
export type onProgressCallback = (progress: BatchProgressEvent & any) => void;
export type onEndCallback = (err: any, results: any) => void;
export type Controller<ResultOnSuccess = any> = {
    id: number;
    controller: Function;
    description: string;
    args: Record<string, any>;
    status: "pending" | "done" | "error";
    result?: ResultOnSuccess;
};
export type FnControllers = Controller[];
export interface IBatch {
    fn: FnControllers;
    events: {
        progress: onProgressCallback | null;
        end: onEndCallback | null;
    };
    /**
     * Définis le niveau de concurrence pour le traitement par lots. Il prend un seul paramètre « n » qui représente le nombre de tâches simultanées pouvant être exécutées en même temps.
     * En définissant le niveau de simultanéité, vous pouvez contrôler le nombre de tâches traitées simultanément dans le travail par lots.
    */
    concurrency(n: number): void;
    /**
     * La méthode `start()` est responsable du lancement du traitement par lots des contrôleurs en file d'attente.
     * Il renvoie une promesse qui se résout lorsque tous les contrôleurs ont été traités.
    */
    start(): Promise<any>;
    /**
     * Définis une fonction qui vous permet de définir une fonction de rappel à exécuter lorsque le traitement par lots des contrôleurs est terminé.
     * La méthode `end` prend un seul paramètre `callback` de type `onEndCallback`, qui est une fonction qui accepte une erreur et les résultats comme arguments.
    */
    end(callback: onEndCallback): void;
    /**
     * Définit une fonction qui vous permet de définir une fonction de rappel à exécuter lorsqu'il y a une progression dans le traitement par lots des contrôleurs.
     * Le type `onProgressCallback` représente une fonction qui accepte un tableau `BatchProgressEvent` comme argument.
     * Ce tableau contient des informations sur la progression de chaque tâche par lots, y compris des détails tels que :
     * - l'index
     * - la valeur
     * - les tâches en attente
     * - le total des tâches
     * - l'état d'avancement
     * - le pourcentage d'achèvement
     * - l'heure de début
     * - l'heure de fin
     * - la durée
    */
    progress(callback: onProgressCallback): void;
    /** Utilisée pour ajouter une nouvelle fonction de contrôleur à la file d'attente de traitement par lots. */
    push<Arguments extends Record<string, any> = {}>(controller: Function, arg?: Arguments): number;
    createJob<Arguments extends Record<string, any> = {}>(description: string, controller: Function, arg?: Arguments): number;
    /** Utilisée pour enregistrer les écouteurs d'événements pour les événements de progression et de fin dans le système de traitement par lots. */
    on(event: "progress" | "end", callback: onProgressCallback | onEndCallback): void;
    /**
     * La méthode `solver` dans l'extrait de code définit une fonction qui permet d'ajouter un solveur en tant que requête
     * qui ne s'exécutera que si l'élément observé a été exécuté (passage de l'attente à l'état terminé ou état d'erreur)
     * @param query
     *
     * ## Sample
     * ```typescript
     *
     * batcher.push(( args ) => {
     *
     *  let [ arg1 , arg2 ] = args;
     *
     *  return batcher.solver({
     *    find : { id : "Controller ID" },
     *    args : args,
     *    on : {
     *      success : ( next , result ) => {
     *
     *        // DO STUFF WITH RESULT
     *
     *        next( myController( ... ) )
     *
     *      },
     *      pending : ( wait ) => {
     *
     *        // DO STUFF ON ERROR
     *        // NB : WAIT HAVE TO BE USED
     *
     *        wait();
     *
     *      }
     *      error : ( reject ) => {
     *
     *       // DO STUFF ON ERROR
     *
     *        reject();
     *
     *      }
     *    }
     *  })
     *
     * } , args)
     *
     * ```
    */
    solver<ResultOnSuccess = any>(query: BatchFallbackQuery<ResultOnSuccess>): BatchFallbackSolver<ResultOnSuccess>;
    find(id: number): Controller<any>;
    updateControllerStatus(controllerId: number, status: Controller["status"]): boolean;
    status: "idle" | "running";
    summary: any;
    pending: FnControllers;
    complete: FnControllers;
    error: FnControllers;
}
export declare class _batch implements IBatch {
    #private;
    get fn(): FnControllers;
    get events(): {
        progress: onProgressCallback;
        end: onEndCallback;
    };
    get status(): "idle" | "running";
    get summary(): {
        pending: number;
        total: number;
        complete: number;
        error: number;
        percent: number;
        start: number;
        end: number;
        duration: number;
        concurrency: number;
    };
    get pending(): any[];
    get complete(): any[];
    get error(): any[];
    constructor();
    concurrency(n: number): void;
    start: <ResultOnSuccess extends any[] = []>() => Promise<ResultOnSuccess>;
    end(callback: onEndCallback): void;
    progress(callback: onProgressCallback): void;
    push<Arguments extends Record<string, any> = {}>(controller: Function, args?: Arguments): number;
    createJob<Arguments extends Record<string, any> = {}>(description: string, controller: Function, args?: Arguments): number;
    find: (id: number) => Controller<any>;
    on(event: "progress" | "end", callback: onProgressCallback | onEndCallback): void;
    solver<ResultOnSuccess = any>(query: BatchFallbackQuery<ResultOnSuccess>): BatchFallbackSolver<ResultOnSuccess>;
    updateControllerStatus(controllerId: number, status: Controller["status"]): boolean;
    updateControllerResult(controllerId: number, result: any): boolean;
}
export type Batch = IBatch | _batch;
export type BatchConfig = Partial<{
    concurrency: number;
    end: onEndCallback;
    progress: onProgressCallback;
}>;
export declare function createBatch(config?: BatchConfig): Batch;
