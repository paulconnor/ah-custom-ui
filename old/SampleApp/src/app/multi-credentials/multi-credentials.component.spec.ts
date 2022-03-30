import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiCredentialsComponent } from './multi-credentials.component';

describe('MultiCredentialsComponent', () => {
  let component: MultiCredentialsComponent;
  let fixture: ComponentFixture<MultiCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiCredentialsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
