import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { DisplayService } from "../service/display.service";


@Component({
  selector: "app-businessmgmt",
  templateUrl: "./businessmgmt.component.html",
  styleUrls: ["./businessmgmt.component.css"],
})
export class BusinessmgmtComponent implements OnInit, OnDestroy {
  userName = null;
  reauthMessage: string;
  reauthSubs: Subscription;
  constructor(private displayService: DisplayService, private router: Router) { }

  ngOnInit() {
    this.userName = this.displayService.loginName;
    if (this.displayService.reauthMessage && this.displayService.reauthMessage.startsWith("Reauthentication")) {
      this.reauthMessage = this.displayService.reauthMessage;
    }
    this.reauthSubs = this.displayService.reauthObservable.subscribe((data) => {
      this.reauthMessage = data;
    });
    if (!this.userName) {
      this.router.navigate(['']);
    }
  }

  ngOnDestroy() {
    this.reauthSubs.unsubscribe();
  }
}
