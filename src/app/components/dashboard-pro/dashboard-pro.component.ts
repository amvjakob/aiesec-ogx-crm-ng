import { Component, OnInit } from '@angular/core';
import { Log } from 'src/app/models/log';
import { TrelloMember } from 'src/app/models/trello-member';
import { MeService } from 'src/app/services/me.service';
import { mergeMap } from 'rxjs/operators';
import { QueryMap, ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-pro',
  templateUrl: './dashboard-pro.component.html',
  styleUrls: ['./dashboard-pro.component.css']
})
export class DashboardProComponent implements OnInit {

  logs: Log[];
  members: TrelloMember[][];

  private logDbName = 'push_log';
  private memberDbName = 'trello_members';

  public lcs: {
    name: string;
    id: number;
  }[];

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    // get lcs
    this.api.httpGetAny<any[]>(environment.lcsEndpoint, false, {}, [])
      .subscribe(lcs => {
        this.lcs = lcs;

        this.getLogs();
        this.getMembers();
      })
  }

  private getLatestLog(lcId: number): Observable<Log> {
    const params: QueryMap = {
      'transform': '1',
      'order': 'id,desc',
      'filter': `lc_id,eq,${lcId}`
    };
    return this.api.getEntityByFilter<Log>(this.logDbName, params);
  }

  private getLogs(): void {
    // get latest log from every LC
    forkJoin(
      this.lcs.map(lc => this.getLatestLog(lc.id))
    ).subscribe(result => {
      this.logs = result;
    })
  }

  private getLCMembers(lcId: number): Observable<TrelloMember[]> {
    const params: QueryMap = {
      'transform': '1',
      'filter': `lc_id,eq,${lcId}`
    };
    return this.api.getEntitiesByFilter<any[]>(this.memberDbName, params, [])
  }

  private getMembers(): void {
    // get members from every LC
    forkJoin(
      this.lcs.map(lc => this.getLCMembers(lc.id))
    ).subscribe(result => {
      this.members = result;
    })
  }

}
