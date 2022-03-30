import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DisplayService } from './display.service';
import { RememberDeviceService } from './remember-device.service';

@Injectable({
  providedIn: 'root'
})
export class MotpService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private rdService: RememberDeviceService
  ) { }

  public verifyMobileOtp(otp, credID, credValue) {
    const postData = { credId: credID, otp: otp, credValue: credValue, actionType: 'MOBILEOTP_AUTH', deviceTag: true };
    this.rdService.checkAndApply(postData);
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/MobileOTPVerifier', postData);
  }

  public registerMobileOtp(credType) {
    const postData = { credType: credType, default: false, actionType: "MOBILEOTP_REGISTER", deviceTag: true };
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/MobileOTPRegistrar', postData);
  }

  public registerVipMobileOtp(credType, credValue, vipCredentialID, otp) {
    const postData = { credType: credType, credValue: credValue, vipCredentialID: vipCredentialID, otp: otp, actionType: "MOBILEOTP_REGISTER", deviceTag: true }
    this.rdService.checkAndApply(postData);
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/VIPCredentialRegistrar', postData);
  }
}
