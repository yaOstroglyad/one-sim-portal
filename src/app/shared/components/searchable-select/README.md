# Searchable Select Component

A highly customizable, accessible select component with search functionality, built with Angular standalone components.

## Features

- ✅ **Searchable**: Built-in search functionality with debounced input
- ✅ **Single & Multiple Selection**: Support for both single and multiple selection modes
- ✅ **Keyboard Navigation**: Full keyboard navigation support (Arrow keys, Enter, Escape)
- ✅ **Accessibility**: ARIA attributes and proper keyboard navigation
- ✅ **Customizable**: Extensive configuration options
- ✅ **Angular Forms**: Full integration with Angular Reactive Forms (ControlValueAccessor)
- ✅ **TypeScript**: Fully typed with comprehensive interfaces
- ✅ **Theme Support**: Light/dark theme support
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Loading States**: Built-in loading indicators
- ✅ **i18n Ready**: Internationalization support

## Basic Usage

```typescript
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/searchable-select';

@Component({
  imports: [SearchableSelectComponent]
})
export class MyComponent {
  options: SearchableSelectOption[] = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3', disabled: true }
  ];

  selectedValue = 1;

  onSelectionChange(event: SearchableSelectChangeEvent) {
    console.log('Selected:', event.value, event.option);
  }
}
```

```html
<app-searchable-select
  [options]="options"
  [(ngModel)]="selectedValue"
  label="Choose an option"
  (selectionChange)="onSelectionChange($event)">
</app-searchable-select>
```

## With Reactive Forms

```typescript
formGroup = this.fb.group({
  country: [null, Validators.required]
});
```

```html
<app-searchable-select
  [options]="countryOptions"
  formControlName="country"
  label="Country"
  [required]="true">
</app-searchable-select>
```

## Configuration Options

```typescript
const config: SearchableSelectConfig = {
  placeholder: 'Select an option',
  searchPlaceholder: 'Search...',
  noResultsText: 'No results found',
  clearable: true,
  disabled: false,
  multiple: false,
  maxHeight: '200px',
  searchable: true,
  loading: false,
  loadingText: 'Loading...'
};
```

```html
<app-searchable-select
  [options]="options"
  [config]="config"
  [(ngModel)]="value">
</app-searchable-select>
```

## Multiple Selection

```typescript
multipleOptions: SearchableSelectOption[] = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
  { value: 'py', label: 'Python' }
];

selectedLanguages: string[] = ['js', 'ts'];

config: SearchableSelectConfig = {
  multiple: true,
  placeholder: 'Select languages...'
};
```

```html
<app-searchable-select
  [options]="multipleOptions"
  [config]="config"
  [(ngModel)]="selectedLanguages"
  label="Programming Languages">
</app-searchable-select>
```

## With Search Event Handling

```html
<app-searchable-select
  [options]="dynamicOptions"
  [config]="{ loading: isLoading }"
  (searchChange)="onSearch($event)">
</app-searchable-select>
```

```typescript
onSearch(searchTerm: string) {
  this.isLoading = true;
  this.apiService.searchOptions(searchTerm).subscribe(results => {
    this.dynamicOptions = results;
    this.isLoading = false;
  });
}
```

## Option Interface

```typescript
interface SearchableSelectOption {
  value: any;           // The actual value
  label: string;        // Display text
  disabled?: boolean;   // Whether option is disabled
  data?: any;          // Additional data
}
```

## Events

| Event | Type | Description |
|-------|------|-------------|
| `selectionChange` | `SearchableSelectChangeEvent` | Emitted when selection changes |
| `searchChange` | `string` | Emitted when search term changes (debounced 300ms) |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open dropdown |
| `Arrow Down` | Navigate to next option |
| `Arrow Up` | Navigate to previous option |
| `Enter` | Select highlighted option |
| `Escape` | Close dropdown |

## CSS Custom Properties

```scss
.searchable-select {
  --select-border-color: var(--cui-border-color);
  --select-focus-color: var(--cui-primary);
  --select-bg-color: var(--cui-body-bg);
  --select-text-color: var(--cui-body-color);
  --select-placeholder-color: var(--cui-secondary-color);
}
```

## Accessibility

The component includes proper ARIA attributes:
- `role="combobox"`
- `aria-expanded`
- `aria-haspopup`
- `aria-disabled`
- Keyboard navigation
- Focus management

## Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Migration from mat-select

```typescript
// Before (mat-select)
<mat-form-field>
  <mat-label>Country</mat-label>
  <mat-select formControlName="country">
    <mat-option *ngFor="let country of countries" [value]="country.id">
      {{ country.name }}
    </mat-option>
  </mat-select>
</mat-form-field>

// After (searchable-select)
<app-searchable-select
  [options]="countryOptions"
  formControlName="country"
  label="Country">
</app-searchable-select>
```

Where `countryOptions` is:
```typescript
countryOptions = this.countries.map(country => ({
  value: country.id,
  label: country.name
}));
```