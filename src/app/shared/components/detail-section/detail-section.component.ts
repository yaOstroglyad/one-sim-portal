import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

/**
 * Reusable section card component for detail views.
 * Provides consistent styling with icon, title, and content projection.
 *
 * @example
 * ```html
 * <app-detail-section title="Basic Information" icon="info">
 *   <app-detail-row label="Name">John Doe</app-detail-row>
 *   <app-detail-row label="Email">john@example.com</app-detail-row>
 * </app-detail-section>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-detail-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './detail-section.component.html',
  styleUrls: ['./detail-section.component.scss'],
})
export class DetailSectionComponent {
  /** Section title text */
  readonly title = input.required<string>();

  /** Material icon name (e.g., 'info', 'person', 'settings') */
  readonly icon = input<string>('');

  /** Whether this is the last section (removes bottom margin) */
  readonly isLast = input<boolean>(false);
}
