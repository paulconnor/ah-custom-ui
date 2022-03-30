import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { decode, encode } from '../../assets/base64.js';
import { CookieService } from '../service/cookie.service';
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';
import { FidoService } from "../service/fido.service";
import { GlobalService } from '../service/global.service';


@Component({
  selector: 'app-fido',
  templateUrl: './fido.component.html',
  styleUrls: ['./fido.component.css']
})
export class FidoComponent implements OnInit {

  enabled = false;
  loginEnabled = false;
  registrationEnabled: boolean = false;
  loginProgress = false;
  addForm: FormGroup;
  loginForm: FormGroup;
  xFlow: string;
  data = null;
  errorDiv: any;
  errorMsg: any;
  fidoFactors: boolean = false;
  multiFactorForm: FormGroup;
  fidoOptions: string[] = [];
  factorSelection: boolean = false;
  regLoginVerify: boolean = false;
  fidoRegBtnClicked = false;
  fidoRegVerifyBtnClicked = false;

  constructor(private factorselectionService: FactorselectionService, private formBuilder: FormBuilder, private router: Router, public fidoService: FidoService, public displayService: DisplayService, public globalService: GlobalService, private cookieService: CookieService) { }

  ngOnInit() {
    this.displayService.setFidoComponentResetFunction(this.doInit.bind(this));
    this.doInit();
  }

  doInit() {
    this.fidoRegBtnClicked = false;
    this.fidoRegVerifyBtnClicked = false;
    this.loginProgress = false;
    this.regLoginVerify = false;
    this.factorSelection = this.displayService.factorSelection;
    this.multiFactorForm = this.formBuilder.group({
      fidoOption: ['', Validators.required]
    });
    this.addForm = this.formBuilder.group({
      deviceName: ['', Validators.required]
    });
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
    });

    if (this.displayService.action === "FIDO_AUTH_GENERATE_CHALLENGE" || this.displayService.action === "SECURITYKEY_AUTH_GENERATE_CHALLENGE") {
      this.fidoFactors = this.displayService.fidoFactors;
      this.loginProgress = true;
      this.enabled = false;
      this.loginEnabled = false;
      if (!(this.globalService.isRememberDeviceEnabled() || this.displayService.isFIDOContinousFlow())) {
        let nextActionTrace_current = this.displayService.getNextActionTrace().current;
        if ((this.displayService.action === "FIDO_AUTH_GENERATE_CHALLENGE" && nextActionTrace_current === "FIDO_AUTH_GENERATE_CHALLENGE")
          || (this.displayService.action === "SECURITYKEY_AUTH_GENERATE_CHALLENGE" && nextActionTrace_current === "SECURITYKEY_AUTH_GENERATE_CHALLENGE")) {
          !this.fidoService.isInteractionButtonToBeDisplayed() && this.login();
        }
      }
    }
    if (this.displayService.action === "FIDO_REGISTER_GENERATE_CHALLENGE" || this.displayService.action === "SECURITYKEY_REGISTER_GENERATE_CHALLENGE") {
      this.registrationEnabled = this.displayService.registrationEnabled;
      this.loginProgress = this.displayService.loginProgress;
    }
    this.fidoOptions = this.displayService.fidoOptions;
    this.displayService.focusFirstField();
  }

  preformatMakeCredReq = (makeCredReq) => {
    makeCredReq.challenge = decode(makeCredReq.challenge);
    makeCredReq.user.id = decode(makeCredReq.user.id);
    if (makeCredReq.excludeCredentials && makeCredReq.excludeCredentials.length > 0) {
      for (let i = 0; i < makeCredReq.excludeCredentials.length; i++) {
        makeCredReq.excludeCredentials[i].id = decode(makeCredReq.excludeCredentials[i].id);
      }
    }
    return makeCredReq;
  }

  publicKeyCredentialToJSON = (pubKeyCred) => {
    if (pubKeyCred instanceof Array) {
      let arr = [];
      for (let i of pubKeyCred)
        arr.push(this.publicKeyCredentialToJSON(i));
      return arr
    }
    if (pubKeyCred instanceof ArrayBuffer) {
      encode(pubKeyCred);
      return encode(pubKeyCred)
    }
    if (pubKeyCred instanceof Object) {
      let obj = {};
      for (let key in pubKeyCred) {
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key])
      }
      return obj
    }
    return pubKeyCred
  }

  /**
  * Decodes arrayBuffer required fields.
  */
  preformatGetAssertReq = (getAssert) => {
    getAssert["data"]["challenge"] = decode(getAssert["data"]["challenge"]);
    for (let allowCred of getAssert["data"]["allowCredentials"]) {
      allowCred["id"] = decode(allowCred["id"]);
    }
    return getAssert["data"]
  }

  sendRegistrationVerifyChallenge(makeCredResponse) {
    this.fidoService.sendRegistrationVerifyChallenge(makeCredResponse).subscribe((response) => {
      let fidoID = (response["data"] && response["data"]["fidoIdentifier"]) || response["fidoIdentifier"];
      if (fidoID) {
        let expiryDays = parseInt(((response["data"] && response["data"]["fidoIdentifierExpiryDays"]) || response["fidoIdentifierExpiryDays"] || "365"), 10);
        let expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        this.cookieService.setCookie("fid-" + this.displayService.obfuscate("ssp-fido-identifier-" + this.displayService.obfuscate(this.displayService.userName.toLowerCase())), fidoID, expiryDate, { domain: this.cookieService.eTLD1() });
      }
      if ((this.displayService.fidoCredType === "FIDO" && response["nextaction"] === "FIDO_AUTH_GENERATE_CHALLENGE") || (this.displayService.fidoCredType === "SECURITYKEY" && response["nextaction"] === "SECURITYKEY_AUTH_GENERATE_CHALLENGE")) {
        this.displayService.flowState = response["flowState"];
        this.enabled = false;
        this.loginProgress = true;
        this.regLoginVerify = true;
        if (false && !this.globalService.isRememberDeviceEnabled()) {
          /**
           * Disable auto login prompt as few browsers need user-gesture like a 'click' action to be made.
           */
          this.login();
        }
      }
    }, (err) => {
      this.errorDiv = this.displayService.errorDiv;
      this.errorMsg = this.displayService.errorMsg;
    });

  }

  sendLoginVerifychallenge(makeCredResponse) {
    if (this.displayService.fidoCredType === "FIDO") {
      makeCredResponse.actionType = "FIDO_AUTH_VERIFY_CHALLENGE";
    } else if (this.displayService.fidoCredType === "SECURITYKEY") {
      makeCredResponse.actionType = "SECURITYKEY_AUTH_VERIFY_CHALLENGE";
    }
    makeCredResponse.deviceTag = true;
    this.fidoService.sendLoginVerifychallenge(makeCredResponse).subscribe((response) => {
      this.displayService.routeActions(response);
    })
  }

  onLogin() {
    this.loginUsername();
  }

  loginUsername() {
    this.fidoService.authenticationGenerateChallenge(this.loginForm.value.userName)
      .subscribe((data) => {
        this.loginProgress = true;
        this.enabled = false;
        this.loginEnabled = false;
        this.data = data
        if ((this.displayService.fidoCredType === "FIDO" && data["nextaction"] === "FIDO_REGISTER_GENERATE_CHALLENGE") || (this.displayService.fidoCredType === "SECURITYKEY" && data["nextaction"] === "SECURITYKEY_REGISTER_GENERATE_CHALLENGE")) {
          this.displayService.flowState = data["flowState"];
          this.loginEnabled = false;
          this.loginProgress = false;
          this.enabled = true;
        }
        else if ((this.displayService.fidoCredType === "FIDO" && data["nextaction"] === "FIDO_AUTH_VERIFY_CHALLENGE") || (this.displayService.fidoCredType === "SECURITYKEY" && data["nextaction"] === "SECURITYKEY_AUTH_VERIFY_CHALLENGE")) {
          this.displayService.flowState = data["flowState"];
          if (sessionStorage.getItem("__authn_debug000")) {
            let option = sessionStorage.getItem("__authn_debug000");
            if (("" + option) === ("" + window["RSWF"])) {
              this.data["data"]["allowCredentials"].forEach((r) => {
                r["transports"] = ["internal"];
              });
            } else if (("" + option) === ("" + window["RFWS"])) {
              this.data["data"]["allowCredentials"].forEach((r) => {
                r["transports"] = ["usb", "ble", "nfc"];
              });
            }
          }
          let publicKey = this.preformatGetAssertReq(this.data);
          return navigator.credentials.get({ publicKey }).then
            ((response) => {
              let getAssertionResponse = this.publicKeyCredentialToJSON(response);
              return this.sendLoginVerifychallenge(getAssertionResponse);
            }).catch((err) => {
            });
        }
        else {
          alert("error in data from server");
        }
      }, (err) => {
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg;
      });
  }

  login() {
    this.fidoRegVerifyBtnClicked = true;
    this.fidoService.authenticationGenerateChallenge(this.displayService.userName).subscribe((data) => {
      this.data = data
      if ((this.displayService.fidoCredType === "FIDO" && data["nextaction"] === "FIDO_REGISTER_GENERATE_CHALLENGE") || (this.displayService.fidoCredType === "SECURITYKEY" && data["nextaction"] === "SECURITYKEY_REGISTER_GENERATE_CHALLENGE")) {
        this.displayService.flowState = data["flowState"];
        this.loginEnabled = false;
        this.loginProgress = false;
        this.enabled = true;
      }
      else if ((this.displayService.fidoCredType === "FIDO" && data["nextaction"] === "FIDO_AUTH_VERIFY_CHALLENGE") || (this.displayService.fidoCredType === "SECURITYKEY" && data["nextaction"] === "SECURITYKEY_AUTH_VERIFY_CHALLENGE")) {
        if (sessionStorage.getItem("__authn_debug000")) {
          let option = sessionStorage.getItem("__authn_debug000");
          if (("" + option) === ("" + window["RSWF"])) {
            this.data["data"]["allowCredentials"].forEach((r) => {
              r["transports"] = ["internal"];
            });
          } else if (("" + option) === ("" + window["RFWS"])) {
            this.data["data"]["allowCredentials"].forEach((r) => {
              r["transports"] = ["usb", "ble", "nfc"];
            });
          }
        }
        let publicKey = this.preformatGetAssertReq(this.data);
        return navigator.credentials.get({ publicKey }).then((response) => {
          let getAssertionResponse = this.publicKeyCredentialToJSON(response);
          return this.sendLoginVerifychallenge(getAssertionResponse)
        }).catch((err) => {
          this.fidoRegVerifyBtnClicked = false;
        });
      }
      else {
        alert("error in data from server");
        if (sessionStorage.getItem("sampleAppPath")) {
          window.location.replace(sessionStorage.getItem("sampleAppPath") + "?restart=true");
        } else {
          this.router.navigate(['']);
        }
      }
      this.regLoginVerify = false;
    }, (err) => {
      this.fidoRegVerifyBtnClicked = false;
      this.errorDiv = this.displayService.errorDiv;
      this.errorMsg = this.displayService.errorMsg;
    });
  }

  onRegister() {
    this.fidoRegBtnClicked = true;
    this.fidoService.activationGenerateChallenge(this.displayService.userName, this.addForm.value.deviceName)
      .subscribe((response) => {
        this.displayService.flowState = response["flowState"];
        if (sessionStorage.getItem("__authn_debug000")) {
          let option = sessionStorage.getItem("__authn_debug000");
          if (("" + option) === ("" + window["RSWF"])) {
            response["data"]["authenticatorSelection"]["authenticatorAttachment"] = "platform";
          } else if (("" + option) === ("" + window["RFWS"])) {
            response["data"]["authenticatorSelection"]["authenticatorAttachment"] = "cross-platform";
          }
        }
        let publicKey1 = this.preformatMakeCredReq(response["data"]);
        return navigator.credentials.create({ publicKey: publicKey1 }).then((response) => {
          let makeCredResponse = this.publicKeyCredentialToJSON(response);
          if (this.displayService.fidoCredType === "FIDO") {
            makeCredResponse.actionType = "FIDO_REGISTER_VERIFY_CHALLENGE";
          } else if (this.displayService.fidoCredType === "SECURITYKEY") {
            makeCredResponse.actionType = "SECURITYKEY_REGISTER_VERIFY_CHALLENGE";
          }
          makeCredResponse.deviceTag = true;
          return this.sendRegistrationVerifyChallenge(makeCredResponse);
        }).catch((err) => {
          alert(err);
          this.fidoRegBtnClicked = false;
        });
      }, (err) => {
        this.fidoRegBtnClicked = false;
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg;
      });
  }

  factorSelect() {
    this.factorselectionService.chooseAnother();
  }
}

