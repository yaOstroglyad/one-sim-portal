import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, signal, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonDirective } from '@coreui/angular';
import {
  PeriodPreset,
  PeriodPresets,
  PeriodPresetConfig,
  PeriodDateRange,
  DEFAULT_PERIOD_PRESETS
} from '@models';
import { createPeriodFromPreset, createCustomPeriod } from '@shared/utils';
import { DatepickerComponent } from '../datepicker/datepicker.component';

/**
 * Period Selector Component
 *
 * Reusable component for selecting time periods (today, yesterday, last 7 days, etc.)
 * Supports custom date range selection
 *
 * @example
 * ```html
 * <app-period-selector
 *   [selectedPeriod]="selectedPeriod()"
 *   [presets]="customPresets"
 *   (periodChange)="onPeriodChange($event)">
 * </app-period-selector>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-period-selector',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonDirective,
    DatepickerComponent
],
  templateUrl: './period-selector.component.html',
  styleUrls: ['./period-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeriodSelectorComponent {
  /**
   * Currently selected period preset
   */
  @Input() selectedPeriod: PeriodPreset = PeriodPresets.CURRENT_MONTH;

  /**
   * Custom period presets (optional, defaults to DEFAULT_PERIOD_PRESETS)
   */
  @Input() presets: PeriodPresetConfig[] = DEFAULT_PERIOD_PRESETS;

  /**
   * Show or hide custom date picker
   */
  @Input() showCustomPicker: boolean = false;

  /**
   * Minimum selectable date for custom picker (ISO string format: YYYY-MM-DD)
   * @example '2025-08-01'
   */
  @Input() minDate?: string;

  /**
   * Maximum selectable date for custom picker (ISO string format: YYYY-MM-DD)
   * @example '2025-12-31'
   */
  @Input() maxDate?: string;

  /**
   * Emits when period changes
   * Returns PeriodDateRange with startDate and endDate
   */
  @Output() periodChange = new EventEmitter<PeriodDateRange>();

  /**
   * Emits when custom date range is applied
   */
  @Output() customRangeApplied = new EventEmitter<PeriodDateRange>();

  // Internal state
  public readonly customDateRange = signal<{ start: string; end: string }>({ start: '', end: '' });
  public readonly showCustomDatePicker = signal<boolean>(false);

  // Computed
  public readonly canApplyCustomRange = computed(() => {
    const range = this.customDateRange();
    return !!range.start && !!range.end;
  });

  /**
   * Handle period button click
   */
  onPeriodClick(preset: PeriodPreset): void {
    this.selectedPeriod = preset;

    if (preset === PeriodPresets.CUSTOM) {
      this.showCustomDatePicker.set(true);
      return;
    }

    this.showCustomDatePicker.set(false);
    const period = createPeriodFromPreset(preset);
    this.periodChange.emit(period);
  }

  /**
   * Apply custom date range
   */
  applyCustomRange(): void {
    const range = this.customDateRange();
    if (range.start && range.end) {
      const period = createCustomPeriod(range.start, range.end);
      this.customRangeApplied.emit(period);
      this.periodChange.emit(period);
      this.showCustomDatePicker.set(false);
    }
  }

  /**
   * Cancel custom date range selection
   */
  cancelCustomRange(): void {
    this.showCustomDatePicker.set(false);
    this.customDateRange.set({ start: '', end: '' });
    // Reset to default period
    if (this.selectedPeriod === PeriodPresets.CUSTOM) {
      this.selectedPeriod = PeriodPresets.CURRENT_MONTH;
      const period = createPeriodFromPreset(PeriodPresets.CURRENT_MONTH);
      this.periodChange.emit(period);
    }
  }

  /**
   * Update start date
   */
  onStartDateChange(value: string): void {
    this.customDateRange.update(v => ({ ...v, start: value }));
  }

  /**
   * Update end date
   */
  onEndDateChange(value: string): void {
    this.customDateRange.update(v => ({ ...v, end: value }));
  }
}
