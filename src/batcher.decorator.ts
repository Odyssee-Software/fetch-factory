export function Description( description:string ){
  return function( target ){

    target.prototype.description = description;

    return target;

  }
}

interface SolverDefinition{

}

export function Solver( config?:SolverDefinition ){

  return function(){
    
  }

}