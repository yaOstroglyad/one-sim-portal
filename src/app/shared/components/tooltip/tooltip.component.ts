import { CommonModule } from '@angular/common';
import { 
  ChangeDetectionStrategy, 
  Component, 
  Input, 
  HostBinding,
  OnInit,
  ElementRef,
  Renderer2,
  OnDestroy,
  TemplateRef,
  ContentChild,
  AfterContentInit,
  ViewChild
} from '@angular/core';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'default' | 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'os-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="os-tooltip"
      [class]="tooltipClasses"
      [style.display]="isVisible ? 'block' : 'none'"
      [attr.role]="'tooltip'"
      [attr.aria-hidden]="!isVisible">
      <div class="os-tooltip__content">
        <!-- Check for ng-content first -->
        <div #contentWrapper style="display: none;">
          <ng-content></ng-content>
        </div>
        
        <!-- Show ng-content if present, template if present, or fallback to text -->
        <ng-container *ngIf="hasNgContent; else templateOrTextContent">
          <ng-content></ng-content>
        </ng-container>
        
        <ng-template #templateOrTextContent>
          <!-- Custom content template has priority over text -->
          <ng-container *ngIf="hasCustomContent(); else textContent">
            <ng-container *ngTemplateOutlet="getCustomContent()"></ng-container>
          </ng-container>
          
          <!-- Fallback to text content -->
          <ng-template #textContent>
            {{ text }}
          </ng-template>
        </ng-template>
      </div>
      <div class="os-tooltip__arrow"></div>
    </div>
  `,
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent implements OnInit, OnDestroy, AfterContentInit {
  @Input() text = '';
  @Input() position: TooltipPosition = 'top';
  @Input() variant: TooltipVariant = 'default';
  @Input() delay = 500; // milliseconds
  @Input() maxWidth = 300;
  @Input() disabled = false;
  @Input() content?: TemplateRef<any>; // Custom content template

  @ContentChild('tooltipContent') contentTemplate?: TemplateRef<any>;
  @ViewChild('contentWrapper') contentWrapper!: ElementRef;

  @HostBinding('class.os-tooltip-host') hostClass = true;

  hasNgContent = false;

  isVisible = false;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Set up event listeners for direct component usage
    if (this.elementRef.nativeElement.parentElement) {
      const parentElement = this.elementRef.nativeElement.parentElement;
      
      this.renderer.listen(parentElement, 'mouseenter', () => {
        if (!this.disabled) {
          this.show();
        }
      });
      
      this.renderer.listen(parentElement, 'mouseleave', () => {
        this.hide();
      });
    }
  }

  ngAfterContentInit(): void {
    // Check if ng-content has any content
    this.checkNgContent();
  }

  ngOnDestroy(): void {
    this.clearTimeouts();
  }

  private checkNgContent(): void {
    if (this.contentWrapper?.nativeElement) {
      const hasContent = this.contentWrapper.nativeElement.children.length > 0 || 
                        this.contentWrapper.nativeElement.textContent?.trim().length > 0;
      this.hasNgContent = hasContent;
    }
  }

  get tooltipClasses(): string {
    return [
      'os-tooltip',
      `os-tooltip--${this.position}`,
      `os-tooltip--${this.variant}`,
      this.isVisible ? 'os-tooltip--visible' : '',
      this.hasAnyCustomContent() ? 'os-tooltip--custom-content' : ''
    ].filter(Boolean).join(' ');
  }

  hasCustomContent(): boolean {
    return !!(this.content || this.contentTemplate);
  }

  hasAnyCustomContent(): boolean {
    return this.hasNgContent || this.hasCustomContent();
  }

  getCustomContent(): TemplateRef<any> | undefined {
    return this.content || this.contentTemplate;
  }

  private show(): void {
    if (this.disabled || (!this.text.trim() && !this.hasAnyCustomContent())) return;

    this.clearTimeouts();
    this.showTimeout = window.setTimeout(() => {
      this.isVisible = true;
    }, this.delay);
  }

  private hide(): void {
    this.clearTimeouts();
    this.hideTimeout = window.setTimeout(() => {
      this.isVisible = false;
    }, 100); // Small delay to prevent flickering
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }
}