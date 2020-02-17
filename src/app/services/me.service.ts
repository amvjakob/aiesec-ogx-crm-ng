import { Injectable, EventEmitter } from '@angular/core';
import { Subject, BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { mergeMap, map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  me$ = new Observable<any>();
  isAdmin$ = new Observable<boolean>();

  constructor(
    private api: ApiService
  ) { }

  public loadMe(): void {
    this.me$ = this.api.httpGetAny<any>(environment.meEndpoint, false, {}).pipe(
      shareReplay(1)
    )

    this.isAdmin$ = this.me$.pipe(
      map(me => this.isUserAdmin(me))
    )
  }

  public deleteMe(): void {
    this.me$ = of(null);
    this.isAdmin$ = of(false);
  }

  public isUserAdmin(me: any): boolean {
    return me && me.id && environment.adminIds.includes(me.id);
  }

  public formatName(me: any): string {
    if (me) {
      if (this.isUserAdmin(me)) {
        return 'Admin';
      } else {
        if (me.middle_names) {
          return [me.first_name, me.middle_names.join(' '), me.last_name].join(' ');
        } else {
          return [me.first_name, me.last_name].join(' ');
        }
      }
    }
    return undefined;
  }

  get formatName$(): Observable<string> {
    return this.me$.pipe(
      map(me => this.formatName(me))
    );
  }
}
