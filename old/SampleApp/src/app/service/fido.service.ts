import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DisplayService } from './display.service';
import { RememberDeviceService } from './remember-device.service';


@Injectable({
  providedIn: 'root'
})
export class FidoService {

  constructor(private http: HttpClient, private displayService: DisplayService, private rdService: RememberDeviceService) { }

  authenticationGenerateChallenge(userName) {
    const postData = {
      documentDomain: location.origin,
      fidoCredType: this.displayService.fidoCredType,
      deviceTag: true
    };
    if (this.displayService.fidoCredType === "FIDO") {
      postData["actionType"] = "FIDO_AUTH_GENERATE_CHALLENGE";
    } else if (this.displayService.fidoCredType === "SECURITYKEY") {
      postData["actionType"] = "SECURITYKEY_AUTH_GENERATE_CHALLENGE";
    }
    if (userName) {
      postData["userName"] = userName;
    }
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDOAuthChallengeGenerator', postData);
  }

  public activationGenerateChallenge(userName, deviceName) {
    const postData = {
      userName: userName,
      deviceName: deviceName,
      documentDomain: location.origin,
      fidoCredType: this.displayService.fidoCredType,
      deviceTag: true,
      tenantName: true
    };
    if (this.displayService.fidoCredType === "FIDO") {
      postData["actionType"] = "FIDO_REGISTER_GENERATE_CHALLENGE";
    } else if (this.displayService.fidoCredType === "SECURITYKEY") {
      postData["actionType"] = "SECURITYKEY_REGISTER_GENERATE_CHALLENGE";
    }
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDORegChallengeGenerator', postData);
  }

  public sendRegistrationVerifyChallenge(makeCredReq) {
    makeCredReq["fidoCredType"] = this.displayService.fidoCredType;
    this.rdService.checkAndApply(makeCredReq);
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDORegChallengeVerifier', makeCredReq);
  }

  public sendLoginVerifychallenge(makeCredReq) {
    this.rdService.checkAndApply(makeCredReq);
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDOAuthChallengeVerifier', makeCredReq);
  }

  isInteractionButtonToBeDisplayed() {
    /**
     * If the browser is Safari, then the button should be displayed always.
     */
    return navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") <= -1;
  }

}
