import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DisplayService } from './display.service';
import { RememberDeviceService } from './remember-device.service';

@Injectable({
  providedIn: 'root'
})
export class LdapService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService,
    private rdService: RememberDeviceService
  ) { }

  public onPasswordLogin(password) {
    const postData = { password: window["AHUI"].encrypt(password), actionType: 'PASSWORD_AUTH', deviceTag: true };
    this.rdService.checkAndApply(postData);
    return this.http.post(this.displayService.serviceUrl + 'factor/v1/PasswordAuthenticator', postData);
  }
}


