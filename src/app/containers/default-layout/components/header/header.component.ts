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
import {
  AuthService,
  UserAvatarComponent,
  LanguageService,
  Language,
  OsMenuComponent,
  OsMenuItem,
  OsMenuSection,
  HeaderSearchComponent
} from '@shared';

const DEFAULT_USER_NAME = 'John Doe';
const DEFAULT_USER_AVATAR = './assets/img/avatars/9.jpg';
const DEFAULT_NOTIFICATION_COUNT = 3;

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    IconDirective,
    TranslateModule,
    UserAvatarComponent,
    OsMenuComponent,
    HeaderSearchComponent
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
  readonly notificationCount = signal(DEFAULT_NOTIFICATION_COUNT);

  // User data signals
  readonly userName = signal(DEFAULT_USER_NAME);
  readonly userAvatar = signal(DEFAULT_USER_AVATAR);

  // Computed signals
  readonly userInitials = computed(() => {
    const name = this.userName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  });

  readonly headerClasses = computed(() => ({
    'header--rtl': this.languageService.isRtl()
  }));

  // Theme toggle
  readonly isDarkTheme = computed(() => this.layoutConfig().darkTheme);

  // Language data from service
  readonly languages = computed(() => this.languageService.supportedLanguages());
  readonly currentLanguage = computed(() => this.languageService.currentLanguage());

  // Menu sections for os-menu
  readonly userMenuSections = computed<OsMenuSection[]>(() => {
    const langs = this.languages();
    const currentLang = this.currentLanguage();
    const notifCount = this.notificationCount();

    return [
      {
        title: 'default-header.language',
        items: langs.map(lang => ({
          id: `lang-${lang.code}`,
          label: lang.name,
          active: currentLang === lang.code,
          action: () => this.changeLang(lang.code)
        }))
      },
      {
        title: 'default-header.account',
        items: [
          {
            id: 'profile',
            label: 'default-header.profile',
            action: () => this.goToProfile()
          },
          {
            id: 'notifications',
            label: 'default-header.notifications',
            badge: notifCount > 0 ? notifCount : undefined,
            action: () => this.goToNotifications()
          }
        ]
      },
      {
        title: 'default-header.settings',
        items: [
          {
            id: 'settings',
            label: 'default-header.settings',
            icon: 'settings',
            action: () => this.goToSettings()
          },
          {
            id: 'logout',
            label: 'default-header.logout',
            danger: true,
            action: () => this.logout()
          }
        ]
      }
    ];
  });

  private unsubscribe$ = new Subject<void>();

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
    console.log('[Header] toggleMobileSidebar called');
    this.layoutService.toggleMobileSidebar();
  }

  toggleUserMenu(): void {
    this.isUserDropdownOpen.update(value => !value);
  }

  closeUserMenu(): void {
    this.isUserDropdownOpen.set(false);
  }

  changeLang(lang: string): void {
    this.languageService.setLanguage(lang); // This will handle translation, RTL, and storage
  }

  goToProfile(): void {
    // Navigate to profile
    console.log('Navigate to profile');
  }

  goToNotifications(): void {
    // Navigate to notifications
    console.log('Navigate to notifications');
  }

  goToSettings(): void {
    // Navigate to settings
    console.log('Navigate to settings');
  }

  logout(): void {
    this.authService.clearAndLogout();
  }

  toggleTheme(): void {
    this.layoutService.toggleTheme();
  }
}
