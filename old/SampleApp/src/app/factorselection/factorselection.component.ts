import { Component, OnInit } from '@angular/core';
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';

@Component({
  selector: 'app-factorselection',
  templateUrl: './factorselection.component.html',
  styleUrls: ['./factorselection.component.css']
})
export class FactorselectionComponent implements OnInit {

  factorOptions: string[] = [];
  errorDiv: boolean = false;
  errorMsg: String;
  factorName: string;
  labelMap = {
    "PUSH": "Send a <strong>push request</strong>",
    "MOBILEOTP": "Use code from <strong>mobile app</strong>",
    "OTP": "Send code via <strong>(SMS/Email)</strong>",
    "FIDO": "Use <strong>biometrics</strong>",
    "SECURITYKEY": "Use a <strong>security key</strong>",
    "PASSWORD": "Enter <strong>password</strong>",
    "EMAILOTP": "<strong>Email</strong> a security code",
    "SMSOTP": "<strong>Text</strong> a security code"
  };

  constructor(private displayService: DisplayService, private factorselectionService: FactorselectionService) { }

  ngOnInit() {
    this.factorOptions = this.displayService.factorOptions;
    if (this.displayService.preferredFactor) {
      setTimeout(() => {
        let factorRadioButton = document.querySelector("input[type=radio][data-factor-name=\"" + this.displayService.preferredFactor + "\"]");
        if (factorRadioButton) {
          factorRadioButton["checked"] = true;
          let evt;
          try {
            evt = new Event('change', { bubbles: true, cancelable: true, composed: true });
          } catch (exjs) {
            evt = document.createEvent('Event');
            evt.initEvent('change', true, true);
          }
          if (evt) {
            factorRadioButton.dispatchEvent(evt);
          }
        }
      }, 100);
    }
  }

  onFactorOptionsChange(option) {
    this.factorName = option;
  }

  onSelect() {
    this.factorselectionService.onSelect(this.factorName)
      .subscribe((data) => {
        this.factorOptions = [];
        if (data["nextaction"] === "FACTOR_SELECTION") {
          this.factorOptions = data["currentFactors"];
        }
        else {
          this.displayService.routeActions(data);
        }
      }, (err) => {
        this.errorDiv = this.displayService.errorDiv;
        this.errorMsg = this.displayService.errorMsg
      })
  }
}
