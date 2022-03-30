import { Component, OnInit } from '@angular/core';
import { GlobalService } from '../service/global.service';
import { RememberDeviceService } from '../service/remember-device.service';

@Component({
  selector: 'app-remember-device',
  templateUrl: './remember-device.component.html',
  styleUrls: ['./remember-device.component.css']
})
export class RememberDeviceComponent implements OnInit {

  constructor(public globalService: GlobalService, public rdService: RememberDeviceService) { }

  ngOnInit(): void {
    this.rdService.rememberDeviceChecked = false;
  }

  tooltipClick(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  handleMouseDown(evt) {
    evt.preventDefault();
  }
}
