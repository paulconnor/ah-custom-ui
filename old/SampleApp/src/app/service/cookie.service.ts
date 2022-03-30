import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  constructor() { }

  private getPathForCookie() {
    let path;
    if (environment.development) {
      path = "/";
    } else {
      let sampleAppPath = sessionStorage.getItem("sampleAppPath");
      path = sampleAppPath ? sampleAppPath.split("/sample-app")[0] + "/sample-app/" : "sample-app";
    }
    return path;
  }

  private checkValid_eTLD1(eTLD1) {
    var _suffix = parseInt(("" + Math.random()).split(".").reverse().join()).toString(36);
    document.cookie = "__eTLD1_test" + _suffix + "=01;domain=" + eTLD1 + ";path=/";
    if (document.cookie.indexOf("__eTLD1_test" + _suffix) > -1) {
      var dt = new Date();
      dt.setTime(dt.getTime() - 99999);
      document.cookie = "__eTLD1_test" + _suffix + "=01;domain=" + eTLD1 + ";expires=" + dt.toUTCString() + ";path=/";
      return true;
    }
    return false;
  }

  eTLD1() {
    let hostname = window.location.hostname;
    let parts = hostname.split(".");
    let _eTLD1 = "";
    for (let i = parts.length - 1; i >= 0; i--) {
      _eTLD1 = parts[i] + (_eTLD1 ? "." + _eTLD1 : "");
      if (this.checkValid_eTLD1(_eTLD1)) {
        return _eTLD1;
      }
    }
  }

  setCookie(name, value, expires?: Date, options?: any) {
    if (!name || !value) {
      return;
    }
    let path = this.getPathForCookie();
    let expiresStr = "";
    if (expires) {
      expiresStr = ";expires=" + expires.toUTCString();
    }
    let domainStr = "";
    if (options) {
      if (options.domain) {
        domainStr = ";domain=" + options.domain;
      }
    }
    if (window.location.protocol === "https:") {
      document.cookie = "__Secure-" + name + "=" + encodeURIComponent(value) + expiresStr + domainStr + ";path=" + path + ";secure;samesite=lax;";
    } else {
      document.cookie = name + "=" + encodeURIComponent(value) + expiresStr + domainStr + ";path=" + path + ";samesite=lax;";
    }
  }

  getCookie(name) {
    if (window.location.protocol === "https:") {
      name = "__Secure-" + name;
    }
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].indexOf(name + "=") === 0) {
        return decodeURIComponent(cookies[i].split("=").slice(1).join("="));
      }
    }
    return null;
  }

  getCookieInsecure(name) {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      if (cookies[i].indexOf(name + "=") === 0) {
        return decodeURIComponent(cookies[i].split("=").slice(1).join("="));
      }
    }
    return null;
  }

  removeCookie(name, options?: any) {
    let path = this.getPathForCookie();
    let dt = new Date();
    dt.setTime(dt.getTime() - 99999);
    let domainStr = "";
    if (options) {
      if (options.domain) {
        domainStr = ";domain=" + options.domain;
      }
    }
    if (window.location.protocol === "https:") {
      document.cookie = "__Secure-" + name + "=null;expires=" + dt.toUTCString() + domainStr + ";path=" + path + ";secure;samesite=lax;";
    } else {
      document.cookie = name + "=null;expires=" + dt.toUTCString() + domainStr + ";path=" + path + ";samesite=lax;";
    }
  }

}
