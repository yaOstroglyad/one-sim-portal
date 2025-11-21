import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NavItem, BrandConfig, LayoutConfig } from '../../models';
import { LayoutService } from '../../services';
import { LanguageService, IconComponent } from '@shared';

@Component({
  selector: 'app-sidebar',
  standalone: true,
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
  readonly imageLoaded = signal<boolean>(false);
  readonly isMenuLoading = signal<boolean>(true);

  // Computed signals
  readonly sidebarClasses = computed(() => {
    const classes = {
      'sidebar--collapsed': this.layoutConfig().sidebarCollapsed,
      'sidebar--dark': this.layoutConfig().darkTheme,
      'sidebar--rtl': this.languageService.isRtl(),
      'sidebar--mobile-open': this.layoutService.isMobileSidebarOpen()
    };
    console.log('[Sidebar] sidebarClasses computed:', classes);
    return classes;
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
    const currentRoute = this.currentRoute();
    return item.children.some(child => {
      if (child.url && currentRoute.startsWith(child.url)) return true;
      if (child.children) {
        return child.children.some(nestedChild =>
          nestedChild.url && currentRoute.startsWith(nestedChild.url)
        );
      }
      return false;
    });
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
