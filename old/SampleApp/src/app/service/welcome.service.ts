import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BrandingService } from './branding.service';
import { CookieService } from './cookie.service';
import { DisplayService } from './display.service';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class WelcomeService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private globalService: GlobalService,
    private cookieService: CookieService,
    private brandingService: BrandingService
  ) { }

  stepUp(fingerPrintDna, ipAddress, idToken, inputUserName, action, isReauthenticate) {
    const postData = {
      device: { signature: fingerPrintDna },
      channel: 'web', action: action, subject: inputUserName, ipAddress: ipAddress, existingIDToken: idToken, isReauthenticate: isReauthenticate
    };
    let headers = {
      "x-tenant-name": localStorage.getItem("sspTenant"),
      "X-CLIENT-TRANSACTION-ID": this.displayService.clientTransactionId
    };
    let userName = (postData["subject"] || "").toLowerCase();
    let fidoIdentifier;
    if (userName) {
      let fidoID = this.cookieService.getCookie("fid-" + this.displayService.obfuscate("ssp-fido-identifier-" + this.displayService.obfuscate(userName)));
      if (fidoID) {
        fidoIdentifier = fidoID;
      }
    }
    this.globalService.setRememberDeviceEnabled(false);
    var sub = new Subject();
    window["AHUI"].initAuth({
      sspServiceURL: this.displayService.serviceUrl,
      authToken: "Bearer " + this.displayService.bearerToken,
      fieldsToBeEncryptedInAuthFlow: this.brandingService.getSettings()["fieldsToBeEncryptedInAuthFlow"],
      fidoID: fidoIdentifier,
      payload: postData,
      headers: headers
    }, (resBody, resHeaders) => {
      if (resBody && resBody.flowState) {
        let resBodyClone = JSON.parse(JSON.stringify(resBody));
        this.globalService.processResponse(resBodyClone);
      }
      sub.next(resBody);
    }, (err) => {
      sub.error({ error: err });
    });
    return sub;
  }

  public getUserInfo(userAccessToken) {
    const postData = { payloadTypeAttribute: 'access_token=' + userAccessToken, noToken: true };
    return this.http.post(this.displayService.serviceUrl + 'oauth2/v1/userinfo', postData);
  }
}
