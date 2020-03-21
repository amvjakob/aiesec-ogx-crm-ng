import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthenticationToken } from 'src/app/models/authentication-token';
import { of } from 'rxjs';
import { MeService } from 'src/app/services/me.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string;
  pwd: string;

  submitting: boolean = false;

  errorMsg: string = '';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private me: MeService
  ) { }

  get host(): string {
    return environment.host;
  }

  ngOnInit() {
    // redirect user to dashboard if already logged in
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/dashboard');
    }

    // get access token from query params
    this.route.queryParams.pipe(
      switchMap(params => {
        if (params && params['token']) {
          this.submitting = true;
          try {
            const token = JSON.parse(decodeURIComponent(params['token'])) as AuthenticationToken;
            return this.authenticationService.checkToken(token);
          } catch (e) {
            this.clearMessages();
            this.setErrorMsg();
            return of(null);
          }
        }
        return of(null);
      })
    ).subscribe(result => {
      this.submitting = false;
      if (result) {
        this.router.navigateByUrl('/dashboard');
      }
    })
  }

  private clearMessages(): void {
    this.errorMsg = '';
  }

  private setErrorMsg(): void {
    this.errorMsg = 'Invalid or missing token.'; 
  }

}
