import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';

@Component({
  selector: 'app-multi-credentials',
  templateUrl: './multi-credentials.component.html',
  styleUrls: ['./multi-credentials.component.css']
})
export class MultiCredentialsComponent implements OnInit {

  @Input() errorMsg: string;
  @Input() credentialOptions: string;
  @Input() buttonLabel: string;
  @Output() selectedCredential = new EventEmitter();
  credential: any;
  factorSelection: boolean = false
  clicked: boolean = false;

  constructor(private factorselectionService: FactorselectionService, private router: Router, private displayService: DisplayService) { }

  ngOnInit(): void {
    this.factorSelection = this.displayService.factorSelection;
    this.handleDefaultSelection();
  }

  handleDefaultSelection() {
    setTimeout(() => {
      let checkedRadioButton = document.querySelector("input[type=radio].js-radio-multi-cred:checked");
      if (checkedRadioButton) {
        let evt;
        try {
          evt = new Event('change', { bubbles: true, cancelable: true, composed: true });
        } catch (exjs) {
          evt = document.createEvent('Event');
          evt.initEvent('change', true, true);
        }
        if (evt) {
          checkedRadioButton.dispatchEvent(evt);
        }
      }
    }, 100);
  }

  onSelect(cred) {
    this.credential = cred;
  }

  onSendCode() {
    this.clicked = true;
    this.selectedCredential.emit(this.credential);
    this.displayService.focusFirstField(200);
  }

  factorSelect() {
    this.factorselectionService.chooseAnother();
  }

}
