import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { ModalService } from '../modal/modal.service';
import { DisplayService } from '../service/display.service';
import { EnvService } from '../service/env.service';
import { HeaderService } from '../service/header.service';
import { InitService } from '../service/init.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  errorDiv = false;
  errorMsg: string;
  clientId = "";
  clientSecret = "";
  serviceUrl = "";
  idToken = "";
  userAccessToken = "";
  clientAccessToken = "";
  errorDiv1 = false;
  errorMsg1: string;
  accessToken = "";
  settingsMsg = false;
  faCog = faCog;
  clientTransactionId = "";
  logoutUrl: string;
  @Input() showLogin: boolean;
  @Input() showLogoutAndSettings: boolean;
  @Input() clickableLinks: boolean;
  @Output() onLogin = new EventEmitter();


  constructor(private displayService: DisplayService, private router: Router, private headerService: HeaderService, private modalService: ModalService, private initService: InitService, private env: EnvService) {

  }

  ngOnInit(): void {
    this.serviceUrl =
      localStorage.getItem("serviceUrl") || this.env.baseServiceUrl;
    this.displayService.serviceUrl = this.serviceUrl;
    this.clientSecret =
      localStorage.getItem("clientSecret") || this.env.clientSecret;
    this.clientId = localStorage.getItem("client_id") || this.env.clientId;

    this.idToken = localStorage.getItem("idToken") || this.displayService.idToken;
    this.userAccessToken = localStorage.getItem("userAccessToken") || this.displayService.userAccessToken;
    this.clientAccessToken = localStorage.getItem("clientAccessToken") || this.displayService.bearerToken;
  }

  forceReauthWealth() {
    this.displayService.wealth = true;
    this.displayService.business = false;
    this.displayService.commercial = false;
    this.reAuthenticate("wealth", true, null);
  }

  forceReauthBiz() {
    this.displayService.business = true;
    this.displayService.commercial = false;
    this.displayService.wealth = false;
    this.reAuthenticate("business", false, this.displayService.idToken);
  }

  forceReauthCommercial() {
    this.displayService.commercial = true;
    this.displayService.business = false;
    this.displayService.wealth = false;
    this.reAuthenticate("commercial", true, this.displayService.idToken);
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModalSave(id: string) {
    localStorage.removeItem("accessToken");
    if (
      this.clientId === "" ||
      this.clientSecret === "" ||
      this.serviceUrl === ""
    ) {
      this.errorDiv1 = true;
      this.errorMsg1 = "Invalid client / configuration detail";
    } else {
      this.displayService.serviceUrl = this.serviceUrl;
      this.displayService.clientTransactionId = this.clientTransactionId !== "" ? this.clientTransactionId : this.displayService.clientTransactionId;
      this.displayService.logoutUrl = this.logoutUrl

      this.initService.getBearerToken(this.clientId + ":" + this.clientSecret, this.serviceUrl).subscribe((data) => {
        this.accessToken = data["access_token"];
        this.displayService.bearerToken = this.accessToken
        localStorage.setItem("accessToken", this.accessToken);
        localStorage.setItem("client_id", this.clientId);
        localStorage.setItem("clientSecret", this.clientSecret);
        localStorage.setItem("serviceUrl", this.serviceUrl);
        window["parseTenant"](this.serviceUrl);
        localStorage.setItem("idToken", this.displayService.idToken);
        localStorage.setItem("logoutUrl", this.displayService.logoutUrl || "");
        this.errorDiv1 = false;
        this.errorDiv = false;
        this.errorMsg1 = "";
        this.settingsMsg = false;
        this.modalService.close(id);
      }, (err) => {
        this.errorDiv1 = true;
        if (err.error && err.error.error_description) {
          this.errorMsg1 = err.error.error_description;
        } else {
          this.errorMsg1 = "unable to reach  " + this.serviceUrl;
        }
      });
    }
  }

  closeModalCancel(id: string) {
    this.modalService.close(id);
  }

  doLogout() {
    document.querySelector("body").classList.remove("authenticatedUser");
    window.location.href = this.displayService.logoutUrl ? this.displayService.logoutUrl : "#";
  }

  reAuthenticate(type: string, isReauthenticate: boolean, idToken) {
    this.headerService.stepUp(this.displayService.fingerPrintDna, this.displayService.ipAddress, idToken, this.displayService.userName, type, isReauthenticate).
      subscribe((data) => {
        this.errorDiv = false;
        this.errorMsg = "";
        this.displayService.routeActions(data);
      }, (err) => {
        if (err.error && err.error.errorMessage) {
          this.errorDiv = true;
          this.errorMsg = err.error.errorMessage;
        } else {
          this.errorDiv = true;
          this.errorMsg =
            "Unknown error in authenticating User " + this.displayService.userName;
        }
      }
      );
  }

  enableLogin() {
    this.onLogin.emit();
  }

  onPersonalBanking() {
    this.router.navigate(['welcome']);
  }
  onSelfService() {
    this.router.navigate(['self-service']);
  }
}
