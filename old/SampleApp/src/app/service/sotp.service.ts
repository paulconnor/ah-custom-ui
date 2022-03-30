import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BrandingService } from './branding.service';
import { DisplayService } from './display.service';
import { RememberDeviceService } from './remember-device.service';

@Injectable({
  providedIn: 'root'
})
export class SotpService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private rdService: RememberDeviceService,
    private brandingService: BrandingService
  ) { }

  public onOtpGenerate(credID, credType, type) {
    const postData = {
      credId: credID,
      credType: credType,
      action: 'login',
      language: this.brandingService.getBrowserLang(),
      actionType: type,
      deviceTag: true,
      tenantName: true
    };
    return this.http.post(this.displayService.serviceUrl + '/factor/v1/OTPGenerator', postData);
  }

  public verifyOtp(otp, credID, type) {
    const postData = {
      credId: credID,
      otp: otp,
      actionType: type,
      deviceTag: true,
      tenantName: true
    };
    this.rdService.checkAndApply(postData);
    return this.http.post(this.displayService.serviceUrl + '/factor/v1/OTPVerifier', postData);
  }

  public registerOtp(credType, credValue, type) {
    const postData = {
      credType: credType,
      credValue: credValue,
      default: false,
      language: this.brandingService.getBrowserLang(),
      actionType: type,
      deviceTag: true,
      tenantName: true
    };
    return this.http.post(this.displayService.serviceUrl + '/factor/v1/OTPRegistrar', postData);
  }
}
