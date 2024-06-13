import { Batch, Controller } from ".";

export interface BatchFallbackQuery< ResultOnSuccess >{
  find : { id : number[] };
  args : any;
  on : {
    success : ( next:( fn:Promise<any> ) => void , reject:( value?:any ) => void , result:ResultOnSuccess[] ) => any;
    pending : ( wait:() => void ) => any;
    error : ( reject:( error:any ) => void ) => any;
  }
}

export class _batchFallbackSolver< ResultOnSuccess >{

  batch:Batch;
  query : BatchFallbackQuery< ResultOnSuccess > = null;

  get needs(){
    return this.query.find.id.reduce( ( needs , idToFind ) => {
      let controller = this.batch.find( idToFind );
      if(controller)needs.push(controller);
      return needs;
    } , [ ])
  }

  get needsResult(){
    return this.needs.reduce((results , request) => {
      results.push( request.result );
      return results;
    } , [])
  }

  get pending(){
    return this.needs.reduce(( result , controller ) => {
      if(controller.status == 'pending')result = true;
      return result;
    } , false)
  }

  get resolvable(){
    return this.needs.reduce(( result , controller ) => {
      if(controller.status == 'error')result = false;
      return result;
    } , true)
  }

  constructor( batch:Batch , query:BatchFallbackQuery< ResultOnSuccess > ){

    this.query = query;

    Object.assign( this , {
      get batch(){ return batch }
    } )

  }

  static init< ResultOnSuccess = any >( batch:Batch , query:BatchFallbackQuery< ResultOnSuccess > ):BatchFallbackSolver< ResultOnSuccess >{
    return new _batchFallbackSolver< ResultOnSuccess >( batch , query );
  }

  _onsuccess = null;
  _onerror = null;
  _onwait = null;

  onSucces = () => {

    return ( nextController:Promise<any> ) => {
      this._onsuccess = nextController;
    }

  }

  onWait = ( request:Controller<any>[] ) => {

    return () => {
      // console.log('onWait' , { length : this.batch.fn.length })
      // this.batch.push( () => {
      //   _batchFallbackSolver.init( this.batch , this.query );
      // } );
      // console.log('onWait after push' , { length : this.batch.fn.length })
    }

  }

  onError = ( controllerId:number ) => {

    this.batch.updateControllerStatus( controllerId , 'error' );

    return ( value?:any ) => {
      this._onerror = Promise.resolve( value || false );
    }

  }

  onReject = ( controllerId:number ) => {

    return ( value?:any ) => {
      this.batch.updateControllerStatus( controllerId , 'error' );
      this._onsuccess =  Promise.resolve( value || null )
    }

  }

  execute = ( controllerId:number ) => {

    // Les jobs parents ( interdépendance )
    let needs = this.needs;
    // Ce job est-il en attente ? ( dépendant des jobs parents )
    let isPending = this.pending;
    // Ce job est-il resolvable ( dépendant des jobs parents )
    let isResolvable = this.resolvable;
    // Les resultats actuel des jobs parents
    let needsResult = this.needsResult;

    if(isPending){
      return this.query.on?.pending( this.onWait( needs ) )
    }
    else if(isResolvable){
      this.query.on?.success( this.onSucces() , this.onReject( controllerId ) , needsResult );
      if(!this._onsuccess)this._onsuccess = Promise.reject( console.warn(`REJECT : NO RETURN STATEMENT FOR CONTROLLER ID ${controllerId}`) );
      if(this._onsuccess instanceof Promise == false)this._onsuccess = Promise.resolve( this._onsuccess )
      return this._onsuccess;
    }
    else{
      this.query.on?.error( this.onError( controllerId ) );
      if(!this._onerror)this._onerror = Promise.reject( false );
      if(this._onerror instanceof Promise == false)this._onerror = Promise.reject( this._onerror )
      return this._onerror;
    }

  }

  get find(){ return this.batch.find }

}

export interface BatchFallbackSolver< ResultOnSuccess = any > extends _batchFallbackSolver< ResultOnSuccess >{};