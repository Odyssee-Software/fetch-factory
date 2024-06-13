export * from './config';
export * from './request';

export * from './batcher';

/**
   * Fonction de requête HTTP réutilisable créée par FetchFactory.
   * @param endpoint - L'URL de l'endpoint à appeler.
   * @param data - Les données à envoyer avec la requête (facultatif).
   * @returns Une promesse qui résout avec les données de la réponse.
*/
export type TFetchFactory = ( optionalHeaders?:HeadersInit ) => (endpoint:string , data?) => Promise<any>

/**
 * Spécifie les propriétés attendues par la fonction FetchFactory pour configurer une requête HTTP.
 */
export interface IFetchFactory{
  /** La fonction utilisée pour effectuer la requête HTTP. */
  caller:Function;
  /** La méthode de la requête HTTP (GET, POST, PATCH ou DELETE). */
  method:'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  /** Les en-têtes de la requête HTTP. */
  headers?:HeadersInit;
  parser?:( response ) => any;
}

/**
 * Crée une fonction réutilisable pour effectuer des requêtes HTTP avec des options spécifiques.
 * @param options - Les options de la requête HTTP, définies par l'interface IFetchFactory.
 * @returns Une fonction qui renvoie une promesse contenant les données de la réponse.
 */
export const FetchFactory = < CallerResponse extends Record< string , any > = any >(options:IFetchFactory) => {

  if('headers' in options == false)options.headers = {};

  /**
   * Fonction de requête HTTP réutilisable créée par FetchFactory.
   * @param endpoint - L'URL de l'endpoint à appeler.
   * @param data - Les données à envoyer avec la requête (facultatif).
   * @returns Une promesse qui résout avec les données de la réponse.
   */
  return function< InputData extends Record<string , any> = any , OutputData = any >( optionalHeaders?:HeadersInit ){

    return ( endpoint:string , data?:InputData ):Promise< CallerResponse & { output_data?:OutputData  } > => {

      return new Promise((next,reject) => {
        options.caller( endpoint , {
          method : options.method,
          headers : { ...options.headers || {} , ...optionalHeaders || {} },
          ...( data ? { 
            body : ( typeof data == 'string' ? data : JSON.stringify(data) ) 
          } : {} )
        } )
        .then(async (result:CallerResponse) => {

          try{
            if(options.parser)Object.assign( result , { output_data : await options.parser( result ) } );
          }
          catch(error){
            console.error(error);
          }

          next( result );

        })
        .catch(reject)
  
      })
  
    }

  }

}