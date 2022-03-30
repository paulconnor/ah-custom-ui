import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { decode, encode } from '../../assets/base64.js';
import { ConfirmDialogService } from '../confirm-dialog/confirm-dialog.service';
import { CookieService } from '../service/cookie.service';
import { DisplayService } from '../service/display.service';
import { FidoregService } from '../service/fidoreg.service';
import { SelfService } from '../service/self.service';

@Component({
  selector: 'app-self-service',
  templateUrl: './self-service.component.html',
  styleUrls: ['./self-service.component.scss']
})
export class SelfServiceComponent implements OnInit {
  credentialsList = [];
  statuses = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];
  statusMap = {};
  credTypeMap = {
    "sms": { name: "SMS", rank: 1, label: "phone number" },
    "email": { name: "Email", rank: 2, label: "email address" },
    "fido": { name: "Biometric", rank: 3, label: "friendly name" },
    "securitykey": { name: "Security key", rank: 4, label: "key name" },
    "totp": { name: "Mobile OTP", rank: 5 },
    "totp_push": { name: "Push", rank: 6 }
  };
  private months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedCredType = 'email';
  credValueControl = new FormControl('', [Validators.required, Validators.email]);
  regBtnClicked = false;
  errorMessage: string;
  isLoading: boolean;
  constructor(
    private selfService: SelfService,
    private router: Router,
    public displayService: DisplayService,
    private fidoregService: FidoregService,
    private cookieService: CookieService,
    private confirmDialogService: ConfirmDialogService
  ) { }

  ngOnInit(): void {
    this.statuses.forEach((status) => {
      this.statusMap[status.value] = "Y";
    });
    const userName = this.displayService.userName;
    if (userName) {
      this.isLoading = true;
      let checkAccessTokenAvailable = () => {
        if (this.displayService.userAccessToken) {
          this.getCreds();
        } else {
          setTimeout(() => {
            checkAccessTokenAvailable();
          }, 500);
        }
      };
      checkAccessTokenAvailable();
    } else {
      this.router.navigate(['']);
    }
  }

  getCreds(newCredId?: string) {
    this.selfService.getCredentials().subscribe((res: any) => {
      let finalArray = res;
      finalArray.sort((c1, c2) => {
        let rank1 = (this.credTypeMap[c1.credType] || {}).rank;
        let rank2 = (this.credTypeMap[c2.credType] || {}).rank;
        if (rank1 < rank2) {
          return -1;
        } else if (rank1 > rank2) {
          return 1;
        } else {
          return 0;
        }
      });
      this.credentialsList = finalArray;
      this.isLoading = false;
      this.regBtnClicked = false;
      let container = document.querySelector(".js-selfservice-wrapper");
      container && (container.scrollTop = 0);
      setTimeout(() => {
        let verifyOTPInput = document.querySelector("tr[data-cred-id=\"" + newCredId + "\"] .js-verifyCredOTPInput");
        verifyOTPInput && verifyOTPInput["focus"]();
      }, 10);
    }, (err) => {
      this.isLoading = false;
      this.showErrorMessage(err.error);
      this.regBtnClicked = false;
    });
  }

  getCustomDateFormat(dateStr) {
    let dt;
    try {
      dt = new Date(dateStr);
      if (isNaN(dt.getTime()) || !dt.getTime()) {
        throw new Error("Invalid Date String");
      }
      let res = "";
      res += this.months[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
      return res;
    } catch (exjs) {
      return dateStr;
    }
  }

  handleOTPInput(e, verifyOTPBtn, errorElem) {
    if (e && e.target) {
      if (e.target.value && e.target.value.trim()) {
        verifyOTPBtn && (verifyOTPBtn["disabled"] = false);
      } else {
        verifyOTPBtn && (verifyOTPBtn["disabled"] = true);
      }
    }
    errorElem && (errorElem.innerHTML = "");
  }

  onStatusChange(credItem, status) {
    this.updateCredStatus(credItem.credId, status, credItem.default);
  }

  onDefaultChange(credItem: any, isChecked) {
    const defaultTrueCreds = [];
    this.credentialsList.map((item) => {
      if (item.default) {
        defaultTrueCreds.push({
          credId: item.credId,
          statusValue: item.status
        });
      }
    });
    this.selfService.setDefaultFalse(defaultTrueCreds).subscribe((res) => {
      this.updateCredStatus(credItem.credId, credItem.status, isChecked);
    });
  }

  updateCredStatus(id, value, isDefault) {
    this.selfService.statusUpdate(id, value, isDefault).subscribe((res) => {
      this.getCreds();
    }, (err) => {
      const index = this.credentialsList.findIndex((item) => item.credId === id);
      if (index !== -1) {
        // For reseting Status dropdown
        const statusCopy = this.credentialsList[index].status;
        this.credentialsList[index].status = null;
        setTimeout(() => {
          this.credentialsList[index].status = statusCopy;
        }, 1);
      }
      this.showErrorMessage(err.error);
    })
  }

  handleDeleteCred(creditem) {
    this.confirmDialogService.open("Delete Credential", "Are you sure you want to delete this credential?", () => {
      this.deleteCred(creditem);
    });
  }

  private deleteCred(credItem) {
    this.selfService.deleteCredential(credItem.credId).subscribe((res) => {
      this.getCreds();
    }, (err) => {
      this.showErrorMessage(err.error);
    })
  }

  handleDeleteAll() {
    this.confirmDialogService.open("Delete All Credentials", "All your credentials will be deleted. Are you sure?", () => {
      this.deleteAll();
    });
  }

  private deleteAll() {
    let credCount = this.credentialsList.length;
    let ctr = 0;
    this.credentialsList.map((item) => {
      this.selfService.deleteCredential(item.credId).subscribe((res) => {
        ctr++;
        if (ctr === credCount) {
          this.getCreds();
        }
      }, (err) => {
        this.showErrorMessage(err.error);
        this.getCreds();
      })
    })
  }

  onRegister() {
    if (this.selectedCredType && this.credValueControl.valid) {
      if (this.selectedCredType === "fido" || this.selectedCredType === "securitykey") {
        this.registerFIDOorSecurityKey();
        return;
      }
      let inputValue: string = this.credValueControl.value.trim();
      if (this.selectedCredType === 'sms') {
        inputValue = inputValue.replace(/([\s+-]|[(]|[)])+/g, '');
      }
      this.regBtnClicked = true;
      this.selfService.credentialRegister(this.selectedCredType, inputValue).subscribe((res) => {
        this.credValueControl.reset();
        this.getCreds(res["credId"]);
      }, (err) => {
        this.showErrorMessage(err.error);
        this.regBtnClicked = false;
      })
    }
  }

  registerFIDOorSecurityKey() {
    if (this.selectedCredType === "fido") {
      this.displayService.fidoRegCredType = "FIDO";
      this.displayService.fidoRegScreenMode = "FIDO";
    } else if (this.selectedCredType === "securitykey") {
      this.displayService.fidoRegCredType = "SECURITYKEY";
      this.displayService.fidoRegScreenMode = "SECURITYKEY";
    }
    let inputValue: string = this.credValueControl.value.trim();
    this.regBtnClicked = true;
    this.fidoregService.activationGenerateChallenge(this.displayService.userName, inputValue, this.displayService.fidoRegCredType)
      .subscribe((response) => {
        if (sessionStorage.getItem("__authn_debug000")) {
          let option = sessionStorage.getItem("__authn_debug000");
          if (("" + option) === ("" + window["RSWF"])) {
            response["authenticatorSelection"]["authenticatorAttachment"] = "platform";
          } else if (("" + option) === ("" + window["RFWS"])) {
            response["authenticatorSelection"]["authenticatorAttachment"] = "cross-platform";
          }
        }
        const publicKey1 = this.preformatMakeCredReq(response);
        return navigator.credentials.create({ publicKey: publicKey1 }).then((response) => {
          const makeCredResponse = this.publicKeyCredentialToJSON(response);
          return this.sendRegistrationVerifyChallenge(makeCredResponse);
        }, (err) => {
          this.regBtnClicked = false;
          this.showErrorMessage(err);
        }).catch((err) => {
          this.regBtnClicked = false;
          this.showErrorMessage(err);
        });
      }, (err) => {
        this.regBtnClicked = false;
        this.showErrorMessage(err.error);
      });
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
      const arr = [];
      for (const i of pubKeyCred) {
        arr.push(this.publicKeyCredentialToJSON(i));
      }
      return arr;
    }
    if (pubKeyCred instanceof ArrayBuffer) {
      encode(pubKeyCred);
      return encode(pubKeyCred);
    }
    if (pubKeyCred instanceof Object) {
      const obj = {};
      for (const key in pubKeyCred) {
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key]);
      }
      return obj;
    }
    return pubKeyCred;
  }

  sendRegistrationVerifyChallenge(makeCredResponse) {
    this.fidoregService.sendRegistrationVerifyChallenge(makeCredResponse, this.displayService.fidoRegCredType).subscribe((response) => {
      let fidoID = (response["data"] && response["data"]["fidoIdentifier"]) || response["fidoIdentifier"];
      if (fidoID) {
        let expiryDays = parseInt(((response["data"] && response["data"]["fidoIdentifierExpiryDays"]) || response["fidoIdentifierExpiryDays"] || "365"), 10);
        let expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
        this.cookieService.setCookie("fid-" + this.displayService.obfuscate("ssp-fido-identifier-" + this.displayService.obfuscate(this.displayService.userName.toLowerCase())), fidoID, expiryDate, { domain: this.cookieService.eTLD1() });
      }
      this.credValueControl.reset();
      this.getCreds();
    }, (err) => {
      this.regBtnClicked = false;
      this.showErrorMessage(err.error);
    });
  }

  verifyOTP(credItem: any, value: string, errorElem) {
    if (value && value.trim()) {
      this.selfService.otpVerifier(credItem.credId, value.trim()).subscribe((res) => {
        this.getCreds();
      }, (err) => {
        let msg = "Invalid OTP";
        errorElem && (errorElem.innerHTML = msg);
      });
    }
  }


  credTypeChange() {
    if (("" + this.selectedCredType).toLowerCase() === 'email') {
      this.credValueControl = new FormControl('', [Validators.required, Validators.email]);
    } else if (("" + this.selectedCredType).toLowerCase() === 'sms') {
      this.credValueControl = new FormControl('', [Validators.required]);
    } else if (("" + this.selectedCredType).toLowerCase() === 'fido') {
      this.credValueControl = new FormControl('', [Validators.required]);
    } else if (("" + this.selectedCredType).toLowerCase() === 'securitykey') {
      this.credValueControl = new FormControl('', [Validators.required]);
    }
    this.errorMessage = '';
  }

  focusRegInputField() {
    const inputEle = document.querySelector('.register-container .input-container input[type="text"]');
    inputEle && inputEle['focus']();
  }

  showErrorMessage(error) {
    let errorObject = error || {};
    this.errorMessage = errorObject.errorMessage || "Unable to register, please try again.";
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  onCredInput(evt: Event) {
    if (("" + this.selectedCredType).toLowerCase() === "sms") {
      evt.target["value"] = evt.target["value"].replace(/[^0-9()\s+-]+/g, '');
      this.credValueControl.setValue(evt.target["value"]);
    }
  }
}
