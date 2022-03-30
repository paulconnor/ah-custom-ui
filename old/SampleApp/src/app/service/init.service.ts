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
export class InitService {

  loginEnabled: boolean = false;
  settingsMsg: boolean = false;
  errorMsg = "";

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private cookieService: CookieService,
    private globalService: GlobalService,
    private brandingService: BrandingService
  ) { }

  public getBearerToken(client, serviceUrl) {
    const postData = {
      basic: 'Basic ' + btoa(client),
      payloadTypeAttribute: 'grant_type=client_credentials&scope=urn:iam:myscopes'
    };
    return this.http.post(serviceUrl + 'oauth2/v1/token', postData);
  }

  public onUserNameLoginSDK(postData, headers) {
    let userName = (postData["subject"] || "").toLowerCase();
    let trustedDeviceID;
    let fidoIdentifier;
    if (userName) {
      let tdiValFromCookie = this.cookieService.getCookie("tdi-" + this.displayService.obfuscate("SSP-TDI-" + userName));
      if (tdiValFromCookie) {
        trustedDeviceID = tdiValFromCookie;
      }
      let fidoID = this.cookieService.getCookie("fid-" + this.displayService.obfuscate("ssp-fido-identifier-" + this.displayService.obfuscate(userName)));
      if (fidoID) {
        fidoIdentifier = fidoID;
      }
    }
    var sub = new Subject();
    this.globalService.setRememberDeviceEnabled(false);
    window["AHUI"].initAuth({
      sspServiceURL: this.displayService.serviceUrl,
      authToken: "Bearer " + this.displayService.bearerToken,
      fieldsToBeEncryptedInAuthFlow: this.brandingService.getSettings()["fieldsToBeEncryptedInAuthFlow"],
      trustedDeviceID: trustedDeviceID,
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

  public getUserAccessToken(idToken, clientId, clientSecret) {
    const postData = {
      basic: 'Basic ' + btoa(clientId + ':' + clientSecret),
      payloadTypeAttribute: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + idToken + '&scope=urn:iam:myscopes openid email profile',
      tenantName: true
    };
    return this.http.post(this.displayService.serviceUrl + 'oauth2/v1/token', postData);
  }


  decodeToken(token) {
    if (!token) {
      return [];
    }
    const sJWT = token.split(".");
    const uHeader = window['b64utos'](sJWT[0]);
    const uClaim = window['b64utos'](sJWT[1]);
    const pHeader = window['KJUR'].jws.JWS.readSafeJSONString(uHeader);
    const pClaim = window['KJUR'].jws.JWS.readSafeJSONString(uClaim);
    return [pHeader, pClaim];
  }

  setLocalStorage(accessToken: string, clientId: string, clientSecret: string, serviceUrl: string, ipAddress: string, idToken: string) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("client_id", clientId);
    localStorage.setItem("clientSecret", clientSecret);
    localStorage.setItem("serviceUrl", serviceUrl);
    window["parseTenant"](serviceUrl);
    localStorage.setItem("ipAddress", ipAddress);
    localStorage.setItem("idToken", idToken);
  }
}
