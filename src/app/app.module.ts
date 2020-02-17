import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './http-interceptors';
import { ApiService } from './services/api.service';
import { AuthenticationService } from './services/authentication.service';
import { IsAuthGuard } from './guards/is-auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { DashboardHelpComponent } from './components/dashboard-help/dashboard-help.component';
import { DashboardMembersComponent } from './components/dashboard-members/dashboard-members.component';
import { IsAdminGuard } from './guards/is-admin.guard';
import { DashboardProComponent } from './components/dashboard-pro/dashboard-pro.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    DashboardHomeComponent,
    DashboardHelpComponent,
    DashboardMembersComponent,
    DashboardProComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ],
  providers: [
    httpInterceptorProviders,
    ApiService,
    AuthenticationService,
    IsAuthGuard,
    IsAdminGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
