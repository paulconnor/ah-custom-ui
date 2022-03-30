import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';
import { SotpService } from '../service/sotp.service';

@Component({
  selector: 'app-emailotp',
  templateUrl: './emailotp.component.html',
  styleUrls: ['./emailotp.component.css']
})
export class EmailotpComponent implements OnInit {

  multiFactor = false;
  verifyOtp = false;
  registerOtp = false;
  credId = '';
  otpOptions: string[] = [];
  verifyOtpForm: FormGroup;
  registerOtpForm: FormGroup;
  errorDiv: boolean = false;
  errorMsg: String;
  factorSelection: boolean = false;
  singleFactorAvailable: boolean = false;
  selectedCredValue: string;
  _cachedFlowState: string;
  existingCredential: boolean = false;
  resendOTPMessage: string;
  otpSending: boolean = false;
  msgTimer: any;
  credType: any;

  constructor(private factorselectionService: FactorselectionService, private formBuilder: FormBuilder, private router: Router, private sotpService: SotpService, private displayService: DisplayService) { }

  ngOnInit() {
    this.factorSelection = this.displayService.factorSelection;
    this.existingCredential = false;
    this.otpSending = false;
    this.verifyOtpForm = this.formBuilder.group({
      otp: ['', Validators.required]
    })
    this.registerOtpForm = this.formBuilder.group({
      email: ['', Validators.required]
    });
    this.multiFactor = this.displayService.multiFactor;
    this.registerOtp = this.displayService.registerOtp;
    this.otpOptions = this.displayService.emailOtpOptions;
    this.otpOptions.forEach(function (value) {
      if (value["default"] === true) {
        this.credId = value["credId"];
        this.credType = value["credType"];
        this.selectedCredValue = value["credValue"];
      }
    }.bind(this));
    if (this.otpOptions.length === 1) {
      this.singleFactorAvailable = true;
      this.credId = (<any>this.otpOptions[0]).credId;
      this.credType = (<any>this.otpOptions[0]).credType;
      this.selectedCredValue = (<any>this.otpOptions[0]).credValue;
      this.onGenerate();
    }
    this.displayService.focusFirstField();
  }

  selectedCredential(event: any) {
    if (event) {
      this.credId = event.credId;
      this.credType = event.credType;
      this.selectedCredValue = event.credValue;
    }
    this.multiFactor = false;
    this.onGenerate();
  }

  onGenerate() {
    const emailControl = this.registerOtpForm.get('email');
    emailControl.setValidators([Validators.required, Validators.email]);
    this.existingCredential = true;
    this._cachedFlowState = this.displayService.flowState;
    this.sotpService.onOtpGenerate(this.credId, this.credType, 'EMAIL_OTP_SELECTION')
      .subscribe((data) => {
        if (data["nextaction"] === "EMAIL_OTP_AUTH") {
          this.errorDiv = false;
          this.verifyOtp = true;
          this.displayService.flowState = data["flowState"];
          this.updateResendOTPStatus("A security code has been sent");
          this.singleFactorAvailable = false;
        }
        this.otpSending = false;
        this.displayService.focusFirstField();
      }, (err) => {
        if (err && err.error && err.error.data && err.error.data.errorCode) {
          this.singleFactorAvailable = false;
          this.verifyOtp = true;
        } else {
          this.updateResendOTPStatus("Please try again");
        }
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg;
      });
  }

  onVerify() {
    this.sotpService.verifyOtp(this.verifyOtpForm.value.otp, this.credId, 'EMAIL_OTP_AUTH')
      .subscribe((data) => {
        this.displayService.routeActions(data);
      }, (err) => {
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg
      })
  }

  onRegister() {
    this.selectedCredValue = this.registerOtpForm.value.email;
    this.sotpService.registerOtp('EMAIL', this.registerOtpForm.value.email, 'EMAIL_OTP_REGISTER')
      .subscribe((data) => {
        if (data["nextaction"] === "EMAIL_OTP_AUTH") {
          this.errorDiv = false;
          this.registerOtp = this.displayService.registerOtp = false;
          this.credId = data["data"]["credId"];
          this.verifyOtp = true;
          this.displayService.flowState = data["flowState"];
          this.displayService.focusFirstField();
        }
      }, (err) => {
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg;
      });
  }

  onResendOTP() {
    if (this.existingCredential) {
      if (this._cachedFlowState) {
        this.displayService.flowState = this._cachedFlowState;
      }
      this.otpSending = true;
      this.resendOTPMessage = "Sending security code . . .";
      this.onGenerate();
    }
  }

  updateResendOTPStatus(msg) {
    if (this.otpSending) {
      this.resendOTPMessage = msg;
      clearTimeout(this.msgTimer);
      this.msgTimer = setTimeout(() => {
        this.resendOTPMessage = '';
      }, 5000);
    }
    this.otpSending = false;
  }

  factorSelect() {
    this.factorselectionService.chooseAnother();
  }
}
