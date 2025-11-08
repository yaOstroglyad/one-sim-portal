import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * [Component Description]
 *
 * @example
 * ```html
 * <app-example></app-example>
 * ```
 */
@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss'
})
export class ExampleComponent {
  // Inject dependencies
  private readonly cdr = inject(ChangeDetectorRef);

  // Component state
  data: any = {};

  // Lifecycle hooks
  ngOnInit() {
    // Initialization logic
  }

  // Methods
  updateData(newData: any): void {
    // Immutable update
    this.data = { ...this.data, ...newData };
    this.cdr.markForCheck();
  }
}
