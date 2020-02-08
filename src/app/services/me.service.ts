import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MeService {

  me: any = null;
  me$ = new BehaviorSubject<any>(null);

  constructor() { }

  public setMe(me: any): void {
    this.me = me;
    this.me$.next(me);
  }

  public getMe(): any {
    return this.me;
  }

  public isMeSet(): boolean {
    return this.me != null;
  }

  public formatName(): string {
    if (this.me) {
      if (this.me.middle_names) {
        return [this.me.first_name, this.me.middle_names.join(' '), this.me.last_name].join(' ');
      } else {
        return [this.me.first_name, this.me.last_name].join(' ');
      }
    }
    return undefined;
  }
}
