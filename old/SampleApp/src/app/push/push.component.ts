import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';
import { GlobalService } from '../service/global.service';
import { PushService } from '../service/push.service';

@Component({
  selector: 'app-push',
  templateUrl: './push.component.html',
  styleUrls: ['./push.component.css']
})
export class PushComponent implements OnInit {
  registerPush: boolean = false;
  registerForm: FormGroup;
  pushOptions: string[] = [];
  credId = '';
  errorDiv: boolean = false;
  errorMsg: String;
  selectPush: boolean = false;
  sentPush: boolean = false;
  counter: number;
  pushSuccess: boolean = false;
  factorSelection: boolean = false;
  errorDivPush = false;
  elementType: 'url' | 'canvas' | 'img' = 'url';
  value: string = '';
  selectedCredValue: string;
  singleFactorAvailable: boolean = false;
  timerId: any;
  credentialId: string;
  verifyPushSent: boolean = false;

  constructor(private formBuilder: FormBuilder, private router: Router, private displayService: DisplayService, public pushService: PushService, public globalService: GlobalService) { }

  ngOnInit() {
    this.factorSelection = this.displayService.factorSelection;
    if (this.displayService.action === "PUSH_SELECTION") {
      this.selectPush = this.displayService.selectPush;
    }
    else if (this.displayService.action === "PUSH_REGISTRATION_INITIATOR") {
      this.registerPush = true;
    }
    else if (this.displayService.action === "PUSH_REGISTRATION_STATUS") {
      this.registerPush = this.displayService.registerPush;
    }
    this.registerForm = this.formBuilder.group({
      deviceName: ['', Validators.required],
      credentialId: ['', Validators.required]
    });
    this.pushOptions = this.displayService.pushOptions;
    this.pushOptions.forEach(function (value) {
      if (value["default"] === true) {
        this.credId = value["credId"];
        this.selectedCredValue = value["credValue"];
      }
    }.bind(this));
    if (this.pushOptions.length === 1) {
      this.credId = (<any>this.pushOptions[0]).credId;
      this.selectedCredValue = (<any>this.pushOptions[0]).credValue;
      this.singleFactorAvailable = true;
      if (!this.globalService.isRememberDeviceEnabled()) {
        this.sentPush = true;
        this.onGenerate();
      } else {
        this.verifyPushSent = true;
      }
    }
    this.displayService.focusFirstField();
  }

  selectedCredential(event: any) {
    if (event) {
      this.credId = event.credId;
      this.selectedCredValue = event.credValue;
    }
    this.selectPush = false;
    if (!this.globalService.isRememberDeviceEnabled()) {
      this.sentPush = true;
      this.onGenerate();
    } else {
      this.verifyPushSent = true;
    }
  }

  onGenerate() {
    this.counter = 0;
    this.pushService.onGenerate(this.credId)
      .subscribe((data) => {
        if (data["nextaction"] === "PUSH_AUTH") {
          this.errorMsg = "";
          this.errorDiv = false
          this.selectPush = false;
          this.singleFactorAvailable = false;
          this.sentPush = true;
          this.verifyPushSent = false;
          this.displayService.flowState = data["flowState"];
          this.verifyPush();
        }
      }, (err) => {
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg;
      });
  }

  verifyPush() {
    this.counter++;
    let credId = this.credId
    let temp = this;
    let i = 0;
    this.timerId = setInterval(function () {
      i++;
      temp.pushService.verifyPush(credId)
        .subscribe((data) => {
          if (data["data"]["status"] === "AUTHENTICATED") {
            temp.pushSuccess = true;
            clearInterval(temp.timerId);
            temp.displayService.routeActions(data);
          }
          else if (i >= 12) {
            temp.errorMsg = "Transaction timedout "
            temp.errorDivPush = true;
            temp.sentPush = false;
            clearInterval(temp.timerId);
          }
          else if (data["data"]["status"] === "REJECTED") {
            temp.errorMsg = "Transaction  denied"
            temp.errorDivPush = true;
            temp.sentPush = false;
            clearInterval(temp.timerId);
          }
          if (temp.pushSuccess) {
            clearInterval(temp.timerId);
          }
        }
        );
    }, 10000);
    if (temp.pushSuccess) {
      clearInterval(temp.timerId);
    }

  }

  registerVipPush() {
    this.pushService.manualPushTrigger = false;
    this.selectedCredValue = this.registerForm.value.deviceName;
    this.credentialId = this.registerForm.value.credentialId.toUpperCase().split(" ").join("");
    this.pushService.registerVipPush("totp_push", this.selectedCredValue, this.credentialId).subscribe((data) => {
      if (data["nextaction"] === "PUSH_AUTH") {
        this.errorMsg = "";
        this.errorDiv = false
        this.selectPush = false;
        this.sentPush = true;
        this.displayService.flowState = data["flowState"];
        this.credId = data["data"]["credId"];
        this.registerPush = false;
        this.verifyPush();
      }
    }, (err) => {
      this.errorDiv = this.displayService.errorDiv;
      this.errorMsg = this.displayService.errorMsg;
    });
  }

  onSendRequest() {
    this.pushService.manualPushTrigger = true;
    this.onGenerate();
  }
}


