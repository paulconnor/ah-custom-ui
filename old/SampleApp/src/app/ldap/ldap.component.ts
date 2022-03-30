import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DisplayService } from '../service/display.service';
import { FactorselectionService } from '../service/factorselection.service';
import { LdapService } from '../service/ldap.service';

@Component({
  selector: 'app-ldap',
  templateUrl: './ldap.component.html',
  styleUrls: ['./ldap.component.css']
})
export class LdapComponent implements OnInit {
  passwordEnabled = false;
  errorMsg: String;
  errorDiv: boolean = false;
  userName = null;
  xFlow: string;
  passwordForm: FormGroup;
  factorSelection: boolean = false;
  inlineMessage: string;

  constructor(private factorselectionService: FactorselectionService, private formBuilder: FormBuilder, private router: Router, private ldapService: LdapService, private displayService: DisplayService) { }

  ngOnInit() {
    this.inlineMessage = (this.displayService.inlineMessage || "").replace(/FIDO/g, "biometrics").replace(/SECURITYKEY/g, 'security key');
    this.passwordForm = this.formBuilder.group({
      password: ['', Validators.required]
    });
    this.passwordEnabled = this.displayService.passwordEnabled;
    this.factorSelection = this.displayService.factorSelection;
    this.displayService.focusFirstField();
  }

  onPasswordSubmit() {
    this.ldapService.onPasswordLogin(this.passwordForm.value.password).subscribe((data) => {
      this.displayService.routeActions(data);
    }, (err) => {
      this.errorDiv = this.displayService.errorDiv;
      this.errorMsg = this.displayService.errorMsg;
    });
  }

  factorSelect() {
    this.factorselectionService.chooseAnother();
  }
}
