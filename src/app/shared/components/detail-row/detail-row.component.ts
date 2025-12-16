import { Component, ChangeDetectionStrategy, input } from '@angular/core';
/**
 * Reusable component for displaying key-value pairs in details views
 * Uses signals for all reactive state
 */
@Component({
  standalone: true,
  selector: 'app-detail-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './detail-row.component.html',
  styleUrls: ['./detail-row.component.scss']
})
export class DetailRowComponent {
  // Label text (key)
  readonly label = input.required<string>();

  // Custom CSS classes for the row container
  readonly customClass = input<string>('');

  // Custom CSS classes for the label
  readonly labelClass = input<string>('');

  // Custom CSS classes for the value
  readonly valueClass = input<string>('');

  // Whether to show bottom border
  readonly showBorder = input<boolean>(true);
}
