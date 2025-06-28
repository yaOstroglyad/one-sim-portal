import { CommonModule } from '@angular/common';
import { 
  ChangeDetectionStrategy, 
  Component, 
  ContentChildren, 
  EventEmitter, 
  Input, 
  Output, 
  QueryList,
  AfterContentInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TabComponent } from './tab.component';
import { TabConfig, TabChangeEvent, TabCloseEvent, TabPosition, TabSize, TabVariant } from './tabs.types';
import { TooltipDirective } from '../tooltip';

@Component({
  selector: 'os-tabs',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements AfterContentInit, AfterViewInit, OnDestroy {
  @Input() activeTabIndex = 0;
  @Input() position: TabPosition = 'top';
  @Input() size: TabSize = 'medium';
  @Input() variant: TabVariant = 'default';
  @Input() customClass?: string;
  @Input() tabs?: TabConfig[]; // For dynamic tabs
  @Input() lazy = false; // Lazy load tab content
  @Input() animationDuration = 300;
  @Input() animationType: 'slide' | 'fade' = 'slide';

  @Output() activeTabIndexChange = new EventEmitter<number>();
  @Output() tabChange = new EventEmitter<TabChangeEvent>();
  @Output() tabClose = new EventEmitter<TabCloseEvent>();

  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;
  @ViewChildren('tabButton', { read: ElementRef }) tabButtons?: QueryList<ElementRef>;

  // Animation properties
  indicatorWidth = 0;
  indicatorPosition = 0;
  contentTransform = 0;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  get tabsClasses(): string[] {
    const classes = ['os-tabs'];
    
    classes.push(`os-tabs--${this.variant}`);
    classes.push(`os-tabs--${this.size}`);
    classes.push(`os-tabs--${this.position}`);
    
    if (this.customClass) {
      classes.push(this.customClass);
    }
    
    return classes;
  }

  get availableTabs(): (TabConfig | TabComponent)[] {
    if (this.tabs) {
      return this.tabs;
    }
    return this.tabComponents?.toArray() || [];
  }

  get showAnimatedIndicator(): boolean {
    return (this.variant === 'default' || this.variant === 'underline') && 
           (this.position === 'top' || this.position === 'bottom');
  }

  ngAfterContentInit(): void {
    if (this.tabComponents) {
      // Listen to changes in tab components
      this.tabComponents.changes
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.validateActiveTab();
        });

      this.validateActiveTab();
    }
  }

  ngAfterViewInit(): void {
    // Initialize indicator and content position after view is ready
    setTimeout(() => {
      this.updateIndicatorPosition();
      this.updateContentPosition();
    });

    // Update indicator on tab button changes
    if (this.tabButtons) {
      this.tabButtons.changes
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          setTimeout(() => {
            this.updateIndicatorPosition();
          });
        });
    }

    // Update indicator on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }
  }

  private handleResize = () => {
    this.updateIndicatorPosition();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove resize listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  selectTab(index: number): void {
    if (this.isTabDisabled(index) || index === this.activeTabIndex) {
      return;
    }

    const previousIndex = this.activeTabIndex;
    this.activeTabIndex = index;

    // Emit the two-way binding change
    this.activeTabIndexChange.emit(index);

    const tabData = this.getTabAt(index);
    if (tabData) {
      const event: TabChangeEvent = {
        index,
        tab: this.getTabConfig(tabData),
        previousIndex
      };
      this.tabChange.emit(event);
    }

    // Update indicator position with animation
    setTimeout(() => {
      this.updateIndicatorPosition();
      this.updateContentPosition();
    });
  }

  closeTab(index: number, event: Event): void {
    event.stopPropagation();
    
    const tabData = this.getTabAt(index);
    if (tabData && this.isTabClosable(tabData)) {
      const closeEvent: TabCloseEvent = {
        index,
        tab: this.getTabConfig(tabData)
      };
      this.tabClose.emit(closeEvent);
    }
  }

  isTabActive(index: number): boolean {
    return index === this.activeTabIndex;
  }

  isTabDisabled(index: number): boolean {
    const tab = this.getTabAt(index);
    if (!tab) return false;
    
    if ('disabled' in tab) {
      return tab.disabled || false;
    }
    
    return (tab as TabComponent).disabled || false;
  }

  isTabClosable(tab: TabConfig | TabComponent): boolean {
    if ('closable' in tab) {
      return tab.closable || false;
    }
    return (tab as TabComponent).closable || false;
  }

  getTabLabel(tab: TabConfig | TabComponent): string {
    if ('label' in tab) {
      return tab.label;
    }
    return (tab as TabComponent).label;
  }

  getTabBadge(tab: TabConfig | TabComponent): string | number | undefined {
    if ('badge' in tab) {
      return tab.badge;
    }
    return (tab as TabComponent).badge;
  }

  getTabIcon(tab: TabConfig | TabComponent): string | undefined {
    if ('icon' in tab) {
      return tab.icon;
    }
    return (tab as TabComponent).icon;
  }

  getTabTooltip(tab: TabConfig | TabComponent): string | undefined {
    // Check if it's a TabConfig (has required id property as string)
    if ('id' in tab && typeof tab.id === 'string') {
      return (tab as TabConfig).tooltip;
    }
    // Otherwise it's a TabComponent
    return (tab as TabComponent).tooltip;
  }

  getTabDisabledReason(tab: TabConfig | TabComponent): string | undefined {
    // Check if it's a TabConfig (has required id property as string)
    if ('id' in tab && typeof tab.id === 'string') {
      return (tab as TabConfig).disabledReason;
    }
    // Otherwise it's a TabComponent
    return (tab as TabComponent).disabledReason;
  }

  getTooltipForTab(tab: TabConfig | TabComponent, index: number): string | undefined {
    const isDisabled = this.isTabDisabled(index);
    const disabledReason = this.getTabDisabledReason(tab);
    const tooltip = this.getTabTooltip(tab);
    
    // Priority: disabledReason for disabled tabs, then tooltip
    if (isDisabled && disabledReason) {
      return disabledReason;
    }
    
    return tooltip || undefined;
  }

  getTooltipPosition(): 'top' | 'bottom' | 'left' | 'right' {
    switch (this.position) {
      case 'top':
        return 'top';
      case 'bottom':
        return 'bottom';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return 'top';
    }
  }

  private getTabAt(index: number): TabConfig | TabComponent | undefined {
    return this.availableTabs[index];
  }

  private getTabConfig(tab: TabConfig | TabComponent): TabConfig {
    // Check if it's already a TabConfig (has id as required property)
    if ('id' in tab && typeof tab.id === 'string') {
      return tab as TabConfig;
    }
    
    // Convert TabComponent to TabConfig
    const component = tab as TabComponent;
    return {
      id: component.id || `tab-${Math.random()}`,
      label: component.label,
      disabled: component.disabled,
      badge: component.badge,
      icon: component.icon,
      closable: component.closable,
      tooltip: component.tooltip,
      disabledReason: component.disabledReason
    };
  }

  navigateTab(targetIndex: number, event: KeyboardEvent): void {
    event.preventDefault();
    
    const tabsCount = this.availableTabs.length;
    if (targetIndex < 0 || targetIndex >= tabsCount) {
      return;
    }
    
    // Skip disabled tabs
    while (targetIndex >= 0 && targetIndex < tabsCount && this.isTabDisabled(targetIndex)) {
      targetIndex = event.key === 'ArrowLeft' || event.key === 'Home' ? targetIndex - 1 : targetIndex + 1;
    }
    
    if (targetIndex >= 0 && targetIndex < tabsCount) {
      this.selectTab(targetIndex);
      // Focus the target tab
      setTimeout(() => {
        const tabButtons = document.querySelectorAll('.os-tabs__tab');
        const targetButton = tabButtons[targetIndex] as HTMLElement;
        targetButton?.focus();
      }, 0);
    }
  }

  trackByTab(index: number, tab: TabConfig | TabComponent): any {
    if ('id' in tab) {
      return tab.id;
    }
    return (tab as TabComponent).id || index;
  }

  private updateIndicatorPosition(): void {
    if (!this.showAnimatedIndicator || !this.tabButtons) {
      return;
    }

    const activeButton = this.tabButtons.toArray()[this.activeTabIndex];
    if (!activeButton) {
      return;
    }

    const buttonElement = activeButton.nativeElement as HTMLElement;
    const headerElement = buttonElement.parentElement;
    
    if (!headerElement) {
      return;
    }

    // Calculate position relative to the header
    const headerRect = headerElement.getBoundingClientRect();
    const buttonRect = buttonElement.getBoundingClientRect();
    
    this.indicatorWidth = buttonRect.width;
    this.indicatorPosition = buttonRect.left - headerRect.left;
    
    // Trigger change detection
    this.cdr.markForCheck();
  }

  private updateContentPosition(): void {
    // Only update transform for slide animation
    if (this.animationType === 'slide') {
      // Calculate transform percentage based on active tab index
      this.contentTransform = -100 * this.activeTabIndex;
    }
    this.cdr.markForCheck();
  }

  private validateActiveTab(): void {
    const tabsCount = this.availableTabs.length;
    if (this.activeTabIndex >= tabsCount) {
      this.activeTabIndex = Math.max(0, tabsCount - 1);
    }
  }
}