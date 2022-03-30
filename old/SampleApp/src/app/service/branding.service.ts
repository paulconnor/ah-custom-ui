import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class BrandingService {

  private settings: any;

  constructor(
    private httpClient: HttpClient
  ) { }

  loadSettings(clientId: any, serviceUrl: string) {
    let paramSuffix = "?clientId=" + clientId;
    serviceUrl = serviceUrl + "admin/v1/BrandingSettings";
    return this.httpClient.get(serviceUrl + paramSuffix);
  }

  setSettings(settings) {
    this.settings = settings;
  }

  getSettings() {
    return this.settings || { 'featureFlags': {} };
  }

  getBrowserLang() {
    let fallback = "en_US";
    if (typeof window === "undefined" || typeof window.navigator === "undefined") {
      return fallback;
    }
    let browserLang = window.navigator.languages ? window.navigator.languages[0] : null;
    browserLang = browserLang || window.navigator.language || window.navigator["browserLanguage"] || window.navigator["userLanguage"];
    if (typeof browserLang === "undefined") {
      return fallback;
    }
    if (browserLang.indexOf("-") !== -1) {
      browserLang = browserLang.split("-").join("_");
    }
    if (!browserLang || browserLang.length < 5 || browserLang.indexOf("_") === -1) {
      return fallback;
    }
    let browserLangParts = browserLang.split("_");
    browserLangParts[1] = (browserLangParts[1] || "").toUpperCase();
    browserLang = browserLangParts.join("_");
    return browserLang;
  }

}
