import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ADMIN_PERMISSION, AuthService } from '@shared/auth';
import { HasPermissionDirective } from '@shared';

@Component({
    template: `
    <div *appHasPermission="[ADMIN_PERMISSION]">Admin Content</div>
    <div *appHasPermission="['userAccess']">User Content</div>
  `,
    standalone: true,
    imports: [HasPermissionDirective]
})
class TestComponent {
  protected readonly ADMIN_PERMISSION = ADMIN_PERMISSION;
}

describe('HasPermissionDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    const authServiceMock = {
      hasPermission: (permission: string) => permission === ADMIN_PERMISSION
    };

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }]
    }).compileComponents();

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
    const allDivs = fixture.debugElement.queryAll(By.css('div'));
    // Only admin content should be rendered, user content should be hidden
    expect(allDivs.length).toBe(1);
    expect(allDivs[0].nativeElement.textContent).toContain('Admin Content');
  });
});
