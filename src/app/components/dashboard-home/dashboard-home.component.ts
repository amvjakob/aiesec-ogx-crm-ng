import { Component, OnInit, ViewChild } from '@angular/core';
import { MeService } from 'src/app/services/me.service';
import { ApiService, QueryMap } from 'src/app/services/api.service';
import { mergeMap } from 'rxjs/operators';
import { Log } from 'src/app/models/log';
import { of } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CacheService } from 'src/app/services/cache.service';
import { Chart } from 'angular-highcharts';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

// number of logs to show
const nLogs = 3;

// number of news to show
const nNews = 3;

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  private logDbName = 'push_log';
  private newsDbName = 'news';

  @ViewChild('closeModalButton', { read: false, static: false }) closeModalButton;
  pushForm: FormGroup;
  submitting: boolean = false;

  errorMsg: string = '';

  chart: Chart = undefined;

  constructor(
    public me: MeService,
    private api: ApiService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private cache: CacheService
  ) { }

  ngOnInit() {
    if (!this.logs) this.getLogs();
    if (!this.stats) this.getStats();
    if (!this.news) this.getNews();

    // init push form
    this.pushForm = this.formBuilder.group({
      expa_id: new FormControl('', Validators.required),
    });
  }

  private getStats(): void {
    this.api.httpGetAny<any>(environment.statsEndpoint, false, {})
      .subscribe(stats => {
        this.cache.setStats(stats);
        this.initChart(stats);
      });
  }

  private getNews(): void {
    const params: QueryMap = {
      'order': 'id,desc',
      'page': `1,${nNews}`,
      'transform': '1',
    };
    this.api.getEntitiesByFilter<any[]>(this.newsDbName, params, [])
      .subscribe(news => {
        this.cache.setNews(news);
      });
  }

  private initChart(stats: any): void {
    const format = (stamp) => this.datePipe.transform(stamp, 'dd.MM.')
    let data = [];
    let addNewPoint = true;
    (stats.logs_period as Log[]).forEach((el, i, arr) => {
      if (addNewPoint) {
        // add new point
        data.push({
          start: moment(el.stamp),
          label: format(el.stamp),
          value: el.n
        })
        addNewPoint = false;
      } else {
        // add value
        data[data.length - 1].value += el.n;
      }

      // check next point
      if (i == arr.length - 1 || moment(arr[i + 1].stamp).diff(data[data.length - 1].start, 'days', true) >= 1) {
        addNewPoint = true;

        // add label to previous point
        //data[data.length - 1].label += ' - ' + format(el.stamp);
      }
    });

    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: 'Daily sign-ups'
      },
      credits: {
        enabled: false
      },
      series: [
        {
          name: 'Daily sign-ups',
          data: data.map(d => d.value),
          type: 'spline'
        }
      ],
      yAxis: [
        {
          title: {
            text: 'Number of sign-ups'
          }
        }
      ],
      xAxis: [
        {
          labels: {
            formatter: function () {
              let index = this.pos
              return Number.isInteger(index) ? data[index].label : '';
            }
          }
        }
      ]
    });
  }

  private getLogs(): void {
    this.me.me$.pipe(
      mergeMap(me => {
        if (me) {
          const params: QueryMap = {
            'order': 'id,desc',
            'filter': `lc_id,eq,${me['home_lc_id']}`,
            'page': `1,${nLogs}`,
            'transform': '1',
          };
          return this.api.getEntitiesByFilter<any[]>(this.logDbName, params, [])
        } else {
          return of(null);
        }
      })
    ).subscribe(logs => {
      if (logs) {
        this.cache.setLogs(logs);
      } 
    })
  }

  get stats(): any[] {
    return this.cache.stats;
  }

  get logs(): Log[] {
    return this.cache.logs;
  }

  get news(): any[] {
    return this.cache.news;
  }

  public nLogs(logs: any[]) {
    return logs ? logs.reduce((acc, curr) => acc + curr['n'], 0) : 0;
  }

  cleanModal() {
    this.submitting = false;
    this.errorMsg = '';
    this.pushForm.reset();
  }

  submitModal() {
    const val = this.pushForm.value;
    if (val.expa_id) {
      this.errorMsg = '';
      this.push(val.expa_id);
    } else {
      // show error message
      this.errorMsg = 'Please fill out the form.';
    }
  }

  public push(id?: number): void {
    this.submitting = true;

    const url = environment.pushEndpoint;
    const params = id ? { 'id': `${id}` } : {};

    this.api.httpGetAny<any>(url, false, params).subscribe(result => {
      if (result) {
        // close and clean modal
        this.closeModalButton.nativeElement.click();

        // reload logs
        this.cache.clearLogs();
        this.getLogs();
      } else {
        // show error message
        this.submitting = false;
        this.errorMsg = 'Something went wrong... Is the person on EXPA?';
      }
    }, _ => {
      // show error message
      this.submitting = false;
      this.errorMsg = 'Something went wrong... Please get in touch ("Help" tab) if this error persists.';
    })
  }

  public isMobile() {
    var ua = navigator.userAgent;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  }
}
