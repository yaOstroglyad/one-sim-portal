/**
 * Sidebar Section Component
 * 
 * Displays a section of navigation items with optional title, collapsible behavior,
 * and divider support. Handles section organization and nested item display.
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
import { AuthService } from '../../auth/auth.service';
import { SidebarSection, SidebarItem, SidebarState } from './sidebar.types';

@Component({
  selector: 'os-sidebar-section',
  templateUrl: './sidebar-section.component.html',
  styleUrls: ['./sidebar-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-section',
    '[class.os-sidebar-section--collapsed]': 'collapsed',
    '[class.os-sidebar-section--mobile]': 'isMobile',
    '[class.os-sidebar-section--divider]': 'section.divider',
    '[class.os-sidebar-section--collapsible]': 'section.collapsible',
    '[class.os-sidebar-section--expanded]': 'section.expanded',
    '[class.os-sidebar-section--has-title]': 'section.title',
    '[class.os-sidebar-section--has-icon]': 'section.icon',
    '[class.os-sidebar-section--empty]': 'isEmpty'
  }
})
export class SidebarSectionComponent implements OnInit, OnDestroy {
  @Input() section: SidebarSection = { id: '', items: [] };
  @Input() currentRoute = '';
  @Input() collapsed = false;
  @Input() sidebarState: SidebarState = 'closed';
  @Input() isMobile = false;
  @Input() showDividers = true;
  @Input() allowNestedExpansion = true;

  @Output() itemClicked = new EventEmitter<SidebarItem>();
  @Output() sectionToggled = new EventEmitter<SidebarSection>();

  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeSection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize section
   */
  private initializeSection(): void {
    // Filter items based on permissions
    this.section.items = this.section.items.filter(item => this.hasPermissions(item.permissions));
  }

  /**
   * Handle section header click (for collapsible sections)
   */
  onSectionHeaderClick(): void {
    if (!this.section.collapsible) return;

    this.section.expanded = !this.section.expanded;
    this.sectionToggled.emit(this.section);
  }

  /**
   * Handle item click
   */
  onItemClick(item: SidebarItem): void {
    this.itemClicked.emit(item);
  }

  /**
   * Check if section is empty
   */
  get isEmpty(): boolean {
    return !this.section.items || this.section.items.length === 0;
  }

  /**
   * Check if section should show items
   */
  get shouldShowItems(): boolean {
    if (this.collapsed) return false;
    if (!this.section.collapsible) return true;
    return this.section.expanded;
  }

  /**
   * Get section header class
   */
  getSectionHeaderClass(): { [key: string]: boolean } {
    return {
      'os-sidebar-section__header': true,
      'os-sidebar-section__header--clickable': this.section.collapsible || false,
      'os-sidebar-section__header--expanded': this.section.expanded || false,
      'os-sidebar-section__header--collapsed': !this.section.expanded && this.section.collapsible,
      'os-sidebar-section__header--with-icon': !!this.section.icon
    };
  }

  /**
   * Get section items class
   */
  getSectionItemsClass(): { [key: string]: boolean } {
    return {
      'os-sidebar-section__items': true,
      'os-sidebar-section__items--visible': this.shouldShowItems,
      'os-sidebar-section__items--hidden': !this.shouldShowItems
    };
  }

  /**
   * Check if user has required permissions
   */
  private hasPermissions(permissions?: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every(permission => this.authService.hasPermission(permission));
  }

  /**
   * Check if section has permissions
   */
  get hasPermissionsToShow(): boolean {
    return this.hasPermissions(this.section.permissions);
  }

  /**
   * Track by function for items
   */
  trackByItem(index: number, item: SidebarItem): string {
    return item.id;
  }
}