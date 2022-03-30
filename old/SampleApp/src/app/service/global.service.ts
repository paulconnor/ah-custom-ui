import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  private flowStateSubject = {};
  credID: string = "";
  credValue: string = "";
  credType: string = "";
  userName: string = "";
  latestFlowState: any;
  rememberDevice: boolean = false;
  private resetFlowSubject = new Subject();

  constructor() { }

  /**
  * method To get flowstate
  */
  getFlowState(key) {
    return this.flowStateSubject[key];
  }

  /**
  * method To set flowstate
  * @params key: actionType
  * @params data: flowstate
  */
  setFlowState(key, data) {
    this.flowStateSubject[key] = data;
  }

  /**
  * method To set Api response data
  */
  setSubSequentApisData(response) {
    if (response) {
      if (response.additional) {
        if (response.additional.isTrustedDeviceEnabled === true) {
          this.setRememberDeviceEnabled(true);
        }
      }
      response.flowState && this.setFlowState(response.nextaction, response.flowState);
      if (response.flowState) {
        this.latestFlowState = response.flowState;
      }
    }
  }

  /**
  * handle api response data
  * @params data:any;
  * @params nexAction:string;
  */
  processResponse(data) {
    this.setSubSequentApisData(data);
  }

  /**
  * method To get userName
  */
  getUserName() {
    return this.userName;
  }

  /**
  * method To set userName
  * @params userName:any
  */
  setUserName(userName) {
    this.userName = userName;
  }

  onResetFlow(resetFunc) {
    if (this.resetFlowSubject) {
      this.resetFlowSubject.unsubscribe();
      this.resetFlowSubject = new Subject();
    }
    this.resetFlowSubject.subscribe(resetFunc);
  }

  doResetFlow() {
    this.resetFlowSubject.next('reset');
  }

  setRememberDeviceEnabled(rememberDevice) {
    this.rememberDevice = rememberDevice;
  }

  isRememberDeviceEnabled() {
    return this.rememberDevice;
  }
}
