import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  parseISODate,
  formatDateISO,
  formatDateDisplay,
  isSameDay,
  isToday
} from '@shared/utils';

/**
 * Custom DatePicker Component
 *
 * Modern, reusable datepicker component with calendar popup
 * No external dependencies - fully custom implementation
 *
 * Features:
 * - Calendar popup with month/year navigation
 * - Min/max date restrictions
 * - Keyboard navigation
 * - Click outside to close
 * - Localization support
 * - Modern design matching CoreUI
 *
 * @example
 * ```html
 * <app-datepicker
 *   [value]="selectedDate()"
 *   [minDate]="'2025-08-01'"
 *   [maxDate]="'2025-12-31'"
 *   [placeholder]="'Select date'"
 *   (dateChange)="onDateChange($event)">
 * </app-datepicker>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-datepicker',
  imports: [CommonModule, TranslateModule],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly translate = inject(TranslateService);

  /**
   * Current selected date value (ISO string format: YYYY-MM-DD)
   */
  public readonly value = input<string>();

  /**
   * Minimum selectable date (ISO string format: YYYY-MM-DD)
   * @example '2025-08-01'
   */
  public readonly minDate = input<string>();

  /**
   * Maximum selectable date (ISO string format: YYYY-MM-DD)
   * @example '2025-12-31'
   */
  public readonly maxDate = input<string>();

  /**
   * Placeholder text
   */
  public readonly placeholder = input<string>('Select date');

  /**
   * Disabled state
   */
  public readonly disabled = input<boolean>(false);

  /**
   * Emits when date is selected
   * Returns ISO string format: YYYY-MM-DD
   */
  public readonly dateChange = output<string>();

  // Internal state
  public readonly isOpen = signal<boolean>(false);
  public readonly selectedDate = signal<Date | null>(null);
  public readonly displayValue = signal<string>('');

  // Calendar state
  public readonly currentMonth = signal<number>(new Date().getMonth());
  public readonly currentYear = signal<number>(new Date().getFullYear());

  // Year picker state
  public readonly showYearPicker = signal<boolean>(false);
  public readonly yearPickerDecade = signal<number>(Math.floor(new Date().getFullYear() / 10) * 10);

  // Month translation keys
  private readonly monthKeys = [
    'common.months.january',
    'common.months.february',
    'common.months.march',
    'common.months.april',
    'common.months.may',
    'common.months.june',
    'common.months.july',
    'common.months.august',
    'common.months.september',
    'common.months.october',
    'common.months.november',
    'common.months.december'
  ];

  // Weekday translation keys
  private readonly weekDayKeys = [
    'common.weekdays.su',
    'common.weekdays.mo',
    'common.weekdays.tu',
    'common.weekdays.we',
    'common.weekdays.th',
    'common.weekdays.fr',
    'common.weekdays.sa'
  ];

  // Weekday names (computed for translation support)
  public readonly weekDays = computed(() => {
    return this.weekDayKeys.map(key => this.translate.instant(key));
  });

  // Computed values
  public readonly displayMonth = computed(() => {
    const monthKey = this.monthKeys[this.currentMonth()];
    return this.translate.instant(monthKey);
  });

  public readonly displayYear = computed(() => {
    return this.currentYear().toString();
  });

  public readonly calendarDays = computed(() => {
    return this.generateCalendarDays(this.currentYear(), this.currentMonth());
  });

  public readonly yearPickerYears = computed(() => {
    const decade = this.yearPickerDecade();
    const years: number[] = [];
    for (let i = decade; i < decade + 12; i++) {
      years.push(i);
    }
    return years;
  });

  public readonly yearPickerRange = computed(() => {
    const decade = this.yearPickerDecade();
    return `${decade} - ${decade + 11}`;
  });

  constructor() {
    // Effect to sync value input with internal state
    effect(() => {
      const inputValue = this.value();
      if (inputValue) {
        this.setDateFromString(inputValue);
      }
    });
  }

  /**
   * Toggle calendar popup
   */
  toggleCalendar(): void {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
  }

  /**
   * Open calendar
   */
  openCalendar(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
    // Reset year picker when opening
    this.showYearPicker.set(false);
  }

  /**
   * Close calendar
   */
  closeCalendar(): void {
    this.isOpen.set(false);
    // Reset year picker when closing
    this.showYearPicker.set(false);
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    const month = this.currentMonth();
    const year = this.currentYear();

    if (month === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(year - 1);
    } else {
      this.currentMonth.set(month - 1);
    }
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    const month = this.currentMonth();
    const year = this.currentYear();

    if (month === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(year + 1);
    } else {
      this.currentMonth.set(month + 1);
    }
  }

  /**
   * Toggle year picker
   */
  toggleYearPicker(event?: Event): void {
    // Prevent event from bubbling to document click handler
    if (event) {
      event.stopPropagation();
    }

    const isYearPickerOpen = this.showYearPicker();
    this.showYearPicker.set(!isYearPickerOpen);

    if (!isYearPickerOpen) {
      // When opening, set decade to current year
      const currentYear = this.currentYear();
      const decade = Math.floor(currentYear / 10) * 10;
      this.yearPickerDecade.set(decade);
    }
  }

  /**
   * Navigate to previous decade
   */
  previousDecade(): void {
    this.yearPickerDecade.update(decade => decade - 12);
  }

  /**
   * Navigate to next decade
   */
  nextDecade(): void {
    this.yearPickerDecade.update(decade => decade + 12);
  }

  /**
   * Select a year
   */
  selectYear(year: number, event?: Event): void {
    // Prevent event from bubbling to document click handler
    if (event) {
      event.stopPropagation();
    }

    this.currentYear.set(year);
    this.showYearPicker.set(false);
  }

  /**
   * Select a date
   */
  selectDate(day: CalendarDay): void {
    if (day.disabled || !day.currentMonth) return;

    const date = new Date(this.currentYear(), this.currentMonth(), day.day);
    this.selectedDate.set(date);
    this.displayValue.set(formatDateDisplay(date));

    // Emit ISO string format
    const isoString = formatDateISO(date);
    this.dateChange.emit(isoString);

    this.closeCalendar();
  }

  /**
   * Select today's date
   */
  selectToday(): void {
    const today = new Date();
    this.currentYear.set(today.getFullYear());
    this.currentMonth.set(today.getMonth());
    this.selectedDate.set(today);
    this.displayValue.set(formatDateDisplay(today));

    // Emit ISO string format
    const isoString = formatDateISO(today);
    this.dateChange.emit(isoString);

    this.closeCalendar();
  }

  /**
   * Clear selected date
   */
  clearDate(): void {
    this.selectedDate.set(null);
    this.displayValue.set('');
    this.dateChange.emit('');
    this.closeCalendar();
  }

  /**
   * Check if date is disabled based on min/max constraints
   */
  private isDateDisabled(date: Date): boolean {
    const minDateValue = this.minDate();
    if (minDateValue) {
      const min = parseISODate(minDateValue);
      if (min && date < min) return true;
    }

    const maxDateValue = this.maxDate();
    if (maxDateValue) {
      const max = parseISODate(maxDateValue);
      if (max && date > max) return true;
    }

    return false;
  }

  /**
   * Check if date is selected
   */
  private isSelected(date: Date): boolean {
    const selected = this.selectedDate();
    if (!selected) return false;

    return isSameDay(date, selected);
  }

  /**
   * Generate calendar days for current month
   */
  private generateCalendarDays(year: number, month: number): CalendarDay[] {
    const days: CalendarDay[] = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    // Previous month days
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevLastDay.getDate() - i;
      const date = new Date(year, month - 1, day);
      days.push({
        day,
        currentMonth: false,
        disabled: true,
        isToday: false,
        isSelected: false,
        uniqueId: `${year}-${month - 1}-${day}` // Unique ID for tracking
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        currentMonth: true,
        disabled: this.isDateDisabled(date),
        isToday: isToday(date),
        isSelected: this.isSelected(date),
        uniqueId: `${year}-${month}-${day}` // Unique ID for tracking
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        currentMonth: false,
        disabled: true,
        isToday: false,
        isSelected: false,
        uniqueId: `${year}-${month + 1}-${day}` // Unique ID for tracking
      });
    }

    return days;
  }

  /**
   * Set date from ISO string
   */
  private setDateFromString(isoString: string): void {
    const date = parseISODate(isoString);
    if (date) {
      this.selectedDate.set(date);
      this.displayValue.set(formatDateDisplay(date));
      this.currentMonth.set(date.getMonth());
      this.currentYear.set(date.getFullYear());
    }
  }

  /**
   * Close calendar when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeCalendar();
    }
  }

  /**
   * Handle keyboard events
   */
  @HostListener('keydown.escape')
  onEscape(): void {
    this.closeCalendar();
  }
}

/**
 * Calendar day interface
 */
interface CalendarDay {
  day: number;
  currentMonth: boolean;
  disabled: boolean;
  isToday: boolean;
  isSelected: boolean;
  uniqueId: string; // Unique identifier for @for tracking
}
