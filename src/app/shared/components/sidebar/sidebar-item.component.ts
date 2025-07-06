/**
 * Sidebar Item Component
 * 
 * Individual navigation item with support for icons, badges, nested children,
 * router links, external links, and various interactive states
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  HostBinding
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { SidebarItem, SidebarState } from './sidebar.types';

@Component({
  selector: 'os-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-item',
    '[class.os-sidebar-item--active]': 'item.active',
    '[class.os-sidebar-item--disabled]': 'item.disabled',
    '[class.os-sidebar-item--collapsed]': 'collapsed',
    '[class.os-sidebar-item--mobile]': 'isMobile',
    '[class.os-sidebar-item--has-children]': 'hasChildren',
    '[class.os-sidebar-item--expanded]': 'item.expanded',
    '[class.os-sidebar-item--has-badge]': 'item.badge',
    '[class.os-sidebar-item--external]': 'isExternalLink'
  }
})
export class SidebarItemComponent implements OnInit, OnDestroy {
  @Input() item: SidebarItem = { id: '', label: '' };
  @Input() currentRoute = '';
  @Input() collapsed = false;
  @Input() sidebarState: SidebarState = 'closed';
  @Input() isMobile = false;
  @Input() allowNestedExpansion = true;
  @Input() level = 0; // Nesting level for indentation

  @Output() itemClicked = new EventEmitter<SidebarItem>();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize item
   */
  private initializeItem(): void {
    // Update active state based on current route
    this.updateActiveState();
  }

  /**
   * Update active state based on current route
   */
  private updateActiveState(): void {
    if (this.item.routerLink) {
      const routerLink = Array.isArray(this.item.routerLink) ? 
        this.item.routerLink.join('/') : 
        this.item.routerLink;
      
      this.item.active = this.item.exactMatch ? 
        this.currentRoute === routerLink : 
        this.currentRoute.startsWith(routerLink);
    } else if (this.item.href) {
      this.item.active = this.currentRoute === this.item.href;
    }

    // Update child items
    if (this.item.children) {
      this.item.children.forEach(child => {
        this.updateChildActiveState(child);
      });
    }
  }

  /**
   * Update active state for child item
   */
  private updateChildActiveState(childItem: SidebarItem): void {
    if (childItem.routerLink) {
      const routerLink = Array.isArray(childItem.routerLink) ? 
        childItem.routerLink.join('/') : 
        childItem.routerLink;
      
      childItem.active = childItem.exactMatch ? 
        this.currentRoute === routerLink : 
        this.currentRoute.startsWith(routerLink);
    } else if (childItem.href) {
      childItem.active = this.currentRoute === childItem.href;
    }

    // Recursively update nested children
    if (childItem.children) {
      childItem.children.forEach(grandchild => {
        this.updateChildActiveState(grandchild);
      });
    }
  }

  /**
   * Handle item click
   */
  onItemClick(event: Event): void {
    if (this.item.disabled) {
      event.preventDefault();
      return;
    }

    // Check permissions
    if (!this.hasPermissions()) {
      event.preventDefault();
      return;
    }

    // Handle nested expansion
    if (this.hasChildren && this.allowNestedExpansion && !this.collapsed) {
      this.toggleExpansion();
    }

    // Handle navigation
    if (this.item.routerLink) {
      event.preventDefault();
      this.navigateToRoute();
    } else if (this.item.href && !this.isExternalLink) {
      event.preventDefault();
      this.router.navigateByUrl(this.item.href);
    }

    // Execute custom click handler
    if (this.item.onClick) {
      this.item.onClick(this.item);
    }

    // Emit event
    this.itemClicked.emit(this.item);
  }

  /**
   * Handle child item click
   */
  onChildItemClick(childItem: SidebarItem): void {
    this.itemClicked.emit(childItem);
  }

  /**
   * Toggle expansion for nested items
   */
  toggleExpansion(): void {
    if (!this.hasChildren || !this.allowNestedExpansion) return;
    
    this.item.expanded = !this.item.expanded;
  }

  /**
   * Navigate to router link
   */
  private navigateToRoute(): void {
    if (this.item.routerLink) {
      this.router.navigate(Array.isArray(this.item.routerLink) ? this.item.routerLink : [this.item.routerLink]);
    }
  }

  /**
   * Check if user has required permissions
   */
  private hasPermissions(): boolean {
    if (!this.item.permissions || this.item.permissions.length === 0) return true;
    return this.item.permissions.every(permission => this.authService.hasPermission(permission));
  }

  /**
   * Check if item has children
   */
  get hasChildren(): boolean {
    return this.item.children && this.item.children.length > 0;
  }

  /**
   * Check if this is an external link
   */
  get isExternalLink(): boolean {
    if (!this.item.href) return false;
    return this.item.href.startsWith('http://') || this.item.href.startsWith('https://');
  }

  /**
   * Get item link attributes
   */
  getLinkAttributes(): { [key: string]: any } {
    const attrs: { [key: string]: any } = {};

    if (this.item.href) {
      attrs['href'] = this.item.href;
      
      if (this.item.target) {
        attrs['target'] = this.item.target;
      }
      
      if (this.isExternalLink) {
        attrs['rel'] = 'noopener noreferrer';
      }
    }

    if (this.item.tooltip) {
      attrs['title'] = this.item.tooltip;
    }

    return attrs;
  }

  /**
   * Get item CSS classes
   */
  getItemClasses(): { [key: string]: boolean } {
    return {
      'os-sidebar-item__link': true,
      'os-sidebar-item__link--active': this.item.active || false,
      'os-sidebar-item__link--disabled': this.item.disabled || false,
      'os-sidebar-item__link--external': this.isExternalLink,
      'os-sidebar-item__link--has-children': this.hasChildren,
      'os-sidebar-item__link--expanded': this.item.expanded || false,
      'os-sidebar-item__link--collapsed': this.collapsed,
      [`os-sidebar-item__link--level-${this.level}`]: this.level > 0
    };
  }

  /**
   * Get children CSS classes
   */
  getChildrenClasses(): { [key: string]: boolean } {
    return {
      'os-sidebar-item__children': true,
      'os-sidebar-item__children--visible': this.item.expanded || false,
      'os-sidebar-item__children--hidden': !this.item.expanded,
      'os-sidebar-item__children--collapsed': this.collapsed
    };
  }

  /**
   * Get icon CSS classes
   */
  getIconClasses(): string[] {
    const classes = ['os-sidebar-item__icon'];
    
    if (this.item.icon) {
      classes.push(this.item.icon);
    }
    
    if (this.item.iconType) {
      classes.push(`os-sidebar-item__icon--${this.item.iconType}`);
    }
    
    return classes;
  }

  /**
   * Get badge CSS classes
   */
  getBadgeClasses(): string[] {
    if (!this.item.badge) return [];
    
    const classes = ['os-sidebar-item__badge'];
    
    if (this.item.badge.variant) {
      classes.push(`os-sidebar-item__badge--${this.item.badge.variant}`);
    }
    
    if (this.item.badge.style) {
      classes.push(`os-sidebar-item__badge--${this.item.badge.style}`);
    }
    
    if (this.item.badge.position) {
      classes.push(`os-sidebar-item__badge--${this.item.badge.position}`);
    }
    
    if (this.item.badge.customClasses) {
      classes.push(...this.item.badge.customClasses.split(' '));
    }
    
    return classes;
  }

  /**
   * Get expansion indicator icon
   */
  getExpansionIcon(): string {
    return this.item.expanded ? 'chevron-down' : 'chevron-right';
  }

  /**
   * Track by function for children
   */
  trackByChild(index: number, child: SidebarItem): string {
    return child.id;
  }
}