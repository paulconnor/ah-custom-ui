import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InvestmgmtComponent } from './investmgmt.component';

describe('InvestmgmtComponent', () => {
  let component: InvestmgmtComponent;
  let fixture: ComponentFixture<InvestmgmtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InvestmgmtComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
