import { 
  Directive, 
  Input, 
  ElementRef, 
  Renderer2, 
  OnInit, 
  OnDestroy,
  ViewContainerRef,
  ComponentRef,
  HostListener,
  TemplateRef,
  ContentChild
} from '@angular/core';
import { TooltipComponent, TooltipPosition, TooltipVariant } from './tooltip.component';

@Directive({
  selector: '[osTooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('osTooltip') tooltipText = '';
  @Input() tooltipPosition: TooltipPosition = 'top';
  @Input() tooltipVariant: TooltipVariant = 'default';
  @Input() tooltipDelay = 500;
  @Input() tooltipMaxWidth = 300;
  @Input() tooltipDisabled = false;
  @Input() tooltipContent?: TemplateRef<any>;

  private tooltipComponent?: ComponentRef<TooltipComponent>;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    // Set relative positioning on host element
    this.renderer.setStyle(this.elementRef.nativeElement, 'position', 'relative');
  }

  ngOnDestroy(): void {
    this.destroyTooltip();
    this.clearTimeouts();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  @HostListener('focus')
  onFocus(): void {
    this.show();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hide();
  }

  private show(): void {
    if (this.tooltipDisabled || (!this.tooltipText?.trim() && !this.tooltipContent && !this.hasNgContent())) return;

    this.clearTimeouts();
    this.showTimeout = window.setTimeout(() => {
      this.createTooltip();
    }, this.tooltipDelay);
  }

  private hasNgContent(): boolean {
    // For directive usage, we don't directly check ng-content
    // This is more for when TooltipComponent is used directly
    return false;
  }

  private hide(): void {
    this.clearTimeouts();
    this.hideTimeout = window.setTimeout(() => {
      this.destroyTooltip();
    }, 100);
  }

  private createTooltip(): void {
    if (this.tooltipComponent) return;

    // Create tooltip component in root document body to avoid layout issues
    this.tooltipComponent = this.viewContainer.createComponent(TooltipComponent);
    
    // Set inputs
    this.tooltipComponent.instance.text = this.tooltipText;
    this.tooltipComponent.instance.position = this.tooltipPosition;
    this.tooltipComponent.instance.variant = this.tooltipVariant;
    this.tooltipComponent.instance.maxWidth = this.tooltipMaxWidth;
    this.tooltipComponent.instance.disabled = this.tooltipDisabled;
    this.tooltipComponent.instance.content = this.tooltipContent;

    // Append to document body instead of host element
    document.body.appendChild(this.tooltipComponent.location.nativeElement);

    // Show tooltip first to get proper measurements
    this.tooltipComponent.instance.isVisible = true;
    this.tooltipComponent.changeDetectorRef.detectChanges();

    // Position tooltip after it's visible to get accurate measurements
    setTimeout(() => {
      this.positionTooltip();
    }, 0);
  }

  private positionTooltip(): void {
    if (!this.tooltipComponent) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRoot = this.tooltipComponent.location.nativeElement;
    
    // Force recalculation of tooltip dimensions
    this.renderer.setStyle(tooltipRoot, 'position', 'fixed');
    this.renderer.setStyle(tooltipRoot, 'visibility', 'hidden');
    this.renderer.setStyle(tooltipRoot, 'display', 'block');
    
    const tooltipRect = tooltipRoot.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    const gap = 8; // Gap between element and tooltip

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - gap;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = hostRect.bottom + gap;
        left = hostRect.left + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    
    // Adjust vertical position
    if (top < 10) {
      top = 10;
    } else if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }

    // Apply final position
    this.renderer.setStyle(tooltipRoot, 'top', `${Math.round(top)}px`);
    this.renderer.setStyle(tooltipRoot, 'left', `${Math.round(left)}px`);
    this.renderer.setStyle(tooltipRoot, 'visibility', 'visible');
    this.renderer.setStyle(tooltipRoot, 'z-index', '99999');
    this.renderer.setStyle(tooltipRoot, 'pointer-events', 'none');
  }

  private destroyTooltip(): void {
    if (this.tooltipComponent) {
      this.tooltipComponent.destroy();
      this.tooltipComponent = undefined;
    }
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