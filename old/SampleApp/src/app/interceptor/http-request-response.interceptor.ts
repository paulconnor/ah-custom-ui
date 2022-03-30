import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Injectable } from "@angular/core";
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { DisplayService } from '../service/display.service';
import { EnvService } from '../service/env.service';
import { GlobalService } from '../service/global.service';
import { InitService } from '../service/init.service';

@Injectable()
export class HttpRequestResponseInterceptor implements HttpInterceptor {

  constructor(
    private initService: InitService,
    private env: EnvService,
    private displayService: DisplayService,
    private globalService: GlobalService
  ) { }


  intercept(request: any, next: HttpHandler): Observable<HttpEvent<any>> {
    let headerObj = {};
    if (request.body && request.body.actionType) {
      // get flowstate based on action type
      let flowstate = this.globalService.getFlowState(request.body.actionType);
      if (flowstate) {
        headerObj['x-flow-state'] = flowstate;
      }
      delete request.body.actionType;
    }
    if (request.body && request.body.noFlowState) {
      delete headerObj['x-flow-state'];
      delete request.body.noFlowState;
    }
    if (request.headers) {
      headerObj['X-CLIENT-TRANSACTION-ID'] = this.displayService.clientTransactionId;
    }
    if (this.displayService.bearerToken) {
      if (request.body && request.body.noToken) {
        delete request.body.noToken;
      } else {
        headerObj['Authorization'] = 'Bearer ' + this.displayService.bearerToken;
      }
    }
    if (request.body && request.body.userAccessToken) {
      headerObj['Authorization'] = 'Bearer ' + this.displayService.userAccessToken;
      delete request.body.userAccessToken;
    }
    if (request.url.includes('/MeCreds')) {
      headerObj['Authorization'] = 'Bearer ' + this.displayService.userAccessToken;
    }
    // for token
    if (request.body && request.body.basic) {
      headerObj['Authorization'] = request.body.basic;
      delete request.body.basic;
    }
    // for token
    if (request.body && request.body.payloadTypeAttribute) {
      headerObj['Content-Type'] = 'application/x-www-form-urlencoded';
      request.body = request.body.payloadTypeAttribute;
    }
    if (request.body && request.body.tenantName) {
      headerObj["X-TENANT-NAME"] = localStorage.getItem("sspTenant");
      delete request.body.tenantName;
    }
    if (request.body && request.body.deviceTag) {
      headerObj['x-device-tag'] = this.displayService.fingerPrintDna;
      delete request.body.deviceTag;
    }
    if (request.body && request.body.resetFlow) {
      headerObj['x-reset-flow'] = "true";
      headerObj['x-flow-state'] = this.globalService.latestFlowState;
      delete request.body.resetFlow;
    }
    if (request.body && request.body.rememberThisDevice) {
      headerObj['remember-this-device'] = "true";
      delete request.body.rememberThisDevice;
    }
    if (request.body && request.body.sspTDI) {
      headerObj['ssp-tdi'] = request.body.sspTDI;
      delete request.body.sspTDI;
    }
    if (request.body && request.body["LATEST-FLOW-STATE"] === "[LATEST-FLOW-STATE]") {
      headerObj['x-flow-state'] = this.globalService.latestFlowState;
      delete request.body["LATEST-FLOW-STATE"];
    }
    const headers = new HttpHeaders(headerObj);
    request = request.clone({ headers });

    const successHandler = (event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (event.body && event.body.flowState) {
          let eventBodyClone = JSON.parse(JSON.stringify(event.body));
          this.globalService.processResponse(eventBodyClone);
        }
      }
    };

    const errorHandler = (error) => {
      if (error.status === 401 && error.error && (error.error.errorCode === "0000005" || ("" + error.error.errorMessage).toLowerCase() === "invalid access token")) {
        let clientId = localStorage.getItem("client_id") || this.env.clientId;
        let clientSecret = localStorage.getItem("clientSecret") || this.env.clientSecret;
        let serviceUrl = localStorage.getItem("serviceUrl") || this.env.baseServiceUrl;
        return this.initService.getBearerToken(clientId + ":" + clientSecret, serviceUrl).pipe(switchMap((data) => {
          localStorage.setItem("accessToken", data["access_token"]);
          this.displayService.bearerToken = data["access_token"];
          let newAuthReq = request.clone({
            headers: request.headers
              .set('X-CLIENT-TRANSACTION-ID', this.displayService.clientTransactionId)
              .set("Authorization", "Bearer " + data["access_token"])
          });
          return next.handle(newAuthReq).pipe(tap(successHandler));
        }));
      } else {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          errorMsg = `Error: ${error.error.error}`;
        } else {
          if (error && error.error && error.error.errorMessage) {
            errorMsg = error.error.errorMessage;
          } else if (error && error.error && error.error.error_description) {
            errorMsg = error.error.error_description;
          } else if (error && error.error && error.error.data && error.error.data.errorMessage) {
            errorMsg = error.error.data.errorMessage;
          } else if (error && error.error && error.error.data && error.error.data.message) {
            errorMsg = error.error.data.message;
          }
          this.displayService.errorDiv = true;
          this.displayService.errorMsg = errorMsg;
        }
        return throwError(error);
      }
    };

    return next.handle(request).pipe(tap(successHandler), catchError(errorHandler));
  }
}

