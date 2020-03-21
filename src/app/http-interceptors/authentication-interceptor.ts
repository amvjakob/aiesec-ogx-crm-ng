import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpEventType
} from '@angular/common/http';

import * as moment from 'moment';

import { Observable, of } from 'rxjs';

import { AuthenticationService, TOKEN } from '../services/authentication.service';
import { AuthenticationToken } from '../models/authentication-token';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let isLoginCall = req.method === 'POST' &&
      req.url.split('/').includes('login.php') &&
      req.body && Object.keys(req.body).length && 
      Object.keys(req.body).includes('_email') && 
      Object.keys(req.body).includes('_pwd');

    // skip interceptor if the authorization already present,
    // or if we try to log in
    let shouldSkipInterceptor = req.headers.has('Authorization') ||
      isLoginCall;

    if (shouldSkipInterceptor) {
      return next.handle(req);
    }

    if (this.isValidToken()) {
      const cloned = this.authorizeRequest(req);
  
      if (!environment.production)
        console.log(`Authorized request: ${cloned.method} ${cloned.urlWithParams}`);

      return next.handle(cloned); /*.pipe(
        tap(result => {
          if (result.type === HttpEventType.Response) {
            if (result.body && result.body.code && result.body.code === 403 && result.body.message) {
              // token is not valid
              this.authService.logout(true);
            }
          }
        })
      );*/
    } else {
      // console.log(`Logging in before request: ${req.method} ${req.urlWithParams}`);
      
      // user doesn't have a valid token, and is not trying to log in
      // --> request will get denied
      // --> we logout user

      if (!environment.production)
        console.log(`Unauthorized request: ${req.method} ${req.urlWithParams}`);      

      return next.handle(req);
    }
  }     

  private authorizeRequest(req: HttpRequest<any>) : HttpRequest<any> {
    let token = localStorage.getItem(TOKEN);
    let tokenJSON = JSON.parse(token) as AuthenticationToken;

    return req.clone({
      headers: req.headers.set("Authorization",
        "Bearer " + tokenJSON.access_token)
    });
  }

  private isValidToken(): boolean {
    let token = localStorage.getItem(TOKEN);

    if (token) {
      let tokenJson = JSON.parse(token) as AuthenticationToken;
      return tokenJson && tokenJson.access_token && !this.isExpired();
    }

    return false;
  }

  private isExpired(): boolean {
    const expiration = this.getExpiration();

    return !(expiration && expiration.isAfter(moment()));
  }

  getExpiration(): moment.Moment {
    const token = localStorage.getItem(TOKEN);

    if (token) {
      const tokenJson = JSON.parse(token) as AuthenticationToken;
      if (tokenJson && tokenJson.expires_at) {
        return moment(tokenJson.expires_at)
      }
    }

    return null;
  }
}