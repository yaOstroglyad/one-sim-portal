/**
 * Sidebar Label Component
 * 
 * Displays labels for sections, dividers, and groups within the sidebar
 * Supports different label types, icons, and collapsible behavior
 */

import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
import { SidebarLabel } from './sidebar.types';

@Component({
  selector: 'os-sidebar-label',
  templateUrl: './sidebar-label.component.html',
  styleUrls: ['./sidebar-label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'os-sidebar-label',
    '[class.os-sidebar-label--section]': 'type === "section"',
    '[class.os-sidebar-label--divider]': 'type === "divider"',
    '[class.os-sidebar-label--group]': 'type === "group"',
    '[class.os-sidebar-label--collapsible]': 'collapsible',
    '[class.os-sidebar-label--expanded]': 'expanded',
    '[class.os-sidebar-label--has-icon]': 'icon',
    '[class.os-sidebar-label--clickable]': 'onClick || collapsible'
  }
})
export class SidebarLabelComponent implements OnInit {
  @Input() text = '';
  @Input() type: 'section' | 'divider' | 'group' = 'section';
  @Input() icon?: string;
  @Input() customClasses?: string;
  @Input() collapsible = false;
  @Input() expanded = false;
  @Input() onClick?: () => void;

  @Output() labelClicked = new EventEmitter<void>();

  ngOnInit(): void {
    // Component initialization logic
  }

  /**
   * Handle label click
   */
  onLabelClick(): void {
    if (this.onClick) {
      this.onClick();
    }
    
    if (this.collapsible) {
      this.expanded = !this.expanded;
    }
    
    this.labelClicked.emit();
  }

  /**
   * Get label CSS classes
   */
  getLabelClasses(): { [key: string]: boolean } {
    const classes: { [key: string]: boolean } = {
      'os-sidebar-label__text': true,
      [`os-sidebar-label__text--${this.type}`]: true
    };

    if (this.customClasses) {
      this.customClasses.split(' ').forEach(className => {
        classes[className] = true;
      });
    }

    return classes;
  }

  /**
   * Get container CSS classes
   */
  getContainerClasses(): { [key: string]: boolean } {
    return {
      'os-sidebar-label__container': true,
      'os-sidebar-label__container--clickable': this.onClick !== undefined || this.collapsible,
      'os-sidebar-label__container--expanded': this.expanded && this.collapsible,
      'os-sidebar-label__container--collapsed': !this.expanded && this.collapsible
    };
  }
}