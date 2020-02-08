import { CanActivate, Router } from "@angular/router";
import { AuthenticationService } from "../services/authentication.service";
import { Injectable } from "@angular/core";

@Injectable()
export class IsAuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { }

  canActivate() {
    const isLoggedIn = this.authService.isLoggedIn();

    if (!isLoggedIn) {
      this.authService.logout();
      this.router.navigateByUrl('/login');
    }

    return isLoggedIn;
  }

}