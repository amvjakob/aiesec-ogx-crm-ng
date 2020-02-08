import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

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
    private router: Router
  ) { }

  ngOnInit() {
    // check if user is already logged in
    if (this.authenticationService.isLoggedIn()) {
      // redirect to dashboard
      this.router.navigateByUrl('/dashboard');
    }
  }

  onSubmit() {
    if (!this.submitting) {
      
      // todo: check email validity and min length
      if (this.email && this.pwd) {
        this.clearMessages();
        this.submitting = true;

        this.authenticationService.login(this.email, this.pwd)
          .subscribe(result => {
            if (result && result.access_token) {
              this.router.navigateByUrl('/dashboard');

            } else {
              this.clearMessages();
              this.setErrorMsg();
            }

            this.submitting = false;
          }, _ => {
            this.submitting = false;
          });
      }
    }
  }

  private clearMessages(): void {
    this.errorMsg = '';
  }

  private setErrorMsg(): void {
    this.errorMsg = 'Invalid email address or password. Please try again.'; 
  }

}
