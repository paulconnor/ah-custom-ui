import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../modal/modal.service';
import { DisplayService } from '../service/display.service';
import { EnvService } from '../service/env.service';
import { InitService } from '../service/init.service';
import { WelcomeService } from '../service/welcome.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  userName = null;
  idToken = null;
  userAccessToken = null;
  accessToken = null;
  displayInvestments: boolean = false;
  errorDiv = false;
  errorMsg: string;
  clientSecret: string;
  clientId: string;

  constructor(public displayService: DisplayService, private router: Router, private initService: InitService, private modalService: ModalService, private welcomeService: WelcomeService, private env: EnvService) {

  }

  ngOnInit() {
    this.userName = this.displayService.userName;
    this.idToken = this.displayService.idToken;
    this.accessToken = this.displayService.bearerToken;
    this.displayInvestments = this.displayService.investments;
    this.clientSecret = localStorage.getItem("clientSecret") || this.env.clientSecret;
    this.clientId = localStorage.getItem("client_id") || this.env.clientId;
    localStorage.setItem("idToken", this.displayService.idToken);
    document.querySelector("body").classList.add("authenticatedUser");
    if (this.userName) {
      this.initService.getUserAccessToken(this.idToken, this.clientId, this.clientSecret)
        .subscribe((response) => {
          this.userAccessToken = response['access_token'];
          this.displayService.userAccessToken = this.userAccessToken;
          localStorage.setItem("userAccessToken", this.displayService.userAccessToken)
          this.welcomeService.getUserInfo(this.userAccessToken).subscribe(
            (response) => {
              this.displayService.uatFailed = false;
              if (response["family_name"] === undefined || response["given_name"] === undefined) {
                this.displayService.loginName = this.userName;
              } else {
                let familyName = response["family_name"]
                this.userName = response["given_name"] + " " + familyName.charAt(0).toUpperCase() + familyName.slice(1).toLowerCase();
                this.displayService.loginName = this.userName;
              }
            }
          )
        }, (err) => {
          this.displayService.uatFailed = true;
        });
    } else {
      this.router.navigate(['']);
    }
  }

  stepUp() {
    this.displayService.investments = true;
    this.welcomeService.stepUp(this.displayService.fingerPrintDna, this.displayService.ipAddress, this.displayService.idToken, this.displayService.userName, "investment", false).
      subscribe(
        (data) => {
          this.errorDiv = false;
          this.errorMsg = "";
          if (data["nextaction"] === "AUTH_ALLOWED") {
            this.displayInvestments = true;
          }
          else {
            this.displayService.routeActions(data);
          }
        },
        (err) => {
          if (err.error && err.error.errorMessage) {
            this.errorDiv = true;
            this.errorMsg = err.error.errorMessage;
          } else {
            this.errorDiv = true;
            this.errorMsg =
              "Unknown error in authenticating User " + this.userName;
          }
        }
      );
  }

  closeModalCancel(id: string) {
    this.modalService.close(id);
  }

  openModal(id: string) {
    this.modalService.open(id);
  }
}
