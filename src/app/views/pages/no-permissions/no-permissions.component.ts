import { Component, inject, ChangeDetectionStrategy, signal, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../shared';
import { UserRoleService } from '../../../shared';
import { VisualService } from '../../../shared';

/**
 * NoPermissionsComponent - Full screen page shown when user has no valid roles
 *
 * This page is displayed when:
 * - User is authenticated (has valid JWT token)
 * - But has no valid permissions/roles configured in the system
 *
 * Actions available:
 * - Logout: Clear session and return to login
 */
@Component({
  standalone: true,
  selector: 'app-no-permissions',
  templateUrl: './no-permissions.component.html',
  styleUrls: ['./no-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule
  ]
})
export class NoPermissionsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userRoleService = inject(UserRoleService);
  private readonly visualService = inject(VisualService);
  private readonly unsubscribe$ = new Subject<void>();

  readonly logoUrl = signal<string>('');
  readonly logoHeight = signal<number>(47);

  get username(): string {
    return this.userRoleService.getLoggedUser()?.sub || 'User';
  }

  ngOnInit(): void {
    // Load visual config from API first, then subscribe to changes
    this.visualService.loadVisualConfig()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();

    // Subscribe to theme config changes
    this.visualService.getThemeConfig$()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => {
        this.logoUrl.set(config.logoUrl || '');
        this.logoHeight.set(config.height || 47);
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  logout(): void {
    this.authService.clearAndLogout();
  }
}
