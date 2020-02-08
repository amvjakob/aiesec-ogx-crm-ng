import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { MeService } from 'src/app/services/me.service';
import { ApiService, QueryMap } from 'src/app/services/api.service';
import { mergeMap } from 'rxjs/operators';
import { Log } from 'src/app/models/log';
import { of } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  meName: string;

  logs: Log[];
  private logDbName = 'push_log';

  tableLen = 10;

  constructor(
    private authenticationService: AuthenticationService,
    private api: ApiService,
    private router: Router,
    public meService: MeService
  ) { }

  ngOnInit() {
    this.meService.me$.subscribe(me => {
      if (me) this.meName = this.meService.formatName();
    })
    this.getLogs();
  }

  private getLogs() {
    this.meService.me$.pipe(
      mergeMap(me => {
        if (me) {
          const params: QueryMap = {
            'transform': '1',
            'filter': `lc_id,eq,${me['home_lc_id']}`
          };
          return this.api.getEntitiesByFilter<any[]>(this.logDbName, params, [])
        } else {
          return of(null);
        }
      })
    ).subscribe(logs => {
      if (logs) this.logs = logs;
    })
  }
}
