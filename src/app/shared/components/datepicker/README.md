# DatePicker Component

> **Location:** `/src/app/shared/components/datepicker/`
> **Type:** Standalone Component
> **Dependencies:** None (fully custom implementation)

## Overview

Custom datepicker component with modern design and calendar popup. No external dependencies - fully custom implementation without Material Design or any third-party libraries.

## Features

- ✅ **Calendar popup** with month/year navigation
- ✅ **Year picker** (click on year to select from grid)
- ✅ **Min/max date restrictions** (ISO format: YYYY-MM-DD)
- ✅ **Keyboard navigation** (ESC to close)
- ✅ **Click outside to close**
- ✅ **Full localization support** (months, weekdays, actions - 4 languages)
- ✅ **RTL support** (Hebrew with proper arrow direction)
- ✅ **Modern design** matching CoreUI theme
- ✅ **Dark theme support**
- ✅ **Responsive** mobile-friendly design
- ✅ **Signal-based inputs and outputs** (Angular 19+ signal APIs)
- ✅ **OnPush change detection**
- ✅ **Footer actions** (Clear and Today buttons)

## Usage

### Basic Example

```typescript
import { DatepickerComponent } from '@shared/components/datepicker/datepicker.component';

@Component({
  standalone: true,
  imports: [DatepickerComponent],
  template: `
    <app-datepicker
      [value]="selectedDate()"
      [placeholder]="'Select date'"
      (dateChange)="onDateChange($event)">
    </app-datepicker>
  `
})
export class MyComponent {
  public readonly selectedDate = signal<string>('');

  onDateChange(date: string): void {
    console.log('Selected date:', date); // ISO format: YYYY-MM-DD
    this.selectedDate.set(date);
  }
}
```

### With Min/Max Restrictions

```typescript
<app-datepicker
  [value]="selectedDate()"
  [minDate]="'2025-08-01'"
  [maxDate]="'2025-12-31'"
  [placeholder]="'Select date'"
  (dateChange)="onDateChange($event)">
</app-datepicker>
```

### Disabled State

```typescript
<app-datepicker
  [value]="selectedDate()"
  [disabled]="true"
  [placeholder]="'Select date'"
  (dateChange)="onDateChange($event)">
</app-datepicker>
```

## API

### Inputs (Signal-based)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `InputSignal<string \| undefined>` | `undefined` | Current selected date (ISO format: YYYY-MM-DD) |
| `minDate` | `InputSignal<string \| undefined>` | `undefined` | Minimum selectable date (ISO format: YYYY-MM-DD) |
| `maxDate` | `InputSignal<string \| undefined>` | `undefined` | Maximum selectable date (ISO format: YYYY-MM-DD) |
| `placeholder` | `InputSignal<string>` | `'Select date'` | Placeholder text |
| `disabled` | `InputSignal<boolean>` | `false` | Disabled state |

### Outputs (Signal-based)

| Event | Type | Description |
|-------|------|-------------|
| `dateChange` | `OutputEmitterRef<string>` | Emits when date is selected (ISO format: YYYY-MM-DD) |

## Date Format

**Input/Output:** ISO 8601 format `YYYY-MM-DD` (e.g., `'2025-11-14'`)

**Display:** DD/MM/YYYY format (e.g., `14/11/2025`)

## Calendar Features

### Navigation
- **Previous Month:** Click left arrow in calendar header
- **Next Month:** Click right arrow in calendar header
- **Year Picker:** Click on year in header to open year grid
- **Previous Decade:** Click left arrow in year picker (navigates -12 years)
- **Next Decade:** Click right arrow in year picker (navigates +12 years)

### Footer Actions
- **Clear:** Clears selected date and closes calendar
- **Today:** Selects today's date and closes calendar

### Day States
- **Today:** Highlighted with blue dot indicator
- **Selected:** Blue background with white text
- **Disabled:** Grayed out (outside min/max range or other month)
- **Other Month:** Faded gray (not clickable)

### Keyboard Support
- **ESC:** Close calendar popup

### Mouse Support
- **Click outside:** Close calendar popup
- **Click input:** Open calendar
- **Click toggle icon:** Toggle calendar

## Integration Example (Period Selector)

```typescript
// period-selector.component.ts
import { DatepickerComponent } from '../datepicker/datepicker.component';

@Component({
  standalone: true,
  imports: [DatepickerComponent],
  template: `
    <app-datepicker
      [value]="customDateRange().start"
      [minDate]="'2025-08-01'"
      [placeholder]="'common.periods.startDate'"
      (dateChange)="onStartDateChange($event)">
    </app-datepicker>
  `
})
export class PeriodSelectorComponent {
  public readonly customDateRange = signal<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  onStartDateChange(value: string): void {
    this.customDateRange.update(v => ({ ...v, start: value }));
  }
}
```

## Styling

The component follows project SCSS architecture:

- Uses `@use` instead of `@import`
- Uses CSS custom properties from `--os-color-*` and `--cui-*`
- Matches CoreUI input styling
- Supports dark theme via `[data-coreui-theme="dark"]`
- Responsive design with mobile breakpoints

### CSS Variables Used

**Input Styling:**
- `--cui-input-color`
- `--cui-input-bg`
- `--cui-input-border-color`
- `--cui-input-border-color-focus`
- `--cui-border-radius`
- `--cui-primary-rgb`

**Calendar Styling:**
- `--os-color-primary`
- `--os-color-primary-white`
- `--os-color-gray-*` (100-800)
- `--os-color-text-primary`
- `--os-color-text-secondary`

## Component Architecture

### File Structure

```
datepicker/
├── datepicker.component.ts      # Component logic with signals
├── datepicker.component.html    # Template with calendar
├── datepicker.component.scss    # Styles following project rules
└── README.md                    # This file
```

### Key Patterns

**Standalone Component:**
```typescript
@Component({
  standalone: true,
  selector: 'app-datepicker',
  imports: [CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**Signal-based State:**
```typescript
public readonly isOpen = signal<boolean>(false);
public readonly selectedDate = signal<Date | null>(null);
public readonly displayValue = signal<string>('');
public readonly currentMonth = signal<number>(new Date().getMonth());
public readonly currentYear = signal<number>(new Date().getFullYear());
```

**Computed Values:**
```typescript
public readonly displayMonth = computed(() => {
  return this.monthNames[this.currentMonth()];
});

public readonly calendarDays = computed(() => {
  return this.generateCalendarDays(this.currentYear(), this.currentMonth());
});
```

## Implementation Details

### Calendar Generation

The component generates a 6x7 grid (42 days) including:
- Previous month trailing days (grayed out)
- Current month days (selectable)
- Next month leading days (grayed out)

### Date Validation

Days are disabled if:
- Date is before `minDate`
- Date is after `maxDate`
- Day belongs to another month

### Event Handling

- **Click outside:** Uses `@HostListener('document:click')` to detect clicks outside component
- **Keyboard:** Uses `@HostListener('keydown.escape')` to close on ESC
- **Date selection:** Closes popup automatically after selecting date

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **OnPush change detection** for optimal performance
- **Signal-based reactivity** for efficient updates
- **Computed values** cached automatically
- **No external dependencies** reduces bundle size

## Testing

The component can be tested by:
1. Opening period-selector in Reports or Dashboard
2. Clicking "Custom" period button
3. Testing date selection with restrictions (minDate: 2025-08-01)

## Migration from Native Date Input

**Before (native HTML input):**
```html
<input
  type="date"
  [ngModel]="customDateRange().start"
  (ngModelChange)="onStartDateChange($event)"
  [min]="minDate"
  [max]="maxDate">
```

**After (custom datepicker):**
```html
<app-datepicker
  [value]="customDateRange().start"
  [minDate]="minDate"
  [maxDate]="maxDate"
  (dateChange)="onStartDateChange($event)">
</app-datepicker>
```

## Internationalization (i18n)

The component is fully localized with support for:

### Supported Languages
- **English (en)** - default
- **Russian (ru)** - Русский
- **Hebrew (he)** - עברית (with RTL support)
- **Ukrainian (ua)** - Українська

### Translated Elements
- **Month names** - `common.months.january` through `common.months.december`
- **Weekday abbreviations** - `common.weekdays.su` through `common.weekdays.sa`
- **Actions** - `common.clear` and `common.today`
- **Placeholders** - `common.periods.startDate` and `common.periods.endDate`

### RTL Support
When `dir="rtl"` is set on the page (Hebrew language):
- Input field calendar icon moves to left
- Calendar popup aligns to right
- Navigation arrows flip direction (rotate 180°)
- All text flows right-to-left

## Future Enhancements

Potential improvements:
- [ ] Date range selection (single component for start-end)
- [ ] Multiple date selection
- [ ] Time picker integration
- [ ] Custom date formatting
- [ ] Week number display
- [ ] Localized first day of week (currently starts on Sunday)
- [ ] Animation customization

## Version History

### 2025-11-14 - v1.1: Full Internationalization
- ✨ Added year picker (click year to select from grid)
- ✨ Full i18n support for 4 languages (en, ru, he, ua)
- ✨ Translated month names, weekdays, and actions
- ✨ RTL support for Hebrew with flipped arrows
- ✨ Footer actions (Clear and Today buttons)
- 🔧 Optimized `isToday()` method with date normalization
- 🔧 Made weekdays translatable via computed signal

### 2025-11-14 - v1.0: Initial Release
- 🎉 Custom datepicker without Material Design
- ✅ Calendar popup with month/year navigation
- ✅ Min/max date restrictions
- ✅ Integrated into period-selector component
- ✅ Signal-based APIs (Angular 19+)
- ✅ OnPush change detection
- ✅ Dark theme support
