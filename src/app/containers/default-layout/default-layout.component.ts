import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil, skip } from 'rxjs';

import { navItems } from './_nav';
import { NavItem, BrandConfig, LayoutConfig } from './models';
import { LayoutService } from './services';
import { VisualConfig, isToggleActive, VisualService, AuthService, LanguageService } from '../../shared';
import { SidebarComponent } from './components';
import { HeaderComponent } from './components';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  translateService = inject(TranslateService);
  visualService = inject(VisualService);
  layoutService = inject(LayoutService);
  languageService = inject(LanguageService);
  cdr = inject(ChangeDetectorRef);

  private unsubscribe$ = new Subject<void>();

  translatedNavItems: NavItem[] = [];
  brandConfig: BrandConfig = {
    full: {
      src: '',
      height: 47,
      alt: 'logo'
    },
    narrow: {
      src: '',
      width: 35,
      alt: 'logo'
    }
  };

  layoutConfig: LayoutConfig = {
    sidebarCollapsed: false,
    darkTheme: false,
    rtlDirection: false
  };

  isMobileSidebarOpen = false;
  currentYear = new Date().getFullYear();

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.filterAndTranslateNavItems();

    // Load visual configuration
    this.visualService.loadVisualConfig().subscribe();

    // Subscribe to layout changes
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => {
        this.layoutConfig = config;
        this.cdr.markForCheck();
      });

    // Subscribe to theme config changes
    this.visualService.getThemeConfig$()
      .pipe(
        skip(1),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(config => {
        this.updateBranding(config);
      });

    // Subscribe to language changes
    this.translateService.onLangChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((event: LangChangeEvent) => {
        this.filterAndTranslateNavItems();
        this.cdr.markForCheck();
      });
  }

  private updateBranding(config: VisualConfig): void {
    this.brandConfig = {
      full: {
        src: config.logoUrl,
        height: config.height || 47,
        alt: 'logo'
      },
      narrow: {
        src: config.faviconUrl,
        width: 35,
        alt: 'logo'
      }
    };
    this.cdr.markForCheck();
  }

  private filterAndTranslateNavItems(): void {
    this.translatedNavItems = this.processNavItems(navItems);
  }

  private processNavItems(items: any[]): NavItem[] {
    return items
      .map(item => {
        if (item.permissions && !item.permissions.some(p => this.authService.hasPermission(p))) {
          return null;
        }

        if (item.featureToggle && !isToggleActive(item.featureToggle)) {
          return null;
        }

        const newItem: NavItem = {
          ...item,
          name: item.name ? this.translateService.instant(item.name) : undefined,
          children: item.children ? this.processNavItems(item.children) : undefined
        };

        if (newItem.children?.length === 0) {
          delete newItem.children;
        }

        return newItem;
      })
      .filter(Boolean) as NavItem[];
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}
