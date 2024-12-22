import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthService } from '../auth';
import { HasPermissionDirective } from './has-permission.directive';
import { of } from 'rxjs';

@Component({
  template: `
    <div *appHasPermission="[ADMIN_PERMISSION]">Admin Content</div>
    <div *appHasPermission="['userAccess']">User Content</div>
  `
})
class TestComponent {}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let authService: AuthService;

  beforeEach(() => {
    const authServiceMock = {
      hasPermission: (permission: string) => of(permission === ADMIN_PERMISSION)
    };

    TestBed.configureTestingModule({
      declarations: [TestComponent, HasPermissionDirective],
      providers: [{ provide: AuthService, useValue: authServiceMock }]
    });

    fixture = TestBed.createComponent(TestComponent);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should display content for admin access', () => {
    const adminContent = fixture.debugElement.query(By.css('div:first-child'));
    expect(adminContent).toBeTruthy();
    expect(adminContent.nativeElement.textContent).toContain('Admin Content');
  });

  it('should not display content for user access', () => {
    const userContent = fixture.debugElement.query(By.css('div:last-child'));
    expect(userContent).toBeNull();
  });
});
