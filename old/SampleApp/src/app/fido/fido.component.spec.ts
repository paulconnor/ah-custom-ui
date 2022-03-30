import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FidoComponent } from './fido.component';

describe('FidoComponent', () => {
  let component: FidoComponent;
  let fixture: ComponentFixture<FidoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FidoComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
