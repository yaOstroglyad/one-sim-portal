import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { IconService } from './icon.service';

/**
 * Predefined icon sizes
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * Icon size mapping in pixels
 */
const ICON_SIZES: Record<IconSize, string> = {
  'xs': '12px',
  'sm': '16px',
  'md': '24px',
  'lg': '32px',
  'xl': '48px',
  '2xl': '64px',
  '3xl': '80px',
  '4xl': '96px'
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (iconContent$ | async; as iconSvg) {
      <div class="icon-wrapper"
           [style.width]="iconWidth"
           [style.height]="iconHeight"
           [innerHTML]="iconSvg"></div>
    }
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .icon-wrapper :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  private readonly iconService = inject(IconService);

  iconContent$?: Observable<SafeHtml>;
  iconWidth = ICON_SIZES.md;
  iconHeight = ICON_SIZES.md;

  private _icon?: string;
  private _folder?: string;

  @Input()
  set icon(value: string | undefined) {
    this._icon = value;
    this.loadIcon();
  }

  @Input()
  set folder(value: string | undefined) {
    this._folder = value;
    this.loadIcon();
  }

  /**
   * Icon size - can be a predefined size or custom CSS value
   * Predefined sizes: xs, sm, md (default), lg, xl, 2xl, 3xl, 4xl
   * Custom: any valid CSS size value (e.g., '100px', '5rem')
   */
  @Input()
  set size(value: IconSize | string | undefined) {
    if (!value) {
      this.iconWidth = ICON_SIZES.md;
      this.iconHeight = ICON_SIZES.md;
      return;
    }

    // Check if it's a predefined size
    if (value in ICON_SIZES) {
      const size = ICON_SIZES[value as IconSize];
      this.iconWidth = size;
      this.iconHeight = size;
    } else {
      // Use custom size
      this.iconWidth = value;
      this.iconHeight = value;
    }
  }

  private loadIcon(): void {
    if (this._icon !== undefined) {
      this.iconContent$ = this.iconService.getIcon(this._icon, this._folder);
    }
  }
}
