import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { BrandingService } from './branding.service';
import { DisplayService } from './display.service';

@Injectable({
  providedIn: 'root'
})
export class SelfService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private brandingService: BrandingService
  ) { }

  getCredentials() {
    return this.http.get(this.displayService.serviceUrl + 'admin/v1/MeCreds');
  }

  statusUpdate(credId: string, statusValue: string, isDefault: boolean) {
    const body = {
      default: isDefault,
      status: statusValue
    };
    return this.http.put(this.displayService.serviceUrl + 'admin/v1/MeCreds/' + credId, body);
  }

  setDefaultFalse(items: { credId: string; statusValue: string }[]) {
    let response = new Subject<any>();
    const observables = [];
    items.map((item) => {
      const body = {
        default: false,
        status: item.statusValue
      };
      observables.push(this.http.put(this.displayService.serviceUrl + 'admin/v1/MeCreds/' + item.credId, body));
    });
    if (observables.length === 0) {
      setTimeout(() => {
        response.next(true);
      }, 10);
    } else {
      forkJoin(observables).subscribe((result) => {
        response.next(true);
      });
    }
    return response;
  }

  deleteCredential(credId: string) {
    return this.http.delete(this.displayService.serviceUrl + 'admin/v1/MeCreds/' + credId);
  }

  credentialRegister(credentialType: string, value: string) {
    const body = {
      credType: credentialType,
      credValue: value,
      language: this.brandingService.getBrowserLang(),
      userAccessToken: true
    };
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/OTPRegistrar', body);
  }

  otpVerifier(credId: string, otp: string) {
    const body = {
      credId: credId,
      otp: otp,
      userAccessToken: true
    };
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/OTPVerifier', body);
  }
}
