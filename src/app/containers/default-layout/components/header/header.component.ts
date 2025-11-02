import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  HostListener,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { LayoutConfig } from '../../models';
import { LayoutService } from '../../services';
import { AuthService, UserAvatarComponent, BreadcrumbComponent, LanguageService, Language } from '@shared';

const DEFAULT_USER_NAME = 'John Doe';
const DEFAULT_USER_AVATAR = './assets/img/avatars/9.jpg';
const DEFAULT_NOTIFICATION_COUNT = 3;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconDirective,
    TranslateModule,
    UserAvatarComponent,
    BreadcrumbComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  languageService = inject(LanguageService);

  // Layout signals
  layoutConfig = signal<LayoutConfig>({
    sidebarCollapsed: false,
    darkTheme: false,
    rtlDirection: false
  });

  // UI state signals
  readonly isUserDropdownOpen = signal(false);
  readonly isNotificationsOpen = signal(false);
  readonly notificationCount = signal(DEFAULT_NOTIFICATION_COUNT);

  // User data signals
  readonly userName = signal(DEFAULT_USER_NAME);
  readonly userAvatar = signal(DEFAULT_USER_AVATAR);

  // Computed signals
  readonly userInitials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  readonly hasNotifications = computed(() => this.notificationCount() > 0);

  readonly headerClasses = computed(() => ({
    'header--dark': this.layoutConfig().darkTheme,
    'header--rtl': this.languageService.isRtl(),
    'header--with-collapsed-sidebar': this.layoutConfig().sidebarCollapsed
  }));

  // Language data from service
  readonly languages = computed(() => this.languageService.supportedLanguages());
  readonly currentLanguage = computed(() => this.languageService.currentLanguage());

  private unsubscribe$ = new Subject<void>();

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeAllDropdowns();
  }

  ngOnInit(): void {
    this.initializeLayoutConfig();
    this.initializeUserData();
  }

  private initializeLayoutConfig(): void {
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => {
        this.layoutConfig.set(config);
      });
  }

  private initializeUserData(): void {
    // TODO: Get actual user data from AuthService
    // Language is now handled by LanguageService automatically
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleMobileSidebar(): void {
    // This would communicate with a mobile sidebar service
    this.layoutService.toggleSidebar();
  }

  onUserAvatarClick(event: Event): void {
    event.stopPropagation();
    this.toggleUserDropdown();
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(value => !value);
    if (this.isUserDropdownOpen()) {
      this.isNotificationsOpen.set(false);
    }
  }

  onBackdropClick(): void {
    this.closeAllDropdowns();
  }

  closeAllDropdowns(): void {
    this.isUserDropdownOpen.set(false);
    this.isNotificationsOpen.set(false);
  }

  changeLang(lang: string): void {
    this.languageService.setLanguage(lang); // This will handle translation, RTL, and storage
    this.closeAllDropdowns();
  }

  private executeWithDropdownClose(action: () => void): void {
    this.closeAllDropdowns();
    action();
  }

  goToProfile(): void {
    this.executeWithDropdownClose(() => {
      // Navigate to profile
    });
  }

  goToNotifications(): void {
    this.executeWithDropdownClose(() => {
      // Navigate to notifications
    });
  }

  goToSettings(): void {
    this.executeWithDropdownClose(() => {
      // Navigate to settings
    });
  }

  logout(): void {
    this.executeWithDropdownClose(() => {
      this.authService.clearAndLogout();
    });
  }

}
