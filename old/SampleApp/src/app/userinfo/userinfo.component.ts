import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../service/global.service';
import { Router } from '@angular/router';
import { InitService } from '../service/init.service';

@Component({
  selector: 'app-userinfo',
  templateUrl: './userinfo.component.html',
  styleUrls: ['./userinfo.component.css']
})
export class UserinfoComponent implements OnInit {

  userName: string;

  constructor(private globalService: GlobalService, private router: Router, private initService: InitService) { }

  ngOnInit(): void {
    this.userName = this.globalService.getUserName();
  }

  notUser() {
    if (sessionStorage.getItem("sampleAppPath")) {
      window.location.replace(sessionStorage.getItem("sampleAppPath") + "?restart=true");
    } else {
      this.globalService.doResetFlow();
      this.router.navigate(['']);
      this.initService.loginEnabled = true;
    }
  }
}
