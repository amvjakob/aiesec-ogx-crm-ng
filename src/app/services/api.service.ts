import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, tap, map, flatMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// be sure we only use string when passing query string to URL builder
export interface QueryMap {
  [index: string]: string;
}

// http options with authorization for api
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) { }

  /**
   * Get an entity from the ST API
   * @param dbName - name of the db in the API. Can be called via T.dbName
   * @param id - the id of the entity to be retrieved
   * @param options - additional query options
   * @param result - default result to be returned in case of an error
   */
  getEntityById<T>(dbName: string, id: number | string, options?: QueryMap, result?: T): Observable<T> {
    // build the endpoint
    const endpoint = `${dbName}/${id}`;

    // GET the resource
    return this.httpGet<T>(endpoint, options, result);
  }

  /**
   * Get multiple entities from the ST API
   * @param dbName - name of the db in the API. Can be called via T.dbName
   * @param ids - the ids of the entities to be retrieved
   * @param options - additional query options
   * @param result - default result to be returned in case of an error
   */
  getEntitiesByIds<T>(dbName: string, ids: number[] | string[], options?: QueryMap, result?: T): Observable<T> {
    // build the endpoint
    const joinedIds = ids.length ? (ids.length === 1 ? ids[0]+','+ids[0] : ids.join(',')) : '0';
    const endpoint = `${dbName}/${joinedIds}`;

    // GET the resource
    return this.httpGet<T>(endpoint, options, result);
  }

  /**
   * Get an entity from the ST API, with more specific filters
   * @param dbName - name of the db in the API. Can be called via T.dbName
   * @param options - additional query options
   * @param result - default result to be returned in case of an error
   * @returns - the entity matching the filter, if any. If there are multiple matches,
   * this function only returns the first match.
   */
  getEntityByFilter<T>(dbName: string, options: QueryMap, result?: T): Observable<T> {
    // validate transformation flag
    options = this.addTransformationFlag(options);

    return this.getEntitiesByFilter<T[]>(dbName, options, []).pipe(
      flatMap(entities => 
        of(entities && entities.length ? entities[0] : (result || null) as T)
      )
    );
  }

  /**
   * Get multiple entities from the ST API, with more specific filters
   * @param dbName - name of the db in the API. Can be called via T.dbName
   * @param options - additional query options
   * @param result - default result to be returned in case of an error
   */
  getEntitiesByFilter<T>(dbName: string, options: QueryMap, result?: T): Observable<T> {
    // validate query options
    options = this.addTransformationFlag(options);

    return this.httpGet<T>(dbName, options, result).pipe(
     // the api call returns a wrapper around the actual entities
      map(res => res[dbName] || result)
    );
  }

  /**
   * Get all entities of a special class from the ST API
   * @param dbName - name of the db in the API. Can be called via T.dbName
   * @param result - default result to be returned in case of an error
   */
  getAllEntities<T>(dbName: string, result?: T): Observable<T> {
    // no other query params than the transformation flag
    let params: QueryMap = this.addTransformationFlag();

    return this.httpGet<T>(dbName, params, result).pipe(
      // the api call returns a wrapper around the actual entities
      map(res => res[dbName] || result)
    );
  }

  /**
   * Get data from the ST API
   * @param endpoint - the detailed API endpoint to GET a resource from
   * @param options - additional query map
   * @param onErrorResult - default value to return on error
   */
  public httpGet<T>(endpoint: string, options?: QueryMap, onErrorResult?: T): Observable<T> {
    return this.httpGetAny<T>(endpoint, true, options, onErrorResult);
  }

  /**
   * Get data from the ST API
   * @param endpoint - the detailed API endpoint to GET a resource from
   * @param endpointFromApi - determines if endpoint is to be appended to base API url
   * @param options - additional query map
   * @param onErrorResult - default value to return on error
   */
  public httpGetAny<T>(endpoint: string, endpointFromApi: boolean, options?: QueryMap, onErrorResult?: T): Observable<T> {
    // build qualified resource url
    const url = this.buildUrl(endpoint, options, endpointFromApi);

    // message shown in log
    const operationMsg = `GET ${url}`;

    return this.http.get<T>(url, httpOptions).pipe(
      // handle errors
      catchError(
        onErrorResult ?
          this.handleError<T>(operationMsg, onErrorResult) :
          this.handleError<T>(operationMsg)
      )
    );
  }

  /**
   * Post JSON data to the ST API
   * @param endpoint - the detailed API endpoint to POST a resource to
   * @param body - entity to post
   * @param options - additional query map
   * @param onErrorResult - default value to return on error
   */
  public httpPostJson<T>(endpoint: string, body: any, options?: QueryMap, onErrorResult?: T): Observable<T> {
    return this.httpPostJsonAny<T>(endpoint, true, body,
      options || null, onErrorResult || null);
  }

  /**
     * Post JSON data to the ST API
     * @param endpoint - the detailed API endpoint to POST a resource to
     * @param endpointFromApi - determines if endpoint is to be appended to base API url
     * @param body - entity to post
     * @param options - additional query map
     * @param onErrorResult - default value to return on error
     */
  public httpPostJsonAny<T>(endpoint: string, endpointFromApi: boolean, body: any, 
                            options?: QueryMap, onErrorResult?: T): Observable<T> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.httpPostAny<T>(endpoint, endpointFromApi, body,
      headers || null, options || null, onErrorResult || null);
  }

  /**
   * Post form data to the ST API
   * @param endpoint - the detailed API endpoint to POST a resource to
   * @param body - entity to post
   * @param options - additional query map
   * @param onErrorResult - default value to return on error
   */
  public httpPostFormData<T>(endpoint: string, values: object, options?: QueryMap, onErrorResult?: T): Observable<T> {
    return this.httpPostFormDataAny<T>(endpoint, false, values,
      options || null, onErrorResult || null);
  }

  /**
   * Post form data to the ST API
   * @param endpoint - the detailed API endpoint to POST a resource to
   * @param endpointFromApi - attach endpoint to API url or not
   * @param body - entity to post
   * @param options - additional query map
   * @param onErrorResult - default value to return on error
   */
  public httpPostFormDataAny<T>(endpoint: string, endpointFromApi: boolean, 
                                values: object, options?: QueryMap, onErrorResult?: T): Observable<T> {
    var headers = new HttpHeaders();
    headers.append('Content-Type', 'application/form-data');

    // build body
    const body: string = this.buildQueryMap(values as QueryMap);

    return this.httpPostAny<T>(endpoint, endpointFromApi, body,
      headers || null, options || null, onErrorResult || null);
  }


  /**
   * Post data to the ST API
   * @param endpoint - the detailed API endpoint to POST a resource to
   * @param body - entity to post
   * @param headers - optional request headers
   * @param options - optional additional query map
   * @param onErrorResult - optional default value to return on error
   */
  public httpPost<T>(endpoint: string, body: any, headers?: HttpHeaders, options?: QueryMap, onErrorResult?: T): Observable<T> {
    return this.httpPostAny<T>(endpoint, true, body, headers, options, onErrorResult);
  }

  /**
   * Post data to the ST API
   * @param endpoint - the detailed API endpoint to POST a resource to
   * @param endpointFromApi - determines if endpoint is to be appended to base API url
   * @param body - entity to post
   * @param headers - optional request headers
   * @param options - optional additional query map
   * @param onErrorResult - optional default value to return on error
   */
  public httpPostAny<T>(endpoint: string, endpointFromApi: boolean, body: any, headers?: HttpHeaders, options?: QueryMap, onErrorResult?: T): Observable<T> {
    // build qualified resource url
    const url = this.buildUrl(endpoint, options, endpointFromApi);

    // message shown in log
    const operationMsg = `POST ${url}`;

    return this.http.post<T>(url, body, headers ? { headers: headers } : {}).pipe(
      // handle error
      catchError(
        onErrorResult ?
          this.handleError<T>(operationMsg, onErrorResult) :
          this.handleError<T>(operationMsg)
      )
    );
  }

  /**
   * PUT data to the ST API
   * @param endpoint - the detailed API endpoint to PUT a resource to
   * @param body - entity to put
   * @param headers - optional request headers
   * @param options - optional additional query map
   */
  public httpPut(endpoint: string, body: any, headers?: HttpHeaders, options?: QueryMap): Observable<number> {
    // build final resource url
    const url = this.buildUrl(endpoint, options);

    // build log message
    const operationMsg = `PUT ${url}`;

    return this.http.put<number>(url, body, headers? {headers: headers} : {}).pipe(
      // handle error
      catchError(this.handleError<number>(operationMsg, 0))
    )
  }

  /**
   * DELETE a resource from to the ST API
   * @param endpoint - the detailed API endpoint to DELETE a resource from
   * @param headers - optional request headers
   * @param options - optional additional query map
   */
  public httpDelete(endpoint: string, headers?: HttpHeaders, options?: QueryMap): Observable<number> {
    // build final resource url
    const url = this.buildUrl(endpoint, options);

    // build log message
    const operationMsg = `DELETE ${url}`;

    return this.http.delete<number>(url, headers? {headers: headers} : {}).pipe(
      // handle error
      catchError(this.handleError<number>(operationMsg, 0))
    )
  }

  /**
   * Build the API URL
   * @param endpoint - resource to access from api
   * @param options - query options
   * @returns - the full URL to fetch data from
   */
  private buildUrl(endpoint: string, options: QueryMap, endpointFromApi: boolean = true) {
    // create true endpoint
    const path = endpointFromApi ? `${environment.apiEndpoint}/${endpoint}` : endpoint;

    // add query if present
    const url = options && Object.keys(options).length ?
      path + '?' + this.buildQueryMap(options) :
      path;

    return url;
  }

  /**
   * Build the query part of an URL
   * @param options - map of additional queries
   * @returns - the query part of an URL
   */
  private buildQueryMap(options: QueryMap) {
    return Object.keys(options).map(
      key => `${key}=${options[key]}` // concatenate key and value to 'key=value'
    ).join('&'); // join 'key=value' with '&' sign
  }

  /**
   * Validate the 'transformation' flag on a GET query.
   * @param options - current query options. Optional parameter
   * @returns - if the 'transformation' flag is already present, the 
   * original QueryMap is returned. Otherwise, adds the flag and returns
   * the new object.
   */
  private addTransformationFlag(options?: QueryMap): QueryMap {
    if (options && Object.keys(options).length) {
      options['transform'] = '1';
    } else {
      options = { 'transform': '1' };
    }

    return options;
  }

  /**
   * Log information about executed operations
   * @param message - name of the operation that was executed
   */
  private log<T> (message = 'operation') {
    return (_: T) => {
      console.log('performed: ' + message);
    }
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // Log specific message
      console.error("Error for operation: " + operation);

      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
