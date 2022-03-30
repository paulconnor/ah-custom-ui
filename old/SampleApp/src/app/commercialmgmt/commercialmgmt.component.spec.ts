import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommercialmgmtComponent } from './commercialmgmt.component';

describe('CommercialmgmtComponent', () => {
  let component: CommercialmgmtComponent;
  let fixture: ComponentFixture<CommercialmgmtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CommercialmgmtComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialmgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
