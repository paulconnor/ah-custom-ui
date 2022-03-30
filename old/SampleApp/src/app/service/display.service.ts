import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BrandingService } from './branding.service';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  enabled: boolean = false;
  performLogin: boolean = false;
  registrationEnabled: boolean = false;
  loginProgress: boolean = false;
  passwordEnabled: boolean = false;
  userNameEnabled: boolean = false;
  multiFactor: boolean = false;
  registerOtp: boolean = false;
  registerPush: boolean = false;
  smsOtpOptions: string[] = [];
  emailOtpOptions: string[] = [];
  fidoOptions: string[] = [];
  pushOptions: string[] = [];
  userName: string;
  flowState: string;
  action: string;
  errorMsg: string;
  errorDiv: boolean = false;
  successMessage: boolean = false
  selectPush: boolean = false;
  bearerToken: string;
  ipAddress: string;
  factorOptions: string[] = [];
  fidoFactors: boolean = false;
  factorSelection: boolean = false;
  idToken: any;
  userAccessToken: any;
  registerMobileOtp: boolean = false;
  mobileOtpOptions: string[] = [];
  serviceUrl: string;
  flowStateId: string;
  fingerPrintDna: any;
  baseHost: string;
  wealth: boolean = false;
  business: boolean = false
  commercial: boolean = false
  investments: boolean = false;
  inlineMessage: string;
  reauthMessage: string;
  clientTransactionId: any
  reauthObservable: Subject<any>;
  logoutUrl: string;
  loginName: string;
  read_local_storage: string = "false";
  riskType: string;
  fidoCredType;
  fidoScreenMode;
  fidoRegCredType;
  fidoRegScreenMode;
  preferredFactor;
  private fidoComponentResetFunction: Function;
  private nextActionTrace;
  uatFailed: boolean = false;

  constructor(private router: Router, private cookieService: CookieService, private brandingService: BrandingService) {
    this.reauthObservable = new Subject();
  }

  setFidoComponentResetFunction(fn: Function) {
    this.fidoComponentResetFunction = fn;
  }

  doCancel() {
    if (sessionStorage.getItem("sampleAppPath")) {
      window.location.replace(sessionStorage.getItem("sampleAppPath") + "?restart=true");
    } else {
      this.commercial = false;
      this.business = false;
      this.investments = false;
      this.wealth = false;
      this.userNameEnabled = false;
      this.passwordEnabled = false;
      this.router.navigate(['']);
    }
  }

  processRisk(deviceID) {
    if (localStorage.getItem("riskType") === "AARISK" && deviceID) {
      let expires = new Date();
      expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
      this.cookieService.setCookie("ssp-aa", deviceID, expires);
      return;
    }
    if (!deviceID) {
      return [];
    }
    /**
     * Below block is for IA RISK
     */
    if (deviceID) {
      window["IaDfp"].writeTag(deviceID, true);
    }
    this.fingerPrintDna = window["IaDfp"].readFingerprint();
  }

  processFactorOptions(factorOptions) {
    if (!factorOptions) {
      return;
    }
    let newArray = factorOptions;
    if (factorOptions && factorOptions.indexOf("FIDO") > -1 && factorOptions.indexOf("SECURITYKEY") > -1) {
      /**
       * Ensuring that Biometric & SecurityKey options are displayed together in the UI.
       */
      newArray = [];
      factorOptions.forEach((factor) => {
        if (factor !== "FIDO" && factor !== "SECURITYKEY") {
          newArray.push(factor);
        } else if (factor === "FIDO") {
          newArray.push("FIDO");
          newArray.push("SECURITYKEY");
        }
      });
      factorOptions = newArray;
    }
    if (factorOptions && factorOptions.indexOf("SMSOTP") > -1 && factorOptions.indexOf("EMAILOTP") > -1) {
      /**
       * Ensuring that SMSOTP & EMAILOTP options are displayed together in the UI.
       */
      newArray = [];
      factorOptions.forEach((factor) => {
        if (factor !== "SMSOTP" && factor !== "EMAILOTP") {
          newArray.push(factor);
        } else if (factor === "SMSOTP") {
          newArray.push("SMSOTP");
          newArray.push("EMAILOTP");
        }
      });
      factorOptions = newArray;
    }
    if (factorOptions && factorOptions.indexOf("MOBILEOTP") > -1 && factorOptions.indexOf("PUSH") > -1) {
      /**
       * Ensuring that MOBILEOTP & PUSH options are displayed together in the UI.
       */
      newArray = [];
      factorOptions.forEach((factor) => {
        if (factor !== "MOBILEOTP" && factor !== "PUSH") {
          newArray.push(factor);
        } else if (factor === "MOBILEOTP") {
          newArray.push("MOBILEOTP");
          newArray.push("PUSH");
        }
      });
      factorOptions = newArray;
    }
    return newArray || factorOptions;
  }

  routeActions(data): void {
    if (data === null) {
      this.errorDiv = true;
      this.errorMsg = "Server error, response is null"
      this.router.navigate(['**']);
    } else {
      if (data["currentFactors"] && data["currentFactors"].length > 1) {
        this.factorSelection = true;
      } else {
        this.factorSelection = false;
      }
      this.action = data["nextaction"];
      this.flowState = data["flowState"];
      this.processRisk(data["deviceID"]);
      if (data["userName"]) {
        this.userName = data["userName"];
      }
      if (data["nextaction"] === "PASSWORD_AUTH") {
        this.userNameEnabled = false;
        this.passwordEnabled = true;
        this.inlineMessage = data["inline_registration"];
        this.router.navigate(['verify']);
      } else if (data["nextaction"] === "FIDO_AUTH_GENERATE_CHALLENGE") {
        if (this.fidoComponentResetFunction) {
          this.fidoComponentResetFunction();
        }
        this.fidoCredType = "FIDO";
        this.fidoScreenMode = "FIDO";
        this.registrationEnabled = false;
        this.loginProgress = true;
        this.router.navigate(['fido']);
      }
      else if (data["nextaction"] === "FIDO_REGISTER_GENERATE_CHALLENGE") {
        if (this.fidoComponentResetFunction) {
          this.fidoComponentResetFunction();
        }
        this.fidoCredType = "FIDO";
        this.fidoScreenMode = "FIDO";
        this.registrationEnabled = true;
        this.loginProgress = false;
        this.router.navigate(['fido']);
      } else if (data["nextaction"] === "SECURITYKEY_AUTH_GENERATE_CHALLENGE") {
        if (this.fidoComponentResetFunction) {
          this.fidoComponentResetFunction();
        }
        this.fidoCredType = "SECURITYKEY";
        this.fidoScreenMode = "SECURITYKEY";
        this.registrationEnabled = false;
        this.loginProgress = true;
        this.router.navigate(['security-key']);
      }
      else if (data["nextaction"] === "SECURITYKEY_REGISTER_GENERATE_CHALLENGE") {
        if (this.fidoComponentResetFunction) {
          this.fidoComponentResetFunction();
        }
        this.fidoCredType = "SECURITYKEY";
        this.fidoScreenMode = "SECURITYKEY";
        this.registrationEnabled = true;
        this.loginProgress = false;
        this.router.navigate(['security-key']);
      }
      else if (data["nextaction"] === "MOBILEOTP_REGISTER") {
        this.registerMobileOtp = true;
        this.router.navigate(['motp']);
      }
      else if (data["nextaction"] === "MOBILEOTP_AUTH") {
        this.registerMobileOtp = false;
        this.multiFactor = true;
        this.mobileOtpOptions = data['credentials'];
        this.flowState = data["flowState"];
        this.router.navigate(['motp']);
      }
      else if (data["nextaction"] === "PUSH_REGISTRATION_INITIATOR") {
        this.flowState = data["flowState"];
        this.router.navigate(['push']);
      }
      else if (data["nextaction"] === "PUSH_REGISTRATION_STATUS") {
        this.registerPush = true;
        this.flowStateId = data["flowStateId"];
        this.baseHost = data["baseHost"];
        this.router.navigate(['push']);
      }
      else if (data["nextaction"] === "PUSH_SELECTION") {
        this.pushOptions = data["credentials"];
        this.selectPush = true;
        this.router.navigate(['push']);
      }
      else if (data["nextaction"] === "FACTOR_SELECTION") {
        this.preferredFactor = undefined;
        this.factorSelection = true;
        this.factorOptions = this.processFactorOptions(data["currentFactors"]);
        data["currentFactors"] = this.factorOptions;
        if (data["skipFactorAutoRedirect"] === true) {
          this.preferredFactor = null;
        } else {
          if (this.userName && this.userName !== "") {
            let brandingSettings = this.brandingService.getSettings();
            let valFromCookie;
            if (data.additional && data.additional.currentFactorLevel && brandingSettings && brandingSettings["appDetails"] && brandingSettings["appDetails"]["appId"]) {
              let cookieStr = ("" + brandingSettings["appDetails"]["appId"]).toLowerCase() + "+" + this.userName.toLowerCase() + "+" + data.additional.currentFactorLevel;
              valFromCookie = this.cookieService.getCookie("ob-" + this.obfuscate(cookieStr));
            }
            if (valFromCookie && data["currentFactors"] && data["currentFactors"].indexOf(valFromCookie) > -1) {
              this.preferredFactor = valFromCookie;
            } else if (data["currentFactors"] && data["currentFactors"][0]) {
              this.preferredFactor = data["currentFactors"][0];
            }
          }
        }
        this.router.navigate(['factorselection'])
      }
      else if (data["nextaction"] === "SMS_OTP_REGISTER") {
        this.registerOtp = true;
        this.router.navigate(['sotp']);
      }
      else if (data["nextaction"] === "SMS_OTP_SELECTION") {
        this.registerOtp = false;
        this.multiFactor = true;
        this.smsOtpOptions = data['credentials'];
        this.router.navigate(['sotp']);
      }
      else if (data["nextaction"] === "SMS_OTP_AUTH") {
        this.registerOtp = false;
        this.flowState = data["flowState"];
      }
      else if (data["nextaction"] === "EMAIL_OTP_REGISTER") {
        this.registerOtp = true;
        this.router.navigate(['eotp']);
      }
      else if (data["nextaction"] === "EMAIL_OTP_SELECTION") {
        this.registerOtp = false;
        this.multiFactor = true;
        this.emailOtpOptions = data['credentials'];
        this.router.navigate(['eotp']);
      }
      else if (data["nextaction"] === "EMAIL_OTP_AUTH") {
        this.registerOtp = false;
        this.flowState = data["flowState"];
      }
      else if (data["nextaction"] === "AUTH_DENIED") {
        alert("AUTH_DENIED");
      }
      else if (data["nextaction"] === "AUTH_ALLOWED") {
        this.userNameEnabled = false;
        this.passwordEnabled = false;
        this.successMessage = true;
        if (data["data"]["message"]) {
          this.reauthMessage = data["data"]["message"];
          this.reauthObservable.next(this.reauthMessage);
        }
        if (data['authCompleteUrl'])
          location.href = data['authCompleteUrl']
        else {
          this.idToken = data['id_token'];
          if (this.wealth) {
            this.router.navigate(['wealthmgmt']);
          }
          else if (this.business) {
            this.router.navigate(['bizmgmt']);
          }
          else if (this.commercial) {
            this.router.navigate(['commercialmgmt']);
          }
          else {
            if (data.userName && data.additional && data.additional.isRememberMe) {
              this.setRememberMeCookie(data);
            } else {
              this.clearRememberMeCookie();
            }
            if (data.additional && data.additional.trustedDeviceId) {
              let days = +data.additional.trustedDeviceExpiryDays || 0;
              let expires = new Date();
              expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
              this.cookieService.setCookie("tdi-" + this.obfuscate("SSP-TDI-" + this.userName.toLowerCase()), data.additional.trustedDeviceId, expires);
            }
            if (data.additional && data.additional.authLevelsData) {
              this.clearStaleAuthLevelsData();
              let levelData = data.additional.authLevelsData;
              let expires = new Date();
              expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
              for (let key in levelData) {
                this.cookieService.setCookie("ob-" + this.obfuscate(key.toLowerCase()), levelData[key], expires);
              }
            }
            this.router.navigate(['welcome']);
          }
        }
      }
    }
    if (data.nextaction) {
      this.nextActionTrace = this.nextActionTrace || {};
      this.nextActionTrace["previous"] = this.nextActionTrace["current"];
      this.nextActionTrace["current"] = data.nextaction;
    }
  }

  getNextActionTrace() {
    return JSON.parse(JSON.stringify(this.nextActionTrace));
  }

  isFIDOContinousFlow() {
    if (this.nextActionTrace.previous && this.nextActionTrace.current) {
      if ((this.nextActionTrace.previous === "FIDO_AUTH_GENERATE_CHALLENGE" || this.nextActionTrace.previous === "SECURITYKEY_AUTH_GENERATE_CHALLENGE")
        && (this.nextActionTrace.current === "FIDO_AUTH_GENERATE_CHALLENGE" || this.nextActionTrace.current === "SECURITYKEY_AUTH_GENERATE_CHALLENGE")) {
        return true;
      }
    }
    return false;
  }

  setRememberMeCookie(response) {
    let expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
    this.cookieService.setCookie("ssp-username", response["userName"], expires);
  }

  clearRememberMeCookie() {
    this.cookieService.removeCookie("ssp-username");
  }

  private clearStaleAuthLevelsData() {
    if (!this.userName) {
      return;
    }
    let brandingSettings = this.brandingService.getSettings();
    if (brandingSettings && brandingSettings["appDetails"] && brandingSettings["appDetails"]["appId"]) {
      let appId = brandingSettings["appDetails"]["appId"];
      let cookiePrefix = appId + "+" + this.userName.toLowerCase() + "+";
      for (let i = 1; i <= 6; i++) {
        this.cookieService.removeCookie("ob-" + this.obfuscate(cookiePrefix + i));
      }
    }
  }

  /**
     * A function for obfuscating strings.
     *
     * IMPORTANT NOTE:
     * This obfuscation logic should NOT be changed, as the same logic resides at the Java side also.
     * AuthHub-Commons/core-utils/src/main/java/com/broadcom/layer7authentication/core/utils/StringObfuscator.java
     *
     * @param str - The string to be obfuscated
     * @returns obfuscated string
     */
  obfuscate(str) {
    if (!str) {
      throw new Error("Invalid string input specified.");
    }
    let _str = btoa(encodeURIComponent(str.toLowerCase()));
    _str = _str.replace(/\//g, "").replace(/\+/g, "").replace(/\=/g, "");
    let _sum = 0;
    for (let i = 0; i < _str.length; i += 4) {
      _sum += parseInt(_str.substr(i, 4), 36);
    }
    return _sum.toString(36);
  }

  focusFirstField(timeout?: number) {
    setTimeout(() => {
      let firstField;
      let elements = document.querySelectorAll("input[type='text']:not([readonly]),input[type='password']:not([readonly])");
      elements.forEach((field) => {
        if (field.getAttribute("role") === "combobox" || field.closest("ng-select")) {
          return;
        }
        if (!firstField) {
          firstField = field;
        }
      });
      firstField && firstField.focus();
    }, timeout || 100);
  }

}
