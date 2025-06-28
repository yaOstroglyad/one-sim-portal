import { CommonModule } from '@angular/common';
import { 
  ChangeDetectionStrategy, 
  Component, 
  Input
} from '@angular/core';
import { TooltipDirective } from './tooltip.directive';
import { TooltipPosition, TooltipVariant } from './tooltip.component';

@Component({
  selector: 'os-tooltip-wrapper',
  standalone: true,
  imports: [CommonModule, TooltipDirective],
  template: `
    <div 
      class="os-tooltip-wrapper"
      [osTooltip]="text"
      [tooltipPosition]="position"
      [tooltipVariant]="variant"
      [tooltipDelay]="delay"
      [tooltipMaxWidth]="maxWidth"
      [tooltipDisabled]="disabled">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .os-tooltip-wrapper {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipWrapperComponent {
  @Input() text = '';
  @Input() position: TooltipPosition = 'top';
  @Input() variant: TooltipVariant = 'default';
  @Input() delay = 500;
  @Input() maxWidth = 300;
  @Input() disabled = false;
}