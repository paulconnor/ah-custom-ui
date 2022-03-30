import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactorselectionComponent } from './factorselection.component';

describe('FactorselectionComponent', () => {
  let component: FactorselectionComponent;
  let fixture: ComponentFixture<FactorselectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FactorselectionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactorselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
