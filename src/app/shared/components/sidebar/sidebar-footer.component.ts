/**
 * Sidebar Footer Component
 * 
 * Displays sidebar footer with user info, actions, and additional content
 * Supports user profile display, action buttons, and custom content
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { SidebarFooter, SidebarAction, SidebarUserInfo, SidebarState } from './sidebar.types';

@Component({
  selector: 'os-sidebar-footer',
  templateUrl: './sidebar-footer.component.html',
  styleUrls: ['./sidebar-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-footer',
    '[class.os-sidebar-footer--mobile]': 'isMobile',
    '[class.os-sidebar-footer--collapsed]': 'sidebarState === "collapsed"',
    '[class.os-sidebar-footer--with-user]': 'config.userInfo',
    '[class.os-sidebar-footer--with-actions]': 'config.actions && config.actions.length > 0',
    '[class.os-sidebar-footer--with-divider]': 'config.showDivider'
  }
})
export class SidebarFooterComponent implements OnInit {
  @Input() config: SidebarFooter = {};
  @Input() sidebarState: SidebarState = 'closed';
  @Input() isMobile = false;

  @Output() actionClicked = new EventEmitter<SidebarAction>();
  @Output() userInfoClicked = new EventEmitter<SidebarUserInfo>();

  ngOnInit(): void {
    // Component initialization logic
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
   * Handle user info click
   */
  onUserInfoClick(): void {
    if (this.config.userInfo?.onClick) {
      this.config.userInfo.onClick();
      this.userInfoClicked.emit(this.config.userInfo);
    }
  }

  /**
   * Get user status indicator class
   */
  getUserStatusClass(status: string): string {
    return `os-sidebar-footer__user-status--${status}`;
  }

  /**
   * Get user avatar URL or fallback
   */
  getUserAvatarUrl(): string {
    return this.config.userInfo?.avatar || this.getDefaultAvatar();
  }

  /**
   * Get default avatar based on user name
   */
  private getDefaultAvatar(): string {
    if (!this.config.userInfo?.name) {
      return '';
    }
    
    // Generate a simple avatar URL based on initials
    const initials = this.config.userInfo.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    // You could use a service like avatars.dicebear.com or ui-avatars.com
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=f9a743&color=fff&size=32`;
  }

  /**
   * Track by function for actions
   */
  trackByAction(index: number, action: SidebarAction): string {
    return action.id;
  }
}