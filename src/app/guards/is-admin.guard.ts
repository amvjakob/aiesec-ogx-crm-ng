import { CanActivate, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { MeService } from '../services/me.service';
import { map } from 'rxjs/operators';

@Injectable()
export class IsAdminGuard implements CanActivate {

  constructor(
    private me: MeService,
    private router: Router
  ) { }

  canActivate() {
    return this.me.isAdmin$.pipe(
      map(isAdmin => {
        // redirect to login if user is not admin
        if (!isAdmin) this.router.navigateByUrl('/login');
        return isAdmin;
      })
    );
  }

}