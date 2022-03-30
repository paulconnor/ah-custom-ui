import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BusinessmgmtComponent } from './businessmgmt.component';

describe('BusinessmgmtComponent', () => {
  let component: BusinessmgmtComponent;
  let fixture: ComponentFixture<BusinessmgmtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessmgmtComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessmgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
