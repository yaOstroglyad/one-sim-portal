import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  HostListener,
  forwardRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IconDirective } from '@coreui/icons-angular';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SearchableSelectOption, SearchableSelectConfig, SearchableSelectChangeEvent } from './searchable-select.types';

@Component({
    standalone: true,
    selector: 'app-searchable-select',
    imports: [CommonModule, ReactiveFormsModule, IconDirective, MatIconModule, TranslateModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchableSelectComponent),
            multi: true
        }
    ],
    templateUrl: './searchable-select.component.html',
    styleUrls: ['./searchable-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchableSelectComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {

  @Input() options: SearchableSelectOption[] = [];
  @Input() config: SearchableSelectConfig = {};
  @Input() label?: string;
  @Input() required = false;
  @Input() error?: string;
  @Input() className?: string;

  @Output() selectionChange = new EventEmitter<SearchableSelectChangeEvent>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;

  // Internal state
  isOpen = false;
  searchControl = new FormControl('');
  filteredOptions: SearchableSelectOption[] = [];
  selectedOption: SearchableSelectOption | SearchableSelectOption[] | null = null;
  highlightedIndex = -1;

  // Pre-computed option states for template
  optionStates: { [key: string]: { selected: boolean, highlighted: boolean, disabled: boolean } } = {};

  // Cached translations
  cachedPlaceholder = '';
  cachedSearchPlaceholder = '';
  cachedNoResultsText = '';
  cachedLoadingText = '';

  // ControlValueAccessor
  private value: any = null;
  private onTouched: () => void = () => {};
  private onChange: (value: any) => void = () => {};

  private destroy$ = new Subject<void>();

  // Default configuration
  defaultConfig: SearchableSelectConfig = {
    placeholder: 'common.searchableSelect.placeholder',
    searchPlaceholder: 'common.searchableSelect.searchPlaceholder',
    noResultsText: 'common.searchableSelect.noResults',
    clearable: true,
    clearOptionLabel: 'common.none',
    disabled: false,
    multiple: false,
    maxHeight: '200px',
    searchable: true,
    loading: false,
    loadingText: 'common.searchableSelect.loading'
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Merge default config with provided config, filtering out undefined values
    this.config = this.mergeConfig(this.defaultConfig, this.config);

    // Initialize translations
    this.updateTranslations();

    // Subscribe to language changes
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTranslations();
        this.cdr.markForCheck();
      });

    // Initialize filtered options with safe fallback
    this.filteredOptions = this.options ? [...this.options] : [];

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterOptions(searchTerm || '');
        this.searchChange.emit(searchTerm || '');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options']) {
      // Update filtered options when options change
      this.filteredOptions = this.options ? [...this.options] : [];
      // Update selected options when options change
      this.updateSelectedOption();
      this.cdr.markForCheck();
    }

    if (changes['config']) {
      // Merge config when it changes, filtering out undefined values
      this.config = this.mergeConfig(this.defaultConfig, this.config);
      this.updateTranslations();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
    this.updateSelectedOption();
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.config.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Public methods
  toggle(event?: Event): void {
    if (this.config.disabled) return;

    // Prevent toggle when clicking on chip (multi-select) - let chip handle its own click
    if (event && (event.target as HTMLElement).closest('.chip')) {
      return;
    }

    this.isOpen ? this.close() : this.open();
  }

  open(): void {
    if (this.config.disabled) return;

    this.isOpen = true;
    this.highlightedIndex = -1;
    this.searchControl.setValue('');
    // Use filterOptions to ensure clear option is added for single select
    this.filterOptions('');

    setTimeout(() => {
      if (this.config.searchable && this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);

    this.cdr.markForCheck();
  }

  close(): void {
    this.isOpen = false;
    this.highlightedIndex = -1;
    this.onTouched();
    this.cdr.markForCheck();
  }

  selectOption(option: SearchableSelectOption, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (option.disabled) return;

    if (this.config.multiple) {
      this.handleMultipleSelection(option);
    } else {
      this.handleSingleSelection(option);
    }

    if (!this.config.multiple) {
      this.close();
    }
  }

  clear(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.value = this.config.multiple ? [] : null;
    this.selectedOption = this.config.multiple ? [] : null;
    this.onChange(this.value);

    const changeEvent: SearchableSelectChangeEvent = {
      value: this.value,
      option: this.selectedOption
    };

    this.selectionChange.emit(changeEvent);
    this.cdr.markForCheck();
  }

  removeOption(option: SearchableSelectOption, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.config.multiple || !Array.isArray(this.selectedOption)) return;

    const index = this.selectedOption.findIndex(selected => selected.value === option.value);
    if (index > -1) {
      const newSelection = [...this.selectedOption];
      newSelection.splice(index, 1);

      this.selectedOption = newSelection;
      this.value = newSelection.map(opt => opt.value);
      this.onChange(this.value);

      const changeEvent: SearchableSelectChangeEvent = {
        value: this.value,
        option: this.selectedOption
      };

      this.selectionChange.emit(changeEvent);
      this.cdr.markForCheck();
    }
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.open();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.highlightNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightPrevious();
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.filteredOptions && this.filteredOptions[this.highlightedIndex]) {
          this.selectOption(this.filteredOptions[this.highlightedIndex]);
        }
        break;
    }
  }

  // Click outside handler
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  // Private methods
  private filterOptions(searchTerm: string): void {
    // Safe check for options array
    if (!this.options || !Array.isArray(this.options)) {
      this.filteredOptions = [];
      this.highlightedIndex = -1;
      this.updateOptionStates();
      this.cdr.markForCheck();
      return;
    }

    let filtered: SearchableSelectOption[];

    if (!searchTerm) {
      filtered = [...this.options];
    } else {
      filtered = this.options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Add "None" option for single select with clearable enabled
    if (!this.config.multiple && this.config.clearable) {
      const clearOption: SearchableSelectOption = {
        value: null,
        label: this.translate.instant(this.config.clearOptionLabel || 'common.none'),
        disabled: this.value === null // Disabled when nothing is selected
      };
      filtered = [clearOption, ...filtered];
    }

    this.filteredOptions = filtered;
    this.highlightedIndex = -1;
    this.updateOptionStates();
    this.cdr.markForCheck();
  }

  private updateSelectedOption(): void {
    // Safe check for options array
    if (!this.options || !Array.isArray(this.options)) {
      this.selectedOption = this.config.multiple ? [] : null;
      this.updateOptionStates();
      return;
    }

    if (this.config.multiple) {
      if (Array.isArray(this.value)) {
        this.selectedOption = this.options.filter(option =>
          this.value.includes(option.value)
        );
      } else {
        this.selectedOption = [];
      }
    } else {
      this.selectedOption = this.options.find(option => option.value === this.value) || null;
    }

    this.updateOptionStates();
  }

  private updateOptionStates(): void {
    this.optionStates = {};

    if (this.filteredOptions && Array.isArray(this.filteredOptions)) {
      this.filteredOptions.forEach((option, index) => {
        if (option && option.value !== undefined) {
          const isSelected = this.isOptionSelected(option);
          const isHighlighted = index === this.highlightedIndex;
          const isDisabled = !!option.disabled;

          this.optionStates[option.value] = {
            selected: isSelected,
            highlighted: isHighlighted,
            disabled: isDisabled
          };
        }
      });
    }
  }

  private handleSingleSelection(option: SearchableSelectOption): void {
    this.selectedOption = option;
    this.value = option.value;
    this.onChange(this.value);

    const changeEvent: SearchableSelectChangeEvent = {
      value: this.value,
      option: this.selectedOption
    };

    this.selectionChange.emit(changeEvent);
  }

  private handleMultipleSelection(option: SearchableSelectOption): void {
    if (!Array.isArray(this.selectedOption)) {
      this.selectedOption = [];
    }

    const isSelected = this.selectedOption.some(selected => selected.value === option.value);

    if (isSelected) {
      this.selectedOption = this.selectedOption.filter(selected => selected.value !== option.value);
    } else {
      this.selectedOption = [...this.selectedOption, option];
    }

    this.value = this.selectedOption.map(opt => opt.value);
    this.onChange(this.value);

    const changeEvent: SearchableSelectChangeEvent = {
      value: this.value,
      option: this.selectedOption
    };

    this.selectionChange.emit(changeEvent);
  }

  private highlightNext(): void {
    const maxIndex = this.filteredOptions ? this.filteredOptions.length - 1 : -1;
    this.highlightedIndex = Math.min(this.highlightedIndex + 1, maxIndex);
    this.updateOptionStates();
    this.scrollToHighlighted();
    this.cdr.markForCheck();
  }

  private highlightPrevious(): void {
    this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
    this.updateOptionStates();
    this.scrollToHighlighted();
    this.cdr.markForCheck();
  }

  private scrollToHighlighted(): void {
    if (this.dropdown && this.highlightedIndex >= 0) {
      const optionElement = this.dropdown.nativeElement.children[this.highlightedIndex];
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // Getter methods for template
  get displayText(): string {
    if (this.config.multiple) {
      const multipleOptions = this.selectedMultipleOptions;
      if (multipleOptions.length === 0) {
        return this.config.placeholder || '';
      } else if (multipleOptions.length === 1) {
        return multipleOptions[0].label;
      } else {
        return `${multipleOptions.length} items selected`;
      }
    } else {
      const singleOption = this.selectedSingleOption;
      if (singleOption) {
        return singleOption.label;
      }
    }
    return this.config.placeholder || '';
  }

  get showClearButton(): boolean {
    return this.config.clearable && !this.config.disabled &&
           ((this.config.multiple && this.selectedMultipleOptions.length > 0) ||
            (!this.config.multiple && this.selectedSingleOption !== null));
  }

  isOptionSelected(option: SearchableSelectOption): boolean {
    if (this.config.multiple) {
      return this.selectedMultipleOptions.some(selected => selected.value === option.value);
    }
    return this.selectedSingleOption ?
           this.selectedSingleOption.value === option.value : false;
  }

  get selectedMultipleOptions(): SearchableSelectOption[] {
    return this.config.multiple && Array.isArray(this.selectedOption) ?
           this.selectedOption : [];
  }

  get selectedSingleOption(): SearchableSelectOption | null {
    return !this.config.multiple && this.selectedOption && !Array.isArray(this.selectedOption) ?
           this.selectedOption : null;
  }

  get hasPlaceholder(): boolean {
    if (this.config.multiple) {
      return this.selectedMultipleOptions.length === 0;
    } else {
      return !this.selectedSingleOption;
    }
  }

  get hasSelectedChips(): boolean {
    return this.config.multiple && this.selectedMultipleOptions.length > 0;
  }

  get showLoadingState(): boolean {
    return !!this.config.loading;
  }

  get showNoResults(): boolean {
    return !this.config.loading && (!this.filteredOptions || this.filteredOptions.length === 0);
  }

  get showSearchInput(): boolean {
    return !!this.config.searchable;
  }

  get dropdownMaxHeight(): string {
    return this.config.maxHeight || '200px';
  }

  getOptionState(option: SearchableSelectOption, index: number): { selected: boolean, highlighted: boolean, disabled: boolean } {
    return this.optionStates[option.value] || {
      selected: this.isOptionSelected(option),
      highlighted: index === this.highlightedIndex,
      disabled: !!option.disabled
    };
  }

  trackByOptionValue(index: number, option: SearchableSelectOption): any {
    return option?.value;
  }

  /**
   * Merges two config objects, filtering out undefined/null values from the override config.
   */
  private mergeConfig(defaultConfig: SearchableSelectConfig, overrideConfig: SearchableSelectConfig): SearchableSelectConfig {
    const filtered: Partial<SearchableSelectConfig> = {};

    if (overrideConfig) {
      Object.keys(overrideConfig).forEach(key => {
        const value = overrideConfig[key as keyof SearchableSelectConfig];
        if (value !== undefined && value !== null) {
          (filtered as any)[key] = value;
        }
      });
    }

    return { ...defaultConfig, ...filtered };
  }

  /**
   * Updates all cached translations.
   */
  private updateTranslations(): void {
    const entityKey = this.config.entityKey || 'common.searchableSelect.fallbackEntity';
    const entity = this.translate.instant(entityKey);

    const placeholderKey = this.config.placeholder || this.defaultConfig.placeholder!;
    const searchPlaceholderKey = this.config.searchPlaceholder || this.defaultConfig.searchPlaceholder!;
    const noResultsKey = this.config.noResultsText || this.defaultConfig.noResultsText!;
    const loadingKey = this.config.loadingText || this.defaultConfig.loadingText!;

    this.cachedPlaceholder = this.translate.instant(placeholderKey, { entity });
    this.cachedSearchPlaceholder = this.translate.instant(searchPlaceholderKey, { entity });
    this.cachedNoResultsText = this.translate.instant(noResultsKey, { entity });
    this.cachedLoadingText = this.translate.instant(loadingKey);
  }

  /**
   * Gets the translated placeholder with entity interpolation.
   */
  get translatedPlaceholder(): string {
    if (!this.cachedPlaceholder) {
      this.updateTranslations();
    }
    return this.cachedPlaceholder || '';
  }

  /**
   * Gets the translated search placeholder with entity interpolation.
   */
  get translatedSearchPlaceholder(): string {
    return this.cachedSearchPlaceholder || '';
  }

  /**
   * Gets the translated no results text with entity interpolation.
   */
  get translatedNoResultsText(): string {
    return this.cachedNoResultsText || '';
  }

  /**
   * Gets the translated loading text.
   */
  get translatedLoadingText(): string {
    return this.cachedLoadingText || '';
  }
}
