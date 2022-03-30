import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RememberDeviceService {

  rememberDeviceChecked: boolean = false;

  constructor() { }

  checkAndApply(payload) {
    let checkboxElement = document.querySelector(".rememberThisDeviceCheckbox");
    if (checkboxElement && checkboxElement["checked"]) {
      payload["rememberThisDevice"] = true;
    }
  }

}
