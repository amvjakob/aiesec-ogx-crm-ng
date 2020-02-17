import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { MeService } from 'src/app/services/me.service';
import { ApiService, QueryMap } from 'src/app/services/api.service';
import { mergeMap } from 'rxjs/operators';
import { Log } from 'src/app/models/log';
import { of } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {

  private logDbName = 'push_log';

  logsPage = 1;
  logsPageLen = 5;
  logsLen = 1;

  @ViewChild('closeModalButton', { read: false, static: false }) closeModalButton;
  pushForm: FormGroup;
  submitting: boolean = false;

  errorMsg: string = '';

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    public me: MeService,
    private cache: CacheService
  ) { }

  ngOnInit() {
    if (!this.logs) this.getLogs();

    // init push form
    this.pushForm = this.formBuilder.group({
      expa_id: new FormControl('', Validators.required),
    });
  }

  private getLogs() {
    this.me.me$.pipe(
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
      if (logs) {
        this.cache.setLogs(logs.reverse());
      } 
    })
  }

  get logs(): Log[] {
    return this.cache.logs ?
      this.cache.logs
        .map((log, i) => {
          log.id = this.cache.logs.length - i;
          return log;
        })
        .slice((this.logsPage - 1) * this.logsPageLen, this.logsPage * this.logsPageLen) :
      this.cache.logs;
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
}
