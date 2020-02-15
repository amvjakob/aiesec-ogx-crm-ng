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
    private me: MeService) { }

  public login(email: string, password: string): Observable<AuthenticationToken> {
    let user = new AuthenticationUser(email, password);

    return this.http.post<AuthenticationToken>(environment.authEndpoint, user, httpOptions).pipe(
      tap(tokenJson => this.setSession(tokenJson)),
      
      shareReplay() // prevent accidental additional calls
    );
  }

  private setSession(authResult: AuthenticationToken): void {
    if (authResult) {
      localStorage.setItem(TOKEN, JSON.stringify(authResult));
      this.loginStatusSource.next(this.isLoggedIn());
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

    this.me.setMe(null);
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
