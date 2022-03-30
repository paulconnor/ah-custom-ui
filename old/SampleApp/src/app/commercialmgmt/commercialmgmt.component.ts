import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DisplayService } from '../service/display.service';


@Component({
  selector: 'app-commercialmgmt',
  templateUrl: './commercialmgmt.component.html',
  styleUrls: ['./commercialmgmt.component.css']
})
export class CommercialmgmtComponent implements OnInit {

  userName = null;
  constructor(private displayService: DisplayService, private router: Router) { }

  ngOnInit() {
    this.userName = this.displayService.loginName;
    if (!this.userName) {
      this.router.navigate(['']);
    }
  }

}
