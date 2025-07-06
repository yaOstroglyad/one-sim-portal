/**
 * Main Sidebar Component
 * 
 * Comprehensive sidebar component based on Tailwind Catalyst design patterns
 * with full Angular integration, responsive behavior, and accessibility features
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  Inject,
  PLATFORM_ID,
  Optional
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { 
  SidebarConfig, 
  SidebarData, 
  SidebarEvents, 
  SidebarState, 
  SidebarItem,
  SidebarSection,
  DEFAULT_SIDEBAR_CONFIG,
  DEFAULT_SIDEBAR_ACCESSIBILITY,
  DEFAULT_SIDEBAR_ANIMATION
} from './sidebar.types';

@Component({
  selector: 'os-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar',
    '[class.os-sidebar--open]': 'currentState === "open"',
    '[class.os-sidebar--closed]': 'currentState === "closed"',
    '[class.os-sidebar--collapsed]': 'currentState === "collapsed"',
    '[class.os-sidebar--left]': 'config.position === "left"',
    '[class.os-sidebar--right]': 'config.position === "right"',
    '[class.os-sidebar--compact]': 'config.variant === "compact"',
    '[class.os-sidebar--minimal]': 'config.variant === "minimal"',
    '[class.os-sidebar--floating]': 'config.variant === "floating"',
    '[class.os-sidebar--rtl]': 'config.rtl',
    '[class.os-sidebar--dark]': 'config.theme === "dark"',
    '[class.os-sidebar--responsive]': 'config.responsive',
    '[class.d-print-none]': 'true',
    '[attr.aria-label]': 'accessibility.ariaLabel',
    '[attr.aria-labelledby]': 'accessibility.ariaLabelledBy',
    '[attr.aria-describedby]': 'accessibility.ariaDescribedBy',
    '[attr.role]': 'accessibility.role',
    '[attr.tabindex]': 'accessibility.tabIndex',
    '[style.z-index]': 'config.zIndex',
    '[style.--sidebar-expanded-width]': 'config.expandedWidth',
    '[style.--sidebar-collapsed-width]': 'config.collapsedWidth',
    '[style.--sidebar-animation-duration]': 'config.animationDuration + "ms"'
  }
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidebarContainer', { static: true }) sidebarContainer!: ElementRef<HTMLElement>;
  @ViewChild('backdrop', { static: false }) backdrop?: ElementRef<HTMLElement>;

  // Configuration inputs
  @Input() config: SidebarConfig = DEFAULT_SIDEBAR_CONFIG;
  @Input() data: SidebarData = { sections: [] };
  @Input() events: SidebarEvents = {};
  @Input() accessibility = DEFAULT_SIDEBAR_ACCESSIBILITY;
  @Input() animation = DEFAULT_SIDEBAR_ANIMATION;

  // State inputs
  @Input() set isOpen(value: boolean) {
    this.setState(value ? 'open' : 'closed');
  }

  @Input() set collapsed(value: boolean) {
    this.setState(value ? 'collapsed' : 'open');
  }

  // Event outputs
  @Output() stateChanged = new EventEmitter<SidebarState>();
  @Output() itemClicked = new EventEmitter<SidebarItem>();
  @Output() sectionToggled = new EventEmitter<SidebarSection>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() backdropClicked = new EventEmitter<void>();

  // Component state
  currentState: SidebarState = 'closed';
  isMobile = false;
  isTablet = false;
  currentRoute = '';
  
  // Internal subjects
  private destroy$ = new Subject<void>();
  private resizeObserver?: ResizeObserver;
  private focusedElementBeforeOpen?: HTMLElement;

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Merge default config with provided config
    this.config = { ...DEFAULT_SIDEBAR_CONFIG, ...this.config };
    this.accessibility = { ...DEFAULT_SIDEBAR_ACCESSIBILITY, ...this.accessibility };
    this.animation = { ...DEFAULT_SIDEBAR_ANIMATION, ...this.animation };
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupRouterSubscription();
    this.setupResizeObserver();
    this.setupEventHandlers();
    this.initializeState();
  }

  ngAfterViewInit(): void {
    this.setupFocusManagement();
    this.updateBreakpoints();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component configuration and state
   */
  private initializeComponent(): void {
    // Apply RTL direction if needed
    if (this.config.rtl) {
      this.renderer.addClass(this.elementRef.nativeElement, 'os-sidebar--rtl');
    }

    // Apply custom CSS classes
    if (this.config.customClasses) {
      this.config.customClasses.split(' ').forEach(className => {
        this.renderer.addClass(this.elementRef.nativeElement, className);
      });
    }

    // Set initial state
    this.currentState = this.config.initialState || 'closed';
  }

  /**
   * Setup router navigation subscription
   */
  private setupRouterSubscription(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updateActiveItems();
        this.cdr.markForCheck();
      });
  }

  /**
   * Setup resize observer for responsive behavior
   */
  private setupResizeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resizeObserver = new ResizeObserver(_entries => {
      this.updateBreakpoints();
      this.handleResponsiveChanges();
    });

    this.resizeObserver.observe(document.body);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Escape key handler
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(event => event.key === 'Escape'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.currentState === 'open' && this.isMobile) {
          this.close();
        }
      });

    // Click outside handler
    fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => !this.elementRef.nativeElement.contains(event.target as Node)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.currentState === 'open' && this.isMobile && this.config.backdropCloseable) {
          this.close();
        }
      });

    // Touch events for mobile swipe
    if (this.config.responsive) {
      this.setupTouchEvents();
    }
  }

  /**
   * Setup touch events for mobile swipe gestures
   */
  private setupTouchEvents(): void {
    let startX = 0;
    let startY = 0;
    let isSwipeStarted = false;

    const touchStart = (event: TouchEvent) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      isSwipeStarted = true;
    };

    const touchMove = (event: TouchEvent) => {
      if (!isSwipeStarted) return;

      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // Prevent vertical scroll if horizontal swipe detected
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        event.preventDefault();
      }
    };

    const touchEnd = (event: TouchEvent) => {
      if (!isSwipeStarted) return;

      const endX = event.changedTouches[0].clientX;
      const deltaX = endX - startX;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(deltaX) > threshold) {
        if (this.config.position === 'left') {
          if (deltaX > 0 && this.currentState === 'closed') {
            this.open();
          } else if (deltaX < 0 && this.currentState === 'open') {
            this.close();
          }
        } else if (this.config.position === 'right') {
          if (deltaX < 0 && this.currentState === 'closed') {
            this.open();
          } else if (deltaX > 0 && this.currentState === 'open') {
            this.close();
          }
        }
      }

      isSwipeStarted = false;
    };

    this.elementRef.nativeElement.addEventListener('touchstart', touchStart, { passive: false });
    this.elementRef.nativeElement.addEventListener('touchmove', touchMove, { passive: false });
    this.elementRef.nativeElement.addEventListener('touchend', touchEnd, { passive: true });
  }

  /**
   * Initialize component state
   */
  private initializeState(): void {
    this.setState(this.config.initialState || 'closed');
  }

  /**
   * Setup focus management for accessibility
   */
  private setupFocusManagement(): void {
    if (!this.accessibility.focusTrap) return;

    // Focus trap implementation would go here
    // For now, we'll handle basic focus management
    this.elementRef.nativeElement.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        this.handleTabKey(event);
      }
    });
  }

  /**
   * Handle tab key for focus trapping
   */
  private handleTabKey(event: KeyboardEvent): void {
    if (this.currentState !== 'open') return;

    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  /**
   * Get focusable elements within sidebar
   */
  private getFocusableElements(): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    return Array.from(
      this.elementRef.nativeElement.querySelectorAll(focusableSelectors.join(', '))
    ) as HTMLElement[];
  }

  /**
   * Update breakpoints based on current viewport
   */
  private updateBreakpoints(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const width = window.innerWidth;
    const breakpoint = parseInt(this.config.breakpoint || '768');

    this.isMobile = width < breakpoint;
    this.isTablet = width >= breakpoint && width < 1024;
  }

  /**
   * Handle responsive changes
   */
  private handleResponsiveChanges(): void {
    if (!this.config.responsive) return;

    if (this.isMobile) {
      // On mobile, always start closed
      if (this.currentState === 'open') {
        this.setState('closed');
      }
    } else {
      // On desktop, can be open by default
      if (this.config.initialState === 'open' && this.currentState === 'closed') {
        this.setState('open');
      }
    }
  }

  /**
   * Update active items based on current route
   */
  private updateActiveItems(): void {
    this.data.sections.forEach(section => {
      section.items.forEach(item => {
        this.updateItemActiveState(item);
      });
    });
  }

  /**
   * Update active state for a single item
   */
  private updateItemActiveState(item: SidebarItem): void {
    if (item.routerLink) {
      const routerLink = Array.isArray(item.routerLink) ? item.routerLink.join('/') : item.routerLink;
      item.active = item.exactMatch ? 
        this.currentRoute === routerLink : 
        this.currentRoute.startsWith(routerLink);
    } else if (item.href) {
      item.active = this.currentRoute === item.href;
    }

    // Update child items
    if (item.children) {
      item.children.forEach(child => this.updateItemActiveState(child));
    }
  }

  /**
   * Public API methods
   */
  
  /**
   * Open the sidebar
   */
  open(): void {
    this.setState('open');
  }

  /**
   * Close the sidebar
   */
  close(): void {
    this.setState('closed');
  }

  /**
   * Toggle the sidebar state
   */
  toggle(): void {
    this.setState(this.currentState === 'open' ? 'closed' : 'open');
  }

  /**
   * Collapse the sidebar
   */
  collapse(): void {
    this.setState('collapsed');
  }

  /**
   * Expand the sidebar
   */
  expand(): void {
    this.setState('open');
  }

  /**
   * Set sidebar state
   */
  setState(state: SidebarState): void {
    if (this.currentState === state) return;

    this.currentState = state;

    // Handle focus management
    if (state === 'open') {
      this.handleOpenState();
    } else {
      this.handleClosedState();
    }

    // Emit events
    this.stateChanged.emit(state);
    this.events.stateChanged?.(state);

    if (state === 'open') {
      this.opened.emit();
      this.events.opened?.();
    } else if (state === 'closed') {
      this.closed.emit();
      this.events.closed?.();
    }

    this.cdr.markForCheck();
  }

  /**
   * Handle open state
   */
  private handleOpenState(): void {
    if (this.accessibility.autoFocus) {
      this.focusedElementBeforeOpen = document.activeElement as HTMLElement;
      setTimeout(() => {
        const firstFocusable = this.getFocusableElements()[0];
        firstFocusable?.focus();
      }, this.config.animationDuration);
    }

    // Add body class for overlay
    if (this.isMobile && this.config.showBackdrop) {
      this.renderer.addClass(document.body, 'os-sidebar-open');
    }
  }

  /**
   * Handle closed state
   */
  private handleClosedState(): void {
    if (this.accessibility.returnFocus && this.focusedElementBeforeOpen) {
      this.focusedElementBeforeOpen.focus();
      this.focusedElementBeforeOpen = undefined;
    }

    // Remove body class
    this.renderer.removeClass(document.body, 'os-sidebar-open');
  }

  /**
   * Handle item click
   */
  onItemClick(item: SidebarItem): void {
    if (item.disabled) return;

    // Check permissions
    if (item.permissions && !this.hasPermissions(item.permissions)) {
      return;
    }

    // Handle expandable items
    if (item.children) {
      item.expanded = !item.expanded;
      this.cdr.markForCheck();
      return;
    }

    // Execute custom click handler
    item.onClick?.(item);

    // Emit events
    this.itemClicked.emit(item);
    this.events.itemClicked?.(item);

    // Close sidebar on mobile after navigation
    if (this.isMobile && (item.routerLink || item.href)) {
      this.close();
    }
  }

  /**
   * Handle section toggle
   */
  onSectionToggle(section: SidebarSection): void {
    section.expanded = !section.expanded;
    this.sectionToggled.emit(section);
    this.events.sectionToggled?.(section);
    this.cdr.markForCheck();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(): void {
    if (this.config.backdropCloseable) {
      this.close();
    }
    this.backdropClicked.emit();
    this.events.backdropClicked?.();
  }

  /**
   * Check if user has required permissions
   * TODO: Integrate with actual auth service when available
   */
  private hasPermissions(_permissions: string[]): boolean {
    // For now, return true - integrate with actual auth service later
    return true;
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.renderer.removeClass(document.body, 'os-sidebar-open');
  }

  /**
   * Track by function for ngFor
   */
  trackBySection(_index: number, section: SidebarSection): string {
    return section.id;
  }

  trackByItem(_index: number, item: SidebarItem): string {
    return item.id;
  }
}