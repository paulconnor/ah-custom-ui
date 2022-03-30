import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MotpComponent } from './motp.component';

describe('MotpComponent', () => {
  let component: MotpComponent;
  let fixture: ComponentFixture<MotpComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MotpComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
