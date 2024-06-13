import { Batch } from "./batcher";
import { BatchFallbackSolver } from "./batcher.fallback.query";

export class BatcherJob< Arguments extends Record< string , any > = {} , Result = any >{

  execute( args:Arguments ):Promise<Result>{
    return Promise.resolve( null );
  }

  solver( batch:Batch , needs:number[] ){
    return ( ...args:[] ) => {
      return batch.solver({
        find : { id : needs },
        args : args,
        on : {
          success(next, reject, result) {
  
            try{
              next( this.execute )
            }catch(error){
              reject(error);
            }
  
          },
          error(reject) {
            reject(false)
          },
          pending(wait) {
            wait();
          },
        }
      })
    }
  }

}