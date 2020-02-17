import { Component, OnInit } from '@angular/core';
import { MeService } from './services/me.service';
import { AuthenticationService } from './services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'aiesec-ogx-crm';

  constructor(
    private auth: AuthenticationService,
    private me: MeService
  ) { }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.me.loadMe();
    }
  }
}
