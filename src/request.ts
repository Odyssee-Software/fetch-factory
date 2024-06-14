import { FetchFactory , IFetchFactory } from './index';

export interface ICRUDFactory{
    /** La fonction utilisée pour effectuer la requête HTTP. */
    caller:IFetchFactory["caller"];
    /** Les en-têtes de la requête HTTP. */
    headers?:IFetchFactory["headers"];
    parser?:IFetchFactory["parser"];
}

export function RequestFactory< Response = any >( options:ICRUDFactory ){

  return {
    Get : FetchFactory< Response >({
      caller: options.caller,
      method: "GET",
      headers: options.headers,
      parser : options.parser
    }),
    Post : FetchFactory< Response >({
      caller: options.caller,
      method: "POST",
      headers: options.headers,
      parser : options.parser
    }),
    Put : FetchFactory< Response >({
      caller: options.caller,
      method: "PUT",
      headers: options.headers,
      parser : options.parser
    }),
    Patch : FetchFactory< Response >({
      caller: options.caller,
      method: "PATCH",
      headers: options.headers,
      parser : options.parser
    }),
    Delete : FetchFactory< Response >({
      caller: options.caller,
      method: "DELETE",
      headers: options.headers,
      parser : options.parser
    })
  }

}