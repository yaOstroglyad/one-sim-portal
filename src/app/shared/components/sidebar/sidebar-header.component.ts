/**
 * Sidebar Header Component
 * 
 * Displays sidebar header with branding, title, and optional actions
 * Supports logo, brand name, close button, and custom actions
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { SidebarHeader, SidebarAction, SidebarState } from './sidebar.types';

@Component({
  selector: 'os-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-header',
    '[class.os-sidebar-header--mobile]': 'isMobile',
    '[class.os-sidebar-header--collapsed]': 'sidebarState === "collapsed"',
    '[class.os-sidebar-header--with-logo]': 'config.logoUrl',
    '[class.os-sidebar-header--with-actions]': 'config.actions && config.actions.length > 0',
    '[class.os-sidebar-header--clickable]': 'config.onClick'
  }
})
export class SidebarHeaderComponent implements OnInit {
  @Input() config: SidebarHeader = {};
  @Input() sidebarState: SidebarState = 'closed';
  @Input() isMobile = false;

  @Output() closeClicked = new EventEmitter<void>();
  @Output() actionClicked = new EventEmitter<SidebarAction>();

  ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Handle header click
   */
  onHeaderClick(): void {
    if (this.config.onClick) {
      this.config.onClick();
    }
  }

  /**
   * Handle close button click
   */
  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.closeClicked.emit();
  }

  /**
   * Handle action click
   */
  onActionClick(action: SidebarAction, event: Event): void {
    event.stopPropagation();
    
    if (action.disabled) {
      return;
    }

    action.onClick();
    this.actionClicked.emit(action);
  }

  /**
   * Track by function for actions
   */
  trackByAction(index: number, action: SidebarAction): string {
    return action.id;
  }
}