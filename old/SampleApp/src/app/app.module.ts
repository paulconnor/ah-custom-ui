import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BusinessmgmtComponent } from './businessmgmt/businessmgmt.component';
import { CommercialmgmtComponent } from './commercialmgmt/commercialmgmt.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EmailotpComponent } from './emailotp/emailotp.component';
import { FactorselectionComponent } from './factorselection/factorselection.component';
import { FidoComponent } from './fido/fido.component';
import { HeaderComponent } from './header/header.component';
import { InitComponent } from './init/init.component';
import { HttpRequestResponseInterceptor } from './interceptor/http-request-response.interceptor';
import { InvestmgmtComponent } from './investmgmt/investmgmt.component';
import { LdapComponent } from './ldap/ldap.component';
import { ModalComponent } from './modal/modal.component';
import { MotpComponent } from './motp/motp.component';
import { MultiCredentialsComponent } from './multi-credentials/multi-credentials.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PushComponent } from './push/push.component';
import { RememberDeviceComponent } from './remember-device/remember-device.component';
import { SelfServiceComponent } from './self-service/self-service.component';
import { EnvServiceProvider } from './service/env.service.provider';
import { SotpComponent } from './sotp/sotp.component';
import { UserinfoComponent } from './userinfo/userinfo.component';
import { WealthmgmtComponent } from './wealthmgmt/wealthmgmt.component';
import { WelcomeComponent } from './welcome/welcome.component';


@NgModule({
  declarations: [
    AppComponent,
    FidoComponent,
    LdapComponent,
    SotpComponent,
    InitComponent,
    WelcomeComponent,
    ModalComponent,
    FactorselectionComponent,
    PushComponent,
    MotpComponent,
    InvestmgmtComponent,
    BusinessmgmtComponent,
    CommercialmgmtComponent,
    WealthmgmtComponent,
    HeaderComponent,
    EmailotpComponent,
    MultiCredentialsComponent,
    UserinfoComponent,
    RememberDeviceComponent,
    NotFoundComponent,
    SelfServiceComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxQRCodeModule,
    FontAwesomeModule
  ],
  providers: [
    EnvServiceProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestResponseInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
