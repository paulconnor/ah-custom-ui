import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WealthmgmtComponent } from './wealthmgmt.component';

describe('WealthmgmtComponent', () => {
  let component: WealthmgmtComponent;
  let fixture: ComponentFixture<WealthmgmtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WealthmgmtComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WealthmgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
