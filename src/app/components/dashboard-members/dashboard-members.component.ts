import { Component, OnInit, ViewChild } from '@angular/core';
import { MeService } from 'src/app/services/me.service';
import { QueryMap, ApiService } from 'src/app/services/api.service';
import { mergeMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { TrelloMember } from 'src/app/models/trello-member';
import * as moment from 'moment';
import { of } from 'rxjs';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-dashboard-members',
  templateUrl: './dashboard-members.component.html',
  styleUrls: ['./dashboard-members.component.css']
})
export class DashboardMembersComponent implements OnInit {

  private membersDbName = 'trello_members';
  private home_lc_id = 0;

  @ViewChild('closeModalButton', { read: false, static: false }) closeModalButton;
  memberForm: FormGroup;
  submitting: boolean = false;

  openAsAdd: boolean = false;
  openAsEdit: boolean = false;
  editIndex: number = -1;

  errorMsg: string = '';

  constructor(
    private me: MeService,
    private cache: CacheService,
    private api: ApiService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    if (!this.members) this.getMembers();
    this.setupMemberForm();
  }

  get members(): TrelloMember[] {
    return this.cache.members;
  }

  getMembers(): void {
    this.me.me$.pipe(
      mergeMap(me => {
        if (me) {
          this.home_lc_id = me['home_lc_id'];

          const params: QueryMap = {
            'transform': '1',
            'filter': `lc_id,eq,${this.home_lc_id}`
          };

          return this.api.getEntitiesByFilter<any[]>(this.membersDbName, params, [])
        } else {
          return of(null);
        }
      })
    ).subscribe(members => {
      if (members) this.cache.setMembers(members);
    })
  }

  setupMemberForm(): void {
    this.memberForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      trello_username: new FormControl('', Validators.required),
      expa_id: new FormControl('', Validators.required),
    });
  }

  openAdd() {
    this.openAsAdd = true;
  }

  openEdit(index: number) {
    if (index >= 0 && index < this.members.length) {
      this.openAsEdit = true;
      this.editIndex = index;
      this.memberForm.patchValue({
        name: this.members[index].name,
        trello_username: this.members[index].trello_username,
        expa_id: this.members[index].expa_id
      })
    }    
  }

  cleanModal() {
    this.openAsAdd = false;
    this.openAsEdit = false;
    this.editIndex = 0;
    this.submitting = false;
    this.errorMsg = '';
    this.memberForm.reset();
  }

  submitModal() {
    const val = this.memberForm.value;
    if (val.name && val.trello_username) {
      this.errorMsg = '';

      const body = {
        lc_id: this.home_lc_id,
        name: val.name,
        trello_username: val.trello_username,
        expa_id: val.expa_id,
        stamp: moment().format()
      };

      if (this.openAsAdd) this.add(body);
      else if (this.openAsEdit) this.put(body);
    } else {
      // show error message
      this.errorMsg = 'Please fill out the form.';
    }
  }

  private add(body: any) {
    this.submitting = true;
    this.api.httpPost(`${this.membersDbName}`, body).subscribe(result => {
      if (result) {
        // close and clean modal
        this.closeModalButton.nativeElement.click();

        // reload members
        this.cache.clearMembers();
        this.getMembers();
      } else {
        // show error message
        this.submitting = false;
        this.errorMsg = 'Something went wrong... Is the person already registered on Trello?';
      }      
    }, _ => {
      // show error message
      this.submitting = false;
      this.errorMsg = 'Something went wrong... Please get in touch ("Help" tab) if this error persists.';
    })
  }

  private put(body: any) {
    const memberId = this.members[this.editIndex].id;

    // prevent editing of lc_id
    delete body['lc_id'];

    this.submitting = true;
    this.api.httpPut(`${this.membersDbName}/${memberId}`, body).subscribe(result => {
        if (result) {
          // close and clean modal
          this.closeModalButton.nativeElement.click();

          // reload members
          this.cache.clearMembers();
          this.getMembers();
        } else {
          // show error message
          this.submitting = false;
          this.errorMsg = 'Something went wrong... Is the person already registered on Trello?';
        }
      }, _ => {
        // show error message
        this.submitting = false;
        this.errorMsg = 'Something went wrong... Please get in touch ("Help" tab) if this error persists.';
    })
  }

  delete(index: number) {
    if (index >= 0 && index < this.members.length) {
      if (confirm(`Are you sure you want to remove ${this.members[index].name} from the team?`)) {
        const memberId = this.members[index].id;
        this.api.httpDelete(`${this.membersDbName}/${memberId}`).subscribe(result => {
          // remove member
          let members = this.members;
          members.splice(index, 1);
          this.cache.setMembers(members);
        });
      }
    }
  }
  
}
