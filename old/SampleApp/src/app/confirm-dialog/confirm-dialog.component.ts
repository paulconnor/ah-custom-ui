import { Component, OnInit } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  dialogVisible: boolean = false;
  heading: string;
  message: string;
  yesText: string = "Yes";
  noText: string = "No";
  closeIcon = decodeURIComponent("%E2%9C%95");
  yesCallback: Function;


  constructor(private confirmDialogService: ConfirmDialogService) { }

  ngOnInit(): void {
    this.confirmDialogService.componentInstance = () => {
      return this;
    }
    this.dialogVisible = false;
  }

  actionClose() {
    this.confirmDialogService.close();
  }

  actionYes() {
    this.yesCallback && this.yesCallback();
    this.confirmDialogService.close();
  }

  actionNo() {
    this.confirmDialogService.close();
  }

}
