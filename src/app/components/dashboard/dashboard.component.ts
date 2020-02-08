import { Component, OnInit } from '@angular/core';
import { ApiService, QueryMap } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';
import { MeService } from 'src/app/services/me.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  meName: string;
  today: Date;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private api: ApiService,
    private meService: MeService
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.getMe();
  }

  private getMe(): void {
    const token = this.authService.getAccessToken();
    if (token) {
      const url = environment.meEndpoint;

      this.api.httpGetAny<any>(url, false, {}).subscribe(result => {
        this.meService.setMe(result);
        this.meName = this.meService.formatName();
      })
    }
  }

  logout() {
    // logout and go to login page
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
