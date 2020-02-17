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

  today: Date;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private me: MeService
  ) { }

  ngOnInit() {
    this.today = new Date();
  }

  logout() {
    // logout and go to login page
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

}
