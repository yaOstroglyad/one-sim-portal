import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  signal,
  computed,
  inject,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkDrag, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../../auth';
import { GlobalFlyoutService } from '../../services/global-flyout.service';
import { FeatureRegistryService } from '../../services/feature-registry.service';
import { DockedState, Breakpoint, ResizeConfig } from '../../models';

@Component({
  selector: 'app-flyout-layout',
  standalone: true,
  imports: [CommonModule, TranslateModule, CdkTrapFocus, DragDropModule],
  templateUrl: './flyout-layout.component.html',
  styleUrls: ['./flyout-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.flyout-visible]': 'isOpen()',
    '[style.display]': 'isOpen() ? "block" : "none"'
  }
})
export class FlyoutLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly flyout = inject(GlobalFlyoutService);
  private readonly registry = inject(FeatureRegistryService);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly elementRef = inject(ElementRef);

  private viewRef?: ComponentRef<unknown>;

  readonly activeKey = signal<string | null>(null);
  readonly isOpen = signal(false);
  readonly params = signal<unknown | null>(null);
  readonly title = signal<string | null>(null);

  readonly dockedState = signal<DockedState>('right');
  readonly currentBreakpoint = signal<Breakpoint>('desktop');
  readonly width = signal<number>(600);
  readonly isResizing = signal(false);
  readonly isDragging = signal(false);

  readonly resizeConfig: ResizeConfig = {
    min: 420,
    max: 960,
    snaps: [480, 560, 640, 720, 840, 960],
    defaultWidth: 600
  };

  readonly user = computed(() => this.auth.loggedUser);
  readonly availableFeatures = computed(() => {
    const userPermissions = this.auth.permissions || [];
    return this.registry.features().filter(f => {
      const required = f.meta.roles;
      return !required || required.length === 0 || required.some(r => userPermissions.includes(r));
    });
  });

  readonly showAnimation = signal(false);

  @ViewChild('host', { read: ViewContainerRef, static: true }) host!: ViewContainerRef;
  @ViewChild('flyoutDrag', { static: false }) dragRef?: CdkDrag;

  constructor() {
    this.setupBreakpointObserver();
    this.restoreState();

    // Effect: Sync isOpen with GlobalFlyoutService
    effect(() => {
      const open = this.flyout.isOpen();
      this.isOpen.set(open);

      if (open) {
        // Show animation after setting isOpen
        setTimeout(() => {
          this.showAnimation.set(true);
        }, 10);
      } else {
        this.showAnimation.set(false);
      }
    });

    // Effect: Sync activeFeatureKey with GlobalFlyoutService
    effect(() => {
      const key = this.flyout.activeFeatureKey();
      this.activeKey.set(key);

      if (key) {
        this.loadFeature(key);
      }
    });

    // Effect: Sync params with GlobalFlyoutService
    effect(() => {
      const params = this.flyout.params();
      this.params.set(params);
    });

    // Effect: Sync title with GlobalFlyoutService
    effect(() => {
      const title = this.flyout.title();
      this.title.set(title);
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Don't close during resize or drag operations
    if (this.isResizing() || this.isDragging()) {
      return;
    }

    // Check if click was outside the component and it's open
    const target = event.target as Element;

    if (!this.isOpen() || !target) {
      return;
    }

    // Find the actual flyout element, not the host
    const flyoutElement = this.elementRef.nativeElement.querySelector('.flyout');

    if (flyoutElement && !flyoutElement.contains(target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isOpen()) {
      this.close();
      event.preventDefault();
    }
  }

  ngOnInit() {
    // Lifecycle hook - effects are initialized in constructor
  }

  async loadFeature(key: string) {
    this.host.clear();
    this.viewRef?.destroy();

    const component = await this.registry.resolveComponent(key);

    if (!component) {
      console.error('[FlyoutLayout] Component not found for key:', key);
      return;
    }

    this.viewRef = this.host.createComponent(component);
    this.cdr.markForCheck();
  }

  select(key: string) {
    this.flyout.activeFeatureKey.set(key);
  }

  close() {
    this.flyout.close();
  }

  toggleDocked(state: DockedState) {
    const previousState = this.dockedState();
    this.dockedState.set(state);

    // Reset drag position when switching from floating to docked
    if (previousState === 'floating' && (state === 'left' || state === 'right')) {
      this.resetDragPosition();
    }

    // When switching TO floating, also reset position to center
    if (state === 'floating' && previousState !== 'floating') {
      setTimeout(() => {
        this.resetDragPosition();
      }, 50);
    }

    this.saveState();
    this.cdr.markForCheck();
  }

  private resetDragPosition() {
    // Reset CDK Drag position programmatically
    if (this.dragRef) {
      this.dragRef.reset();
    }

    // Also clear any stored position from localStorage
    const breakpoint = this.currentBreakpoint();
    localStorage.removeItem(`flyout.position.${breakpoint}`);
  }

  onDragStarted() {
    this.isDragging.set(true);
  }

  onDragEnded(event: CdkDragEnd) {
    const position = event.source.getFreeDragPosition();
    this.savePosition(position);

    // Add delay before allowing close on outside click
    setTimeout(() => {
      this.isDragging.set(false);
    }, 100);
  }

  startResize(direction: 'left' | 'right', event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.isResizing.set(true);

    const startX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const startWidth = this.width();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const delta = direction === 'right' ? currentX - startX : startX - currentX;
      const newWidth = this.clampWidth(startWidth + delta);

      this.width.set(this.snapToGrid(newWidth));
    };

    const handleEnd = () => {
      this.saveState();
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);

      // Add small delay before allowing close on outside click
      setTimeout(() => {
        this.isResizing.set(false);
      }, 100);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  }

  onResizeHandleDoubleClick() {
    const isExpanded = this.width() === this.getMaxWidthForBreakpoint();
    this.width.set(isExpanded ? this.resizeConfig.defaultWidth : this.getMaxWidthForBreakpoint());
    this.saveState();
  }

  private clampWidth(width: number): number {
    return Math.min(Math.max(width, this.resizeConfig.min), this.resizeConfig.max);
  }

  private snapToGrid(width: number): number {
    const snapThreshold = 12;
    for (const snap of this.resizeConfig.snaps) {
      if (Math.abs(width - snap) < snapThreshold) {
        return snap;
      }
    }
    return width;
  }

  private getMaxWidthForBreakpoint(): number {
    const breakpoint = this.currentBreakpoint();
    switch (breakpoint) {
      case 'mobile': return window.innerWidth;
      case 'tablet': return Math.min(window.innerWidth * 0.8, this.resizeConfig.max);
      default: return this.resizeConfig.max;
    }
  }

  private setupBreakpointObserver() {
    // Setup initial breakpoint
    this.updateBreakpoint();

    // Listen to breakpoint changes
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).subscribe(() => {
      this.updateBreakpoint();
    });
  }

  private updateBreakpoint() {
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
    const isTablet = this.breakpointObserver.isMatched(Breakpoints.Tablet);

    if (isMobile) {
      this.currentBreakpoint.set('mobile');
    } else if (isTablet) {
      this.currentBreakpoint.set('tablet');
    } else {
      this.currentBreakpoint.set('desktop');
    }

    this.restoreState();
  }

  private saveState() {
    const breakpoint = this.currentBreakpoint();
    const state = {
      width: this.width(),
      dockedState: this.dockedState()
    };
    localStorage.setItem(`flyout.state.${breakpoint}`, JSON.stringify(state));
  }

  private savePosition(position: { x: number, y: number }) {
    const breakpoint = this.currentBreakpoint();
    localStorage.setItem(`flyout.position.${breakpoint}`, JSON.stringify(position));
  }

  private restoreState() {
    const breakpoint = this.currentBreakpoint();
    const stored = localStorage.getItem(`flyout.state.${breakpoint}`);

    if (stored) {
      try {
        const state = JSON.parse(stored);
        this.width.set(state.width || this.resizeConfig.defaultWidth);
        this.dockedState.set(state.dockedState || 'right');
      } catch {}
    }
  }

  ngAfterViewInit() {
    // Add passive touch listeners for resize handles to avoid performance warnings
    this.setupTouchListeners();
  }

  ngOnDestroy() {
    this.viewRef?.destroy();
  }

  private setupTouchListeners() {
    const leftHandle = this.elementRef.nativeElement.querySelector('.flyout__resize--left');
    const rightHandle = this.elementRef.nativeElement.querySelector('.flyout__resize--right');

    if (leftHandle) {
      leftHandle.addEventListener('touchstart', (event: TouchEvent) => {
        this.startResize('left', event);
      }, { passive: false }); // passive: false is needed for preventDefault
    }

    if (rightHandle) {
      rightHandle.addEventListener('touchstart', (event: TouchEvent) => {
        this.startResize('right', event);
      }, { passive: false }); // passive: false is needed for preventDefault
    }
  }
}
