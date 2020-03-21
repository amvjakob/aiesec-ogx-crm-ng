import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import * as moment from 'moment';

import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

import { AuthenticationToken } from '../models/authentication-token';
import { AuthenticationUser } from '../models/authentication-user';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MeService } from './me.service';
import { CacheService } from './cache.service';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

export const TOKEN = 'expa_token';

@Injectable()
export class AuthenticationService {

  private loginStatusSource = new Subject<boolean>();
  loginStatus$ = this.loginStatusSource.asObservable();

  constructor(private http: HttpClient,
    private me: MeService,
    private cache: CacheService) { }

  public login(email: string, password: string): Observable<AuthenticationToken> {
    let user = new AuthenticationUser(email, password);

    return this.http
      .post<AuthenticationToken>(environment.authEndpoint, user, httpOptions)
      .pipe(
        tap(tokenJson => this.setSession(tokenJson)),
        shareReplay() // prevent accidental additional calls
      );
  }

  public checkToken(token: AuthenticationToken): Observable<boolean> {
    this.setSession(token);
    return this.me.me$.pipe(
      tap(m => m && m.code && m.code === 403 && m.message ? this.logout() : null)
    )
  }

  public setSession(authResult: AuthenticationToken): void {
    if (authResult) {
      localStorage.setItem(TOKEN, JSON.stringify(authResult));
      this.loginStatusSource.next(this.isLoggedIn());
      this.me.loadMe();
    }
  }
  
  public getAccessToken(): string {
    if (this.isLoggedIn()) {
      const token = localStorage.getItem(TOKEN);

      if (token) {
        const tokenJson = JSON.parse(token) as AuthenticationToken;
        if (tokenJson && tokenJson.access_token) {
          return tokenJson.access_token;
        }
      }
    }

    return undefined;
  }

  logout(): void {
    localStorage.removeItem(TOKEN);
    this.loginStatusSource.next(this.isLoggedIn());

    this.me.deleteMe();
    this.cache.clear();
  }

  public isLoggedIn(): boolean {
    return localStorage.getItem(TOKEN) &&
      moment().isBefore(this.getExpiration());
  }

  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  public isExpired(): boolean {
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
