import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';
import { GlobalService } from '../service/global.service';
import { LdapService } from '../service/ldap.service';
import { MotpService } from '../service/motp.service';

@Component({
  selector: 'app-motp',
  templateUrl: './motp.component.html',
  styleUrls: ['./motp.component.css']
})
export class MotpComponent implements OnInit {

  multiFactor: boolean = false;
  verifyMobileOtp: boolean = false;
  qrCodeEnabled: boolean = false;
  defaultSelection: boolean = false;
  registerMobileOtp: boolean = false;
  credId = '';
  sharedSecret = '';
  mobileOtpOptions: string[] = [];
  totpOption: boolean = false;
  verifyMobileOtpForm: FormGroup;
  qrCodeEnabledForm: FormGroup;
  registerMobileOtpForm: FormGroup;
  errorDiv: boolean = false;
  errorMsg: String;
  factorSelection: boolean = false;
  selectedCredValue: string;
  vipOption: boolean = true;
  credentialId: string;
  credValue: string;
  credentialOtp: string;

  constructor(private factorselectionService: FactorselectionService, private formBuilder: FormBuilder, private router: Router, private motpService: MotpService, private LdapService: LdapService, private displayService: DisplayService, public globalService: GlobalService) { }

  ngOnInit() {
    this.factorSelection = this.displayService.factorSelection;
    this.verifyMobileOtpForm = this.formBuilder.group({
      otp: ['', Validators.required],
      sharedSecret: ['']
    })
    this.qrCodeEnabledForm = this.formBuilder.group({
      sharedSecret: [''],
      deviceName: ['', Validators.required],
      securityCode: ['', Validators.required]
    })
    this.registerMobileOtpForm = this.formBuilder.group({
      deviceName: ['', Validators.required],
      credentialId: ['', Validators.required],
      securityCode: ['', Validators.required]
    });
    this.multiFactor = this.displayService.multiFactor;
    this.registerMobileOtp = this.displayService.registerMobileOtp;
    this.mobileOtpOptions = this.displayService.mobileOtpOptions;
    this.mobileOtpOptions.forEach(function (value) {
      if (value["default"] === true) {
        this.credId = value["credId"];
        this.selectedCredValue = value["credValue"];
      }
    }.bind(this));
    if (this.mobileOtpOptions.length === 1) {
      this.credId = (<any>this.mobileOtpOptions[0]).credId;
      this.selectedCredValue = (<any>this.mobileOtpOptions[0]).credValue;
      this.onMobileOTPGenerate();
    }
    this.displayService.focusFirstField();
  }

  onScanQRCode() {
    this.credValue = this.qrCodeEnabledForm.value.deviceName;
    this.credentialOtp = this.qrCodeEnabledForm.value.securityCode;
    this.motpService.verifyMobileOtp(this.credentialOtp, this.credId, this.credValue)
      .subscribe((data) => {
        this.displayService.routeActions(data);
      },
        (err) => {
          this.errorDiv = this.displayService.errorDiv;
          this.errorMsg = this.displayService.errorMsg;
        })
  }

  selectedCredential(event: any) {
    if (event) {
      this.credId = event.credId;
      this.selectedCredValue = event.credValue;
    }
    this.onMobileOTPGenerate();
  }

  onMobileOTPGenerate() {
    this.verifyMobileOtp = true;
    this.multiFactor = false;
  }

  onMobileOTPVerify() {
    this.motpService.verifyMobileOtp(this.verifyMobileOtpForm.value.otp, this.credId, this.selectedCredValue)
      .subscribe((data) => {
        this.verifyMobileOtp = false;
        this.displayService.routeActions(data);
      },
        (err) => {
          this.errorDiv = this.displayService.errorDiv;
          this.errorMsg = this.displayService.errorMsg;
        })
  }


  onVipRegister() {
    this.credentialId = this.registerMobileOtpForm.value.credentialId;
    this.credValue = this.registerMobileOtpForm.value.deviceName;
    this.credentialOtp = this.registerMobileOtpForm.value.securityCode;
    this.selectedCredValue = this.registerMobileOtpForm.value.deviceName;
    this.motpService.registerVipMobileOtp('TOTP', this.credValue, this.credentialId.toUpperCase().split(" ").join(""), this.credentialOtp)
      .subscribe((data) => {
        this.displayService.routeActions(data);
      },
        (err) => {
          this.errorDiv = this.displayService.errorDiv;
          this.errorMsg = this.displayService.errorMsg;
        });

  }
  enableVipAccess() {
    this.registerMobileOtp = true;
    this.displayService.focusFirstField();
  }

  onMobileOTPRegister() {
    this.totpOption = true;
    let userDisplayName: String;
    let tenantName: String;
    this.selectedCredValue = this.registerMobileOtpForm.value.deviceName;
    this.motpService.registerMobileOtp('TOTP')
      .subscribe((data) => {
        if (data["nextaction"] === "MOBILEOTP_AUTH") {
          this.registerMobileOtp = false;
          this.qrCodeEnabled = true;
          this.displayService.registerMobileOtp = false;
          this.credId = data["data"]["credId"];
          userDisplayName = data["data"]["userDisplayName"];
          tenantName = data["data"]["tenantName"];
          this.sharedSecret = "otpauth://totp/";
          this.sharedSecret += tenantName + ":";
          if (userDisplayName) {
            this.sharedSecret += userDisplayName;
          }
          this.sharedSecret += "?secret=" + data["data"]["sharedSecret"] + "&issuer=" + tenantName;
          this.displayService.flowState = data["flowState"];
          this.verifyMobileOtpForm.value.sharedSecret = this.sharedSecret;
          this.displayService.focusFirstField();
        }
      },
        (err) => {
          this.errorDiv = this.displayService.errorDiv;
          this.errorMsg = this.displayService.errorMsg;
        });
  }

  factorSelect() {
    this.factorselectionService.chooseAnother();
  }

}
