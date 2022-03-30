import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  componentInstance: () => ConfirmDialogComponent;
  constructor() { }

  open(heading: string, message: string, callback?: Function, options?: any) {
    if (this.componentInstance) {
      let comp = this.componentInstance();
      if (!comp) {
        return;
      }
      comp.heading = heading;
      comp.message = message;
      comp.yesCallback = callback;
      comp.yesText = options && options.yesText || "Yes";
      comp.noText = options && options.noText || "No";
      comp.dialogVisible = true;
    }
  }

  close() {
    if (this.componentInstance) {
      let comp = this.componentInstance();
      if (!comp) {
        return;
      }
      comp.heading = "";
      comp.message = "";
      comp.yesCallback = null;
      comp.yesText = "Yes";
      comp.noText = "No";
      comp.dialogVisible = false;
    }
  }
}
