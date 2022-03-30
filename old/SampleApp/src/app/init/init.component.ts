import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import * as Fingerprint2 from "fingerprintjs2";
import { ModalService } from "../modal/modal.service";
import { BrandingService } from '../service/branding.service';
import { CookieService } from '../service/cookie.service';
import { DisplayService } from "../service/display.service";
import { GlobalService } from '../service/global.service';
import { InitService } from "../service/init.service";

@Component({
  selector: "app-init",
  templateUrl: "./init.component.html",
  styleUrls: ["./init.component.css"],
})
export class InitComponent implements OnInit {
  loginForm: FormGroup;
  userName: string;
  errorDiv = false;
  errorMsg: string;
  errorDiv1 = false;
  errorMsg1: string;
  clientId = "";
  clientSecret = "";
  serviceUrl = "";
  fingerPrintDna: string;
  faCog = faCog;
  access_token = "";
  ipAddress: string;
  read_local_storage: boolean = false;
  iaFingerPrint: string;
  riskTypeList: any = ['IARISK', 'AARISK']
  riskType: string = "IARISK";
  rememberMe: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    public initService: InitService,
    private displayService: DisplayService,
    private modalService: ModalService,
    public brandingService: BrandingService,
    private cookieService: CookieService,
    private globalService: GlobalService
  ) { }

  ngOnInit() {
    this.errorMsg = this.initService.errorMsg;
    this.iaFingerPrint = window["IaDfp"] && window["IaDfp"].readFingerprint();
    if ("true" === localStorage.getItem("read_local_storage")) {
      this.read_local_storage = true;
    }
    this.serviceUrl = localStorage.getItem("serviceUrl");
    this.clientSecret = localStorage.getItem("clientSecret");
    this.clientId = localStorage.getItem("client_id");
    this.ipAddress = localStorage.getItem("ipAddress") || "";
    const self = this;
    this.loginForm = this.formBuilder.group({
      userName: ["", Validators.required],
      rememberMe: [false]
    });
    setTimeout(function () {
      const options = {};
      Fingerprint2.getPromise(options).then(function (components) {
        const object = {};
        for (const index in components) {
          const obj = components[index];
          object[obj.key] = obj.value;
        }
        self.fingerPrintDna = JSON.parse(JSON.stringify(object));
        self.displayService.fingerPrintDna = self.fingerPrintDna;
      });
    }, 500);
    this.globalService.onResetFlow(() => {
      this.authenticate(true);
    });
    this.displayService.focusFirstField();
  }

  enableLogin() {
    let brandingSettings = this.brandingService.getSettings();
    if (window.location.href.indexOf("restart=true") === -1 && brandingSettings && brandingSettings["featureFlags"] && brandingSettings["featureFlags"]["isRememberMeEnabled"] === true && this.cookieService.getCookie("ssp-username") && this.displayService.bearerToken) {
      this.userName = this.cookieService.getCookie("ssp-username");
      this.loginForm.value.userName = this.userName;
      this.rememberMe = true;
      this.globalService.setUserName(this.userName);
      this.authenticate();
    } else {
      this.initService.loginEnabled = true;
      this.displayService.focusFirstField();
    }
  }

  changeRiskType(e) {
    this.riskType = e.target.value;
    this.displayService.riskType = this.riskType;
    localStorage.setItem("riskType", this.displayService.riskType);
  }

  onCheckboxChange(isChecked: boolean) {
    if (isChecked) {
      this.read_local_storage = true;
      this.displayService.read_local_storage = "true";
      localStorage.setItem("read_local_storage", this.displayService.read_local_storage);
    }
    else {
      this.read_local_storage = false;
      this.displayService.read_local_storage = "false";
      localStorage.setItem("read_local_storage", this.displayService.read_local_storage);
    }
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
      this.initService.getBearerToken(this.clientId + ":" + this.clientSecret, this.serviceUrl).subscribe((data) => {
        this.displayService.bearerToken = data["access_token"];
        this.loadBrandingSettings();
        this.initService.setLocalStorage(this.displayService.bearerToken, this.clientId, this.clientSecret, this.serviceUrl, this.ipAddress, "");
        this.errorDiv1 = false;
        this.errorDiv = false;
        this.errorMsg1 = "";
        this.initService.settingsMsg = false;
        this.initService.errorMsg = "";
        if ("false" === this.displayService.read_local_storage) {
          this.read_local_storage = false;
        }
        else {
          this.read_local_storage = true;
        }
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

  onLogin() {
    this.userName = this.loginForm.value.userName;
    this.rememberMe = this.loginForm.value.rememberMe;
    if (this.userName) {
      this.globalService.setUserName(this.userName);
    }
    this.authenticate();
  }

  authenticate(resetFlow?: boolean) {
    this.displayService.ipAddress = this.ipAddress;
    const data = {
      channel: 'web',
      action: 'authenticate',
      ipAddress: this.displayService.ipAddress
    };
    const headers = {
      "x-tenant-name": localStorage.getItem("sspTenant"),
      'X-CLIENT-TRANSACTION-ID': this.displayService.clientTransactionId
    };
    if (localStorage.getItem("riskType") === "IARISK") {
      this.displayService.fingerPrintDna = this.iaFingerPrint;
      data['device'] = { signature: { "iaAuthData": this.displayService.fingerPrintDna } };
    } else if (localStorage.getItem("riskType") === "AARISK") {
      this.displayService.fingerPrintDna = this.fingerPrintDna;
      data['device'] = {
        signature: this.displayService.fingerPrintDna
      };
      if (this.cookieService.getCookie("ssp-aa")) {
        data["device"]["id"] = this.cookieService.getCookie("ssp-aa");
      }
    } else {
      this.displayService.fingerPrintDna = this.fingerPrintDna;
      data['device'] = { signature: this.displayService.fingerPrintDna };
    }
    if (!resetFlow && this.rememberMe) {
      data['rememberMe'] = true;
    }
    if (!resetFlow && this.userName) {
      data['subject'] = this.userName;
    }
    if (resetFlow) {
      headers['x-reset-flow'] = "true";
      if (this.globalService.latestFlowState) {
        headers['x-flow-state'] = this.globalService.latestFlowState;
      }
    }
    this.initService.onUserNameLoginSDK(data, headers).subscribe((data) => {
      this.errorDiv = false;
      this.errorMsg = "";
      this.displayService.userName = this.loginForm.value.userName;
      this.displayService.routeActions(data);
    }, (err) => {
      if (err.error && err.error.errorMessage) {
        this.errorDiv = true;
        this.errorMsg = err.error.errorMessage;
      } else {
        this.errorDiv = true;
        this.errorMsg =
          "Unknown error in authenticating User " + this.userName;
      }
    });
  }

  loadBrandingSettings() {
    this.brandingService.loadSettings(this.clientId, this.serviceUrl).subscribe((response) => {
      this.brandingService.setSettings(response);
      if (response && response["featureFlags"] && response["featureFlags"]["isRememberMeEnabled"] === true && this.cookieService.getCookie("ssp-username")) {
        this.userName = this.cookieService.getCookie("ssp-username");
        this.rememberMe = true;
        this.globalService.setUserName(this.userName);
        this.authenticate();
      }
    });
  }

  handleMouseDown(evt) {
    evt.preventDefault();
  }
}
