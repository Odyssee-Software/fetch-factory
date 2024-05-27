export * from './config';
export * from './request';

export * from './batcher';

/**
   * Fonction de requête HTTP réutilisable créée par FetchFactory.
   * @param endpoint - L'URL de l'endpoint à appeler.
   * @param data - Les données à envoyer avec la requête (facultatif).
   * @returns Une promesse qui résout avec les données de la réponse.
*/
export type TFetchFactory<DATA_TYPE,RETURN_DATA_TYPE> = (endpoint:string , data?:DATA_TYPE) => Promise<RETURN_DATA_TYPE>

/**
 * Spécifie les propriétés attendues par la fonction FetchFactory pour configurer une requête HTTP.
 */
export interface IFetchFactory{
  /** La fonction utilisée pour effectuer la requête HTTP. */
  caller:Function;
  /** La méthode de la requête HTTP (GET, POST, PATCH ou DELETE). */
  method:'GET'|'POST'|'PUT'|'PATCH'|'DELETE';
  /** Les en-têtes de la requête HTTP. */
  headers?:Record<string,string>;
}

/**
 * Crée une fonction réutilisable pour effectuer des requêtes HTTP avec des options spécifiques.
 * @param options - Les options de la requête HTTP, définies par l'interface IFetchFactory.
 * @returns Une fonction qui renvoie une promesse contenant les données de la réponse.
 */
export const FetchFactory = <DATA_TYPE,RETURN_DATA_TYPE>(options:IFetchFactory):TFetchFactory<DATA_TYPE,RETURN_DATA_TYPE> => {

  if('headers' in options == false)options.headers = {};

  /**
   * Fonction de requête HTTP réutilisable créée par FetchFactory.
   * @param endpoint - L'URL de l'endpoint à appeler.
   * @param data - Les données à envoyer avec la requête (facultatif).
   * @returns Une promesse qui résout avec les données de la réponse.
   */
  return ( endpoint:string , data?:DATA_TYPE ) => {

    return new Promise((next,reject) => {
      options.caller( endpoint , {
        method : options.method,
        headers : ( options.headers ? options.headers : {} ),
        ...( data ? { 
          body : ( typeof data == 'string' ? data : JSON.stringify(data) ) 
        } : {} )
      } )
      .then(async (result) => {
        let response = await result.text();
        try{
          next( JSON.parse(response) );
        }
        catch(error){
          next( response );
        }
      })
      .catch(reject)

    })

  }

}