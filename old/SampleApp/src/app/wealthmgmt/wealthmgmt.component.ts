import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';

@Component({
  selector: 'app-wealthmgmt',
  templateUrl: './wealthmgmt.component.html',
  styleUrls: ['./wealthmgmt.component.css']
})
export class WealthmgmtComponent implements OnInit {

  userName = null;
  constructor(private displayService: DisplayService, private router: Router) { }

  ngOnInit() {
    this.userName = this.displayService.loginName;
    if (!this.userName) {
      this.router.navigate(['']);
    }
  }

}
