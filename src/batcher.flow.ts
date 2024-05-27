import { createBatch , BatchConfig, Batch, onProgressCallback  } from './batcher';
import { BatchFallbackQuery, BatchFallbackSolver } from './batcher.fallback.query';
import { BatcherJob } from './batcher.job';

export class BatcherMergedStep{

  // Context d'éxécution du Flow
  flow:BatcherWorkflow = null;
  // Getter du batcher responsable des jobs
  get batch(){ return this.flow.batch; }
  jobs:( ( BatcherWorkflowStep ) | ( BatcherWorkflowLinkStep ) )[];
  jobControllersId:number[] = [];

  constructor( flow : BatcherWorkflow , steps:( ( BatcherWorkflowStep ) | ( BatcherWorkflowLinkStep ) )[] ){
    this.flow = flow;
    this.jobControllersId = steps.reduce(( ids , step ) => {
      ids.push(step.jobControllerId);
      return ids;
    } , []);
  }

  static init( flow : BatcherWorkflow , steps:( ( BatcherWorkflowStep ) | ( BatcherWorkflowLinkStep ) )[] ){
    return new BatcherMergedStep( flow , steps )
  }

  next< Arguments extends Record< string , any > = {} , Result = any >( job:typeof BatcherJob< Arguments , Result > , args:Arguments ){

    let linked_step = new BatcherWorkflowLinkStep( this.jobs[0] , job , args);
    
    this.jobs.forEach(( job ) => {
      job.linked.set( `${linked_step.jobControllerId}` , job as any )
    })
  }

}

export class BatcherWorkflowStep< Arguments extends Record< string , any > = {} >{

  // Argument de l'étape
  args:Arguments = null;
  // Context d'éxécution du Flow
  flow:BatcherWorkflow = null;
  // Getter du batcher responsable des jobs
  get batch(){ return this.flow.batch; }
  // Job de l'étpe
  job:typeof BatcherJob< Record< string , any > , any > = null;
  // Controller exécutable du job
  jobController:( ( ( args:Record<string, any> ) => Promise<any> ) | ( ( ...args:[] ) => BatchFallbackSolver<any> ) ) = null;
  // JobId au seins du batcher
  jobControllerId:number = null;
  // Jobs enfants de l'étape
  linked:Map< string , BatcherWorkflowLinkStep > = new Map();
  
  constructor( flow:BatcherWorkflow , job:typeof BatcherJob< Record< string , any > , any > , args:Arguments ){
    this.flow = flow;
    this.args = args;
    this.job = job;

    if( this instanceof BatcherWorkflowStep ){
      this.jobController = new job().execute;
      this.jobControllerId = this.batch.push( this.jobController , args );
    }

  }

  next< Arguments extends Record< string , any > = {} , Result = any >( job:typeof BatcherJob< Arguments , Result > , args:Arguments ){
    return new BatcherWorkflowLinkStep( this , job , args );
  }

}

export class BatcherWorkflowLinkStep< Arguments extends Record< string , any > = {} , Result = any > extends BatcherWorkflowStep< Arguments >{

  parent_step:BatcherWorkflowStep | BatcherWorkflowLinkStep;
  needs : number[] = [];
  
  constructor( step:BatcherWorkflowStep | BatcherWorkflowLinkStep ,  job:typeof BatcherJob< Record< string , any > , any > , args:Arguments ){
    super( step.flow , job , args );
    this.parent_step = step;

    this.parent_step.linked.set( `${this.jobControllerId}` , this );
    this.needs.push( this.parent_step.jobControllerId );

    if(this instanceof BatcherWorkflowLinkStep){
      this.jobController = new job().solver( this.batch , this.needs );
    }
  }

}

export class BatcherWorkflowStepConsumer< Arguments extends Record< string , any > = {} , Result = any > extends BatcherWorkflowStep< Arguments >{
  
}


export interface IBatcherWorkflowConfig{
  batch:Batch;
}

export class BatcherWorkflow{

  batch:Batch = null;

  entries:Map< string , any > = new Map();

  static init( config : BatchConfig ){

    return new BatcherWorkflow( { batch : createBatch( config ) } )

  }

  constructor( config:IBatcherWorkflowConfig ){
    Object.assign( this , config );
  }

  step< Arguments extends Record< string , any > = {} , Result = any >( job: typeof BatcherJob< Arguments , Result > , args:Arguments ):BatcherWorkflowStep{
    let entryId = this.entries.size;
    this.entries.set( `${entryId}` , new BatcherWorkflowStep< Arguments >( this , job , args ) );
    return this.entries.get( `${entryId}` );
  }

  start( callback?:onProgressCallback ){

    if(callback)this.batch.on('progress' , callback );
    return this.batch.start();

  }

  onProgress( callback:onProgressCallback ){
    this.batch.on('progress' , callback );
  }

  useSteps( steps:( ( BatcherWorkflowStep ) | ( BatcherWorkflowLinkStep ) )[] ){
    return BatcherMergedStep.init( this , steps );
  }

}