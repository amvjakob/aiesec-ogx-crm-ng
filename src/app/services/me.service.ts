import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  me: any = null;
  me$ = new BehaviorSubject<any>(null);
  isAdmin$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  public setMe(me: any): void {
    this.me = me;
    this.me$.next(me);
    this.isAdmin$.next(this.isMeAdmin());
  }

  public getMe(): any {
    return this.me;
  }

  public isMeSet(): boolean {
    return this.me != null;
  }

  public isMeAdmin(): boolean {
    return this.me && this.me.id && this.me.id === environment.adminId;
  }

  public formatName(): string {
    if (this.me) {
      if (this.isMeAdmin()) {
        return 'Admin';
      } else {
        if (this.me.middle_names) {
          return [this.me.first_name, this.me.middle_names.join(' '), this.me.last_name].join(' ');
        } else {
          return [this.me.first_name, this.me.last_name].join(' ');
        }
      }
    }
    return undefined;
  }
}
