import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BrandingService } from "./branding.service";
import { DisplayService } from './display.service';
import { RememberDeviceService } from './remember-device.service';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  manualPushTrigger: boolean = false;

  constructor(private http: HttpClient, private displayService: DisplayService, private rdService: RememberDeviceService, private brandingService: BrandingService) { }

  public onGenerate(credId) {
    const postData = {
      credId: credId,
      action: "login",
      language: this.brandingService.getBrowserLang(),
      deviceTag: true,
      actionType: 'PUSH_SELECTION',
      tenantName: true
    };
    return this.http.post(this.displayService.serviceUrl + "factor/v1/PushGenerator", postData);
  }

  public verifyPush(credId) {
    const postData = {
      credId: credId,
      tenantName: true,
      deviceTag: true,
      actionType: 'PUSH_AUTH'
    };
    if (this.rdService.rememberDeviceChecked) {
      postData["rememberThisDevice"] = true;
    }
    return this.http.post(this.displayService.serviceUrl + "factor/v1/PushStatus", postData);
  }

  public registerVipPush(credType, credValue, vipCredentialID) {
    const postData = {
      vipCredentialID: vipCredentialID,
      credType: credType,
      credValue: credValue,
      language: this.brandingService.getBrowserLang(),
      deviceTag: true,
      actionType: 'PUSH_REGISTRATION_INITIATOR'
    };
    return this.http.post(this.displayService.serviceUrl + "factor/v1/VIPCredentialRegistrar", postData);
  }
}
