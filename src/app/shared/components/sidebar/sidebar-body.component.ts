/**
 * Sidebar Body Component
 * 
 * Displays sidebar navigation content with sections, items, and labels
 * Handles scrolling, nested navigation, and responsive behavior
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SidebarSection, SidebarItem, SidebarState } from './sidebar.types';

@Component({
  selector: 'os-sidebar-body',
  templateUrl: './sidebar-body.component.html',
  styleUrls: ['./sidebar-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-body',
    '[class.os-sidebar-body--collapsed]': 'collapsed',
    '[class.os-sidebar-body--mobile]': 'isMobile',
    '[class.os-sidebar-body--scrollable]': 'scrollable',
    '[class.os-sidebar-body--empty]': 'isEmpty'
  }
})
export class SidebarBodyComponent implements OnInit, OnDestroy {
  @Input() sections: SidebarSection[] = [];
  @Input() currentRoute = '';
  @Input() sidebarState: SidebarState = 'closed';
  @Input() isMobile = false;
  @Input() collapsed = false;
  @Input() scrollable = true;
  @Input() showDividers = true;
  @Input() allowNestedExpansion = true;

  @Output() itemClicked = new EventEmitter<SidebarItem>();
  @Output() sectionToggled = new EventEmitter<SidebarSection>();

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize component
   */
  private initializeComponent(): void {
    // Component initialization logic
  }

  /**
   * Handle item click
   */
  onItemClick(item: SidebarItem): void {
    this.itemClicked.emit(item);
  }

  /**
   * Handle section toggle
   */
  onSectionToggle(section: SidebarSection): void {
    this.sectionToggled.emit(section);
  }

  /**
   * Check if body is empty
   */
  get isEmpty(): boolean {
    return !this.sections || this.sections.length === 0;
  }

  /**
   * Track by function for sections
   */
  trackBySection(index: number, section: SidebarSection): string {
    return section.id;
  }

  /**
   * Check if section should be visible
   */
  isSectionVisible(section: SidebarSection): boolean {
    // Always show sections with items
    if (section.items && section.items.length > 0) {
      return true;
    }
    
    // Show dividers if they have content
    if (section.divider && section.title) {
      return true;
    }
    
    return false;
  }

  /**
   * Get section CSS classes
   */
  getSectionClasses(section: SidebarSection): { [key: string]: boolean } {
    return {
      'os-sidebar-body__section': true,
      'os-sidebar-body__section--divider': section.divider || false,
      'os-sidebar-body__section--collapsible': section.collapsible || false,
      'os-sidebar-body__section--expanded': section.expanded || false,
      'os-sidebar-body__section--collapsed': !section.expanded && section.collapsible,
      'os-sidebar-body__section--empty': !section.items || section.items.length === 0
    };
  }
}