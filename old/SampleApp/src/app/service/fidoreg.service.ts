import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DisplayService } from './display.service';

@Injectable({
  providedIn: 'root'
})
export class FidoregService {

  constructor(private http: HttpClient, private displayService: DisplayService) {
  }

  public activationGenerateChallenge(name, device, type) {
    const postData = {
      userName: name,
      deviceName: device,
      documentDomain: location.origin,
      fidoCredType: type,
      tenantName: true,
      userAccessToken: true,
      noFlowState: true
    };
    if (type === "FIDO") {
      postData["actionType"] = "FIDO_REGISTER_GENERATE_CHALLENGE";
    } else if (type === "SECURITYKEY") {
      postData["actionType"] = "SECURITYKEY_REGISTER_GENERATE_CHALLENGE";
    }
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDORegChallengeGenerator', postData);
  }

  public sendRegistrationVerifyChallenge(makeCredReq, type) {
    makeCredReq["fidoCredType"] = type;
    if (type === "FIDO") {
      makeCredReq.actionType = "FIDO_REGISTER_VERIFY_CHALLENGE";
    } else if (type === "SECURITYKEY") {
      makeCredReq.actionType = "SECURITYKEY_REGISTER_VERIFY_CHALLENGE";
    }
    makeCredReq.tenantName = true;
    makeCredReq.userAccessToken = true;
    makeCredReq.noFlowState = true;
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/FIDORegChallengeVerifier', makeCredReq);
  }
}
