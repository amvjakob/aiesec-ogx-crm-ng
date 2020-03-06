import { Injectable } from '@angular/core';
import { Log } from '../models/log';
import { TrelloMember } from '../models/trello-member';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private _logs: Log[] = undefined;
  private _members: TrelloMember[] = undefined;
  private _stats: any = undefined;
  private _news: any[] = undefined;

  constructor() { }

  public clear(): void {
    this.clearLogs();
    this.clearMembers();
    this.clearStats();
    this.clearNews();
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

  public setStats(stats: any): void {
    this._stats = stats;
  }
  public clearStats(): void {
    this.setStats(undefined);
  }

  public setNews(news: any[]): void {
    this._news = news;
  }
  public clearNews(): void {
    this.setNews(undefined);
  }
  
  get logs(): Log[] {
    return this._logs;
  }

  get members(): TrelloMember[] {
    return this._members;
  }

  get stats(): any {
    return this._stats;
  }

  get news(): any[] {
    return this._news;
  }
  
}
