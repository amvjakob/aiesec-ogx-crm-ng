import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable()
export class LoggingInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.production) console.log(`--> ${req.method} ${req.urlWithParams}`);
    return next.handle(req);
  }     
}