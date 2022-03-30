import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LdapComponent } from './ldap.component';

describe('LdapComponent', () => {
  let component: LdapComponent;
  let fixture: ComponentFixture<LdapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LdapComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
