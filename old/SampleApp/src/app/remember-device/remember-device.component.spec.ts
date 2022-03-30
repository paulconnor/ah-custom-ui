import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RememberDeviceComponent } from './remember-device.component';

describe('RememberDeviceComponent', () => {
  let component: RememberDeviceComponent;
  let fixture: ComponentFixture<RememberDeviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RememberDeviceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RememberDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
