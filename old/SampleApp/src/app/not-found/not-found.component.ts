import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    let sampleAppPath = sessionStorage.getItem("sampleAppPath");
    if (sampleAppPath) {
      window.location.replace(sampleAppPath);
    }
  }

}
