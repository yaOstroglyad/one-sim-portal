import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  computed,
  input,
  signal,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconSetService } from '@coreui/icons-angular';
import { IconService } from './icon.service';

/**
 * Icon size presets
 */
export const ICON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
  '3XL': '3xl',
  '4XL': '4xl',
} as const;

export type IconSize = (typeof ICON_SIZES)[keyof typeof ICON_SIZES];

/**
 * Icon size values in pixels
 */
const SIZE_VALUES: Record<IconSize, string> = {
  xs: '12px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  '2xl': '64px',
  '3xl': '80px',
  '4xl': '96px',
};

/**
 * Unified icon component supporting both CoreUI icons and custom SVGs.
 *
 * @example
 * ```html
 * <!-- CoreUI icon (auto-detected by cil/cib/cif prefix) -->
 * <os-icon name="cilUser" />
 * <os-icon name="cilSettings" size="lg" />
 *
 * <!-- Custom SVG from /assets/icons/ -->
 * <os-icon name="chart-line" />
 * <os-icon name="my-icon" folder="custom" />
 * ```
 */
@Component({
  standalone: true,
  selector: 'os-icon',
  template: `
    @if (svgContent()) {
      <span
        class="os-icon"
        [style.width]="sizeValue()"
        [style.height]="sizeValue()"
        [innerHTML]="svgContent()"
        aria-hidden="true"
      ></span>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }

      .os-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: currentColor;
      }

      .os-icon ::ng-deep svg {
        width: 100%;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OsIconComponent {
  // ================ Dependencies ================
  private readonly destroyRef = inject(DestroyRef);
  private readonly iconSetService = inject(IconSetService);
  private readonly iconService = inject(IconService);
  private readonly sanitizer = inject(DomSanitizer);

  // ================ Inputs ================
  /**
   * Icon name. Can be:
   * - CoreUI icon name (e.g., 'cilUser', 'cilSettings') - auto-detected by prefix
   * - Custom SVG name from /assets/icons/
   */
  readonly name = input.required<string>();

  /**
   * Icon size. Predefined sizes or custom CSS value.
   * Predefined: 'xs', 'sm', 'md' (default), 'lg', 'xl', '2xl', '3xl', '4xl'
   * Custom: any valid CSS size (e.g., '20px', '1.5rem')
   */
  readonly size = input<IconSize | string>(ICON_SIZES.MD);

  /**
   * Folder for custom icons (optional).
   * Used with custom icons to load from /assets/icons/{folder}/
   */
  readonly folder = input<string>();

  // ================ State ================
  private readonly customIconContent = signal<SafeHtml | null>(null);

  // ================ Computed Properties ================

  /**
   * Check if icon name is a CoreUI icon (starts with cil, cib, or cif)
   */
  private readonly isCoreUIIcon = computed(() => {
    const iconName = this.name();
    return iconName.startsWith('cil') ||
           iconName.startsWith('cib') ||
           iconName.startsWith('cif');
  });

  /**
   * Icon size in CSS value
   */
  readonly sizeValue = computed(() => {
    const sizeInput = this.size();

    if (sizeInput in SIZE_VALUES) {
      return SIZE_VALUES[sizeInput as IconSize];
    }

    // Return custom CSS value as-is
    return sizeInput;
  });

  /**
   * SVG content to render
   */
  readonly svgContent = computed(() => {
    if (this.isCoreUIIcon()) {
      return this.getCoreUIIconSvg();
    }

    return this.customIconContent();
  });

  // ================ Effects ================

  constructor() {
    // Load custom icon when needed
    effect(() => {
      const iconName = this.name();
      const folderPath = this.folder();

      if (!this.isCoreUIIcon()) {
        this.loadCustomIcon(iconName, folderPath);
      }
    });
  }

  // ================ Private Methods ================

  /**
   * Get CoreUI icon as SafeHtml
   */
  private getCoreUIIconSvg(): SafeHtml | null {
    const iconName = this.name();
    const iconData = this.iconSetService.getIcon(iconName);

    if (!iconData) {
      return null;
    }

    // CoreUI icon format: ['viewBox', '<path.../>']
    const [viewBox, ...content] = iconData as string[];
    const svgContent = content.join('');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox}" fill="currentColor" class="os-icon-svg">${svgContent}</svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  /**
   * Load custom icon from /assets/icons/
   */
  private loadCustomIcon(iconName: string, folder?: string): void {
    this.iconService.getIcon(iconName, folder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(content => {
        this.customIconContent.set(content);
      });
  }
}
