import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DisplayService } from './display.service';

@Injectable({
  providedIn: 'root'
})
export class FactorselectionService {

  constructor(
    private http: HttpClient,
    private displayService: DisplayService
  ) { }

  public onSelect(factorName) {
    const postData = { factor: factorName, actionType: 'FACTOR_SELECTION' };
    return this.http.post(this.displayService.serviceUrl + 'auth/v1/SelectedFactor', postData);
  }

  public chooseAnother() {
    const postData = {
      "action": "restorelastaction",
      "LATEST-FLOW-STATE": "[LATEST-FLOW-STATE]"
    };
    this.http.post(this.displayService.serviceUrl + 'auth/v1/SelectedFactor', postData).subscribe((data) => {
      const resp = data;
      resp["skipFactorAutoRedirect"] = true;
      this.displayService.routeActions(resp);
    });
  }

}
