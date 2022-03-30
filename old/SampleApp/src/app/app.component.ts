import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as uuid from "uuid";
import { BrandingService } from './service/branding.service';
import { DisplayService } from './service/display.service';
import { EnvService } from './service/env.service';
import { InitService } from './service/init.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  idToken: string;
  decoded_id_token: string;
  serviceUrl = "";
  clientId = "";
  clientSecret = "";
  ipAddress: string;

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private router: Router,
    public initService: InitService,
    private env: EnvService,
    public brandingService: BrandingService
  ) { }

  ngOnInit() {
    if (!localStorage.getItem("riskType")) {
      localStorage.setItem("riskType", "IARISK");
    }
    this.displayService.clientTransactionId = uuid.v4();
    this.getGetaz();
    if ("true" === localStorage.getItem("read_local_storage")) {
      this.displayService.logoutUrl = this.env.logoutUrl;
      localStorage.setItem("logoutUrl", this.displayService.logoutUrl || "");
      this.serviceUrl = localStorage.getItem("serviceUrl");
      this.displayService.serviceUrl = this.serviceUrl;
      this.clientSecret = localStorage.getItem("clientSecret");
      this.clientId = localStorage.getItem("client_id");
      this.ipAddress = localStorage.getItem("ipAddress") || "";
    } else {
      this.displayService.logoutUrl = this.env.logoutUrl;
      localStorage.setItem("logoutUrl", this.displayService.logoutUrl || "");
      this.serviceUrl = this.env.baseServiceUrl;
      this.displayService.serviceUrl = this.serviceUrl;
      this.clientSecret = this.env.clientSecret;
      this.clientId = this.env.clientId;
      this.ipAddress = localStorage.getItem("ipAddress") || "";
    }
    this.initService.setLocalStorage(this.displayService.bearerToken, this.clientId, this.clientSecret, this.serviceUrl, this.ipAddress, this.displayService.idToken);
    this.intializeToken();
  }

  getGetaz() {
    this.http.get("/sample-app/getaz", { responseType: "text", observe: "response" }).subscribe((data) => {
      this.idToken = data.headers.get("authorization");
      if (this.idToken) {
        let token = this.idToken.split("Bearer")[1].trim();
        localStorage.setItem("idToken", this.idToken);
        this.decoded_id_token = this.initService.decodeToken(token)[1];
        this.displayService.idToken = token;
      }
      if (this.decoded_id_token) {
        this.displayService.userName = this.decoded_id_token["user_loginid"];
        this.router.navigate(["welcome"]);
      }
    });
  }

  intializeToken() {
    this.initService.getBearerToken(this.clientId + ":" + this.clientSecret, this.serviceUrl).subscribe((data) => {
      this.displayService.bearerToken = data["access_token"];
      this.initService.setLocalStorage(this.displayService.bearerToken, this.clientId, this.clientSecret, this.serviceUrl, this.ipAddress, this.displayService.idToken);
      this.loadBrandingSettings();
      this.initService.settingsMsg = false;
      this.initService.errorMsg = "";
    }, (err) => {
      document.querySelector("body").classList.remove("hiddenBody");
      this.initService.settingsMsg = true;
      if (err.error && err.error.error_description) {
        this.initService.errorMsg = err.error.error_description;
      } else {
        this.initService.errorMsg = "unable to reach  " + this.serviceUrl;
      }
    });
  }

  loadBrandingSettings() {
    this.brandingService.loadSettings(this.clientId, this.serviceUrl).subscribe((response) => {
      this.brandingService.setSettings(response);
      document.querySelector("body").classList.remove("hiddenBody");
      this.checkRestartFlow();
    }, (err) => {
      document.querySelector("body").classList.remove("hiddenBody");
      this.checkRestartFlow();
    });
  }

  checkRestartFlow() {
    setTimeout(() => {
      if (window.location.href.indexOf("restart=true") > -1 || window.location.href.indexOf("/welcome") === -1) {
        let loginLink = document.querySelector(".js-login-link");
        loginLink && loginLink["click"]();
        setTimeout(() => {
          history.replaceState({}, "", window.location.pathname);
        }, 100);
      }
    }, 100);
  }
}
