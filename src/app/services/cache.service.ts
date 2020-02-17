import { Injectable } from '@angular/core';
import { Log } from '../models/log';
import { TrelloMember } from '../models/trello-member';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private _logs: Log[] = undefined;
  private _members: TrelloMember[] = undefined;

  constructor() { }

  public clear(): void {
    this.clearLogs();
    this.clearMembers();
  }

  public setLogs(logs: Log[]): void {
    this._logs = logs;
  }
  public clearLogs(): void {
    this.setLogs(undefined);
  }

  public setMembers(members: TrelloMember[]): void {
    this._members = members;
  }
  public clearMembers(): void {
    this.setMembers(undefined);
  }
  
  get logs(): Log[] {
    return this._logs;
  }

  get members(): TrelloMember[] {
    return this._members;
  }
  
}
