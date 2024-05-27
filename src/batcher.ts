import { chunk } from './array_chunk';
import { BatchFallbackQuery, BatchFallbackSolver, _batchFallbackSolver } from './batcher.fallback.query';
import { TFetchFactory } from './index';
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

export type onProgressCallback = ( progress:BatchProgressEvent & any ) => void;
export type onEndCallback = ( err, results ) => void;

export type Controller<ResultOnSuccess = any> = {
  id : number;
  controller : Function;
  description : string;
  args : Record<string , any>;
  status : "pending" | "done" | "error";
  result? : ResultOnSuccess;
}

export type FnControllers = Controller[];

/* Le code ci-dessus définit une interface `IBatch` dans TypeScript pour gérer le traitement par lots
des contrôleurs. Voici un résumé des fonctionnalités clés fournies par l’interface : */
export interface IBatch{

  fn : FnControllers;
  events : {
    progress : onProgressCallback | null;
    end : onEndCallback | null;
  };

  /** 
   * Définis le niveau de concurrence pour le traitement par lots. Il prend un seul paramètre « n » qui représente le nombre de tâches simultanées pouvant être exécutées en même temps. 
   * En définissant le niveau de simultanéité, vous pouvez contrôler le nombre de tâches traitées simultanément dans le travail par lots. 
  */
  concurrency(n:number):void;

  /** 
   * La méthode `start()` est responsable du lancement du traitement par lots des contrôleurs en file d'attente. 
   * Il renvoie une promesse qui se résout lorsque tous les contrôleurs ont été traités. 
  */
  start():Promise<any>;


  /** 
   * Définis une fonction qui vous permet de définir une fonction de rappel à exécuter lorsque le traitement par lots des contrôleurs est terminé. 
   * La méthode `end` prend un seul paramètre `callback` de type `onEndCallback`, qui est une fonction qui accepte une erreur et les résultats comme arguments. 
  */
  end( callback:onEndCallback ):void;


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
  progress( callback:onProgressCallback ):void;

  /** Utilisée pour ajouter une nouvelle fonction de contrôleur à la file d'attente de traitement par lots. */
  push< Arguments extends Record<string , any> = {} >( controller:Function , arg?:Arguments ):number;

  /* La méthode `createJob` dans la classe `_batch` est utilisée pour ajouter une nouvelle fonction de
  contrôleur à la file d'attente de traitement par lots avec une description, une fonction de
  contrôleur et des arguments spécifiés. */
  createJob< Arguments extends Record<string , any> = {} >( description:string , controller:Function , arg?:Arguments ):number;
  
  /** Utilisée pour enregistrer les écouteurs d'événements pour les événements de progression et de fin dans le système de traitement par lots. */
  on( event: "progress" | "end" , callback: onProgressCallback | onEndCallback ):void;

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
  solver< ResultOnSuccess = any >( query:BatchFallbackQuery< ResultOnSuccess > ):BatchFallbackSolver< ResultOnSuccess >;

  // Query
  find( id:number ):Controller<any>

  updateControllerStatus( controllerId:number , status:Controller["status"] ):boolean;

  status : "idle" | "running";
  summary
  pending : FnControllers;
  complete : FnControllers;
  error : FnControllers;

}

/* La classe `_batch` dans TypeScript implémente un système de traitement par lots avec contrôle de
concurrence, suivi de la progression et gestion des événements. */
export class _batch implements IBatch{

  #_fn:FnControllers = [];
  #_events:IBatch["events"] = {
    progress : null,
    end : null
  };
  #_concurrency : number = 4;

  #_status : "idle" | "running" = "idle";
  #_running_jobStartEventTime:number = null;
  #_running_jobLastEventTime:number = null;

  get fn(){ return this.#_fn };
  get events(){ return this.#_events };
  get status(){ return this.#_status };

  get summary(){

    let pending = this.pending.length,
    total = this.fn.length,
    complete = this.complete.length,
    error = this.error.length;

    return {
      pending: pending,
      total: total,
      complete: complete,
      error : error,
      percent: Math.round(100 - ((pending / total) * 100)),
      start: this.#_running_jobStartEventTime,
      end: this.#_running_jobLastEventTime,
      duration: this.#_running_jobLastEventTime - this.#_running_jobLastEventTime,
      concurrency : this.#_concurrency
    }

  }

  get pending(){
    return this.#_fn.reduce(( result , controller ) => {
      if(controller.status == "pending")result.push(controller);
      return result;
    } , [])
  }

  get complete(){
    return this.#_fn.reduce(( result , controller ) => {
      if(controller.status == "done")result.push(controller);
      return result;
    } , [])
  }

  get error(){
    return this.#_fn.reduce(( result , controller ) => {
      if(controller.status == "error")result.push(controller);
      return result;
    } , [])
  }

  constructor(){

  }

  concurrency( n:number ){ 
    this.#_concurrency = n;
  }

  start = async <ResultOnSuccess extends any[] = []>():Promise< ResultOnSuccess > => {
    
    if(this.#_status == "running")return ;

    this.#_status = "running";
    this.#_running_jobStartEventTime = Date.now();

    let chunks = chunk<Controller>( this.#_fn , this.#_concurrency );
    let results = [] as ResultOnSuccess;

    return new Promise(( final ) => {

      return Promise.all(
        Array.from( chunks , ( chunk , chunkId ) => {
  
          return new Promise(async ( next , reject ) => {
    
            Promise.all( chunk.reduce(( result , controller ) => { 

              let control = controller.controller( controller.args );

              // Ne process pas ce controll qui et done
              if(controller.status && (controller.status == "done" || controller.status == "error"))control = Promise.resolve(controller.result);

              // Recuperation du controller du solver pour l'attribuer à la pille des exécution à effectuer
              if(control instanceof _batchFallbackSolver){

                let result = control.execute( controller.id );
                if(result instanceof Promise){
                  control = result;
                }
              }

              return [ ...result , control ] 

            } , []) as Promise<any>[] )
            .then(( request_results ) => {

              // console.log({ request_results })
      
              results.push( request_results );

              chunks[chunkId].forEach(( controller , i ) => {
                let result = request_results[i];
                let status:'pending' | 'done' | 'error' = this.#_fn[ controller.id ].status; 
                
                // Si le résultat est encore un solver , passage du status à 'pending'.
                if(result instanceof _batchFallbackSolver){
                  status = 'pending';
                }
                // Sinon si le status est `pending` ( pas `done` ou `error` ), passage à `done`.
                else if(status == "pending")status = 'done';

                this.updateControllerStatus( controller.id , status );
                this.updateControllerResult( controller.id , request_results[i] )

                // this.#_fn[ controller.id ] = {
                //   ...this.#_fn[ controller.id ],
                //   result : request_results[i],
                //   status : status,
                // }

              })
      
            })
            .catch(( error ) => {

              // console.log({ error });
      
              results.push( error );
      
              for(let controller of chunks[chunkId]){
                this.#_fn[ controller.id ] = {
                  ...this.#_fn[ controller.id ],
                  status : "error",
                }
              }
      
            })
            .finally(() => {
      
              this.#_running_jobLastEventTime = Date.now();
    
              let progress = {
                ...this.summary,
                chunk : results.length,
                lastChunk : results[ results.length - 1 ]
              };
      
              if( this.#_events["progress"] ){
                this.#_events["progress"]( progress )
              }
    
              next( progress );
      
            })
    
          })
    
        } )
      )
      .finally(async () => {

        let stillPending = this.#_fn.reduce(( result , request ) => {
          // console.log({ request })
          if(request.status == 'pending')result.push(true)
          return result;
        } , []).includes(true);

        console.log({ stillPending })

        if(stillPending){

          this.#_status = "idle";
          final( this.start() )

        }
        else{

          if(this.#_events["end"]){
            this.#_events["end"]( results , null )
          }
  
          this.#_running_jobStartEventTime = null;
          this.#_running_jobLastEventTime = null;
          // this.#_fn = [];
          this.#_status = "idle";
  
          final( results );

        }

      })

    })

  }

  end( callback:onEndCallback ){ 
    this.#_events.end = callback;
  }

  progress( callback:onProgressCallback ){
    this.#_events.progress = callback;
  }

  push< Arguments extends Record<string , any> = {} >( controller:Function , args?:Arguments ):number{ 
    this.#_fn.push( {
      id : this.#_fn.length,
      controller : controller,
      description : `job ${this.#_fn.length}`,
      args : args || null,
      status : 'pending'
    } );
    return this.#_fn[ this.#_fn.length - 1 ].id;
  }

  createJob< Arguments extends Record<string , any> = {} >( description:string , controller:Function , args?:Arguments ):number{
    this.#_fn.push( {
      id : this.#_fn.length,
      controller : controller,
      description : description,
      args : args || null,
      status : 'pending'
    } );
    return this.#_fn[ this.#_fn.length - 1 ].id;
  }

  find = ( id:number ):Controller<any> => {
    return this.#_fn.find(( controller , iterator ) => {
      if(controller.id == id)return controller;
    })
  }

  on( event:"progress" | "end" ,  callback: onProgressCallback | onEndCallback ){ 
    if(event in this.#_events)this.#_events[event] = callback as any;
  }

  solver< ResultOnSuccess = any >( query:BatchFallbackQuery< ResultOnSuccess > ):BatchFallbackSolver<ResultOnSuccess> { 
    return _batchFallbackSolver.init< ResultOnSuccess >( this , query )
  }

  updateControllerStatus( controllerId:number , status:Controller["status"] ):boolean{
    if(this.#_fn[ controllerId ]){
      this.#_fn[ controllerId ].status = status;
      return true;
    }
    return false;
  }

  updateControllerResult( controllerId:number , result:any ):boolean{
    if(this.#_fn[ controllerId ]){
      this.#_fn[ controllerId ].result = result;
      return true;
    }
    return false;
  }

}

export type Batch = IBatch | _batch;

export type BatchConfig = Partial<{
  concurrency:number;
  end:onEndCallback;
  progress:onProgressCallback;
}>;

export function createBatch( config?:BatchConfig ):Batch{

  let batch = new _batch();

  if(config?.concurrency)batch.concurrency( config.concurrency );
  if(config?.end)batch.end( config.end );
  if(config?.progress)batch.progress( config.progress );

  return batch;

}



