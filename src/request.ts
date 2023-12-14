import { FetchFactory , IFetchFactory } from './index';

export const Get = ( headers:IFetchFactory['headers'] = {} ) => {
  return FetchFactory<any, any>({
    caller: fetch.bind(window),
    method: "GET",
    headers: headers,
  });
}

export const Post = ( headers:IFetchFactory['headers'] = {} ) => {
  return FetchFactory<any, any>({
    caller: fetch.bind(window),
    method: "POST",
    headers: headers
  });
}

export const Put = ( headers:IFetchFactory['headers'] = {} ) => {
  return FetchFactory<any, any>({
    caller: fetch.bind(window),
    method: "PUT",
    headers: headers,
  });
}

export const Patch = ( headers:IFetchFactory['headers'] = {} ) => {
  return FetchFactory<any, any>({
    caller: fetch.bind(window),
    method: "PATCH",
    headers: headers,
  });
}

export const Delete = ( headers:IFetchFactory['headers'] = {} ) => {
  return FetchFactory<any, any>({
    caller: fetch.bind(window),
    method: "DELETE",
    headers: headers,
  });
}