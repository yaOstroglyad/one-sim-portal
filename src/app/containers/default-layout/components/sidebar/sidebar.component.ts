import { ChangeDetectionStrategy, Component, computed, inject, Input, OnDestroy, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { BrandConfig, LayoutConfig, NavItem } from '../../models';
import { LayoutService } from '../../services';
import { IconComponent, LanguageService } from '@shared';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterModule,
    IconDirective,
    IconComponent,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() navItems: NavItem[] = [];
  @Input() brandConfig!: BrandConfig;

  layoutService = inject(LayoutService);
  languageService = inject(LanguageService);
  router = inject(Router);

  // Signals
  readonly layoutConfig = signal<LayoutConfig>({
    sidebarCollapsed: false,
    darkTheme: false,
    rtlDirection: false
  });

  readonly expandedItems = signal<Set<string>>(new Set<string>());
  readonly currentRoute = signal<string>('');
  readonly currentFragment = signal<string | null>(null);
  readonly imageLoaded = signal<boolean>(false);
  readonly isMenuLoading = signal<boolean>(true);

  // Output for fragment navigation (parent component handles scrolling)
  readonly fragmentNavigation = output<string>();

  // Computed signals
  readonly sidebarClasses = computed(() => {
    return {
      'os-sidebar--collapsed': this.layoutConfig().sidebarCollapsed,
      'os-sidebar--rtl': this.languageService.isRtl(),
      'os-sidebar--mobile-open': this.layoutService.isMobileSidebarOpen()
    };
  });

  // Computed logo sources (use darkSrc if available in dark theme, otherwise use src with CSS filter)
  readonly fullLogoSrc = computed(() => {
    const isDark = this.layoutConfig().darkTheme;
    const config = this.brandConfig.full;
    return isDark && config.darkSrc ? config.darkSrc : config.src;
  });

  readonly narrowLogoSrc = computed(() => {
    const isDark = this.layoutConfig().darkTheme;
    const config = this.brandConfig.narrow;
    return isDark && config.darkSrc ? config.darkSrc : config.src;
  });

  // Whether to apply CSS filter (only when no darkSrc is provided)
  readonly useLogoFilter = computed(() => {
    const isDark = this.layoutConfig().darkTheme;
    return isDark && !this.brandConfig.full.darkSrc;
  });

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    // Initialize layout config
    this.layoutService.getLayoutConfig()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(config => {
        this.layoutConfig.set(config);
      });

    // Track current route for active state
    this.currentRoute.set(this.router.url);
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute.set(event.url);
      });

    // Simulate loading delays to show skeletons
    setTimeout(() => {
      this.isMenuLoading.set(false);
    }, 500);

    setTimeout(() => {
      this.imageLoaded.set(true);
    }, 500);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getItemType(item: NavItem): 'divider' | 'parent' | 'link' {
    if (item.divider) return 'divider';
    if (item.children && item.children.length > 0) return 'parent';
    return 'link';
  }

  isExpanded(item: NavItem): boolean {
    return this.expandedItems().has(item.name);
  }

  isParentActive(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => {
      if (this.isLinkActive(child)) return true;
      if (child.children) {
        return child.children.some(nestedChild => this.isLinkActive(nestedChild));
      }
      return false;
    });
  }

  /**
   * Check if a navigation item is active based on URL and fragment
   */
  isLinkActive(item: NavItem): boolean {
    // For fragment-based navigation
    if (item.fragment) {
      return this.currentFragment() === item.fragment;
    }

    // For regular URL navigation (without fragment)
    if (item.url) {
      const currentRoute = this.currentRoute();
      // Remove any fragment from current route for path comparison
      const hashIndex = currentRoute.indexOf('#');
      // With hash routing, URL is /#/path
      const currentPath = hashIndex > -1
        ? currentRoute.substring(hashIndex + 1).split('#')[0]
        : currentRoute;

      return currentPath === item.url || item.url === currentPath;
    }

    return false;
  }

  /**
   * Navigate to a fragment (for docs-style navigation)
   */
  navigateToFragment(item: NavItem, event: Event): void {
    if (item.fragment) {
      event.preventDefault();
      this.currentFragment.set(item.fragment);
      this.fragmentNavigation.emit(item.fragment);

      // Also navigate to the base URL if different from current
      if (item.url) {
        const currentPath = this.currentRoute().replace(/^#/, '').split('#')[0];
        if (currentPath !== item.url) {
          this.router.navigate([item.url]);
        }
      }
    }
  }

  toggleParent(item: NavItem): void {
    this.expandedItems.update(expanded => {
      const newExpanded = new Set(expanded);
      if (newExpanded.has(item.name)) {
        newExpanded.delete(item.name);
      } else {
        newExpanded.add(item.name);
      }
      return newExpanded;
    });
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  onBrandClick(): void {
    // Navigate to home/dashboard
  }

}
