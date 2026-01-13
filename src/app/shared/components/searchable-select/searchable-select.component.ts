import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  HostListener,
  forwardRef,
  inject,
  signal,
  computed,
  input,
  output,
  effect
} from '@angular/core';
import { ConnectedPosition, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { CdkOverlayOrigin, CdkConnectedOverlay } from '@angular/cdk/overlay';

import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SearchableSelectOption, SearchableSelectConfig, SearchableSelectChangeEvent } from './searchable-select.types';

let nextId = 0;

@Component({
    standalone: true,
    selector: 'app-searchable-select',
    imports: [
      CommonModule,
      FormsModule,
      IconDirective,
      MatIconModule,
      TranslateModule,
      CdkOverlayOrigin,
      CdkConnectedOverlay
    ],
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
export class SearchableSelectComponent implements OnInit, ControlValueAccessor {

  // Signal inputs
  readonly options = input<SearchableSelectOption[]>([]);
  readonly config = input<SearchableSelectConfig>({});
  readonly label = input<string>();
  readonly required = input(false);
  readonly error = input<string>();
  readonly className = input<string>();

  // Signal outputs
  readonly selectionChange = output<SearchableSelectChangeEvent>();
  readonly searchChange = output<string>();

  @ViewChild('dropdown', { static: false }) dropdown!: ElementRef;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @ViewChild('trigger', { static: false }) triggerElement!: ElementRef;

  // Unique component ID for ARIA
  readonly componentId = `searchable-select-${nextId++}`;

  // Internal state signals
  readonly isOpen = signal(false);
  readonly searchTerm = signal('');
  readonly highlightedIndex = signal(-1);
  readonly triggerWidth = signal(0);

  // CVA value signal
  private readonly internalValue = signal<any>(null);

  // CVA callbacks
  private onTouched: () => void = () => {};
  private onChange: (value: any) => void = () => {};

  // Injected services
  private readonly elementRef = inject(ElementRef);
  private readonly translate = inject(TranslateService);
  private readonly overlay = inject(Overlay);

  // CDK Overlay configuration
  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 2 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -2 }
  ];

  readonly scrollStrategy: ScrollStrategy = this.overlay.scrollStrategies.reposition();

  // Default configuration
  private readonly defaultConfig: SearchableSelectConfig = {
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

  // Computed: merged config
  readonly mergedConfig = computed(() => {
    const cfg = this.config();
    const filtered: Partial<SearchableSelectConfig> = {};
    if (cfg) {
      Object.keys(cfg).forEach(key => {
        const value = cfg[key as keyof SearchableSelectConfig];
        if (value !== undefined && value !== null) {
          (filtered as any)[key] = value;
        }
      });
    }
    return { ...this.defaultConfig, ...filtered };
  });

  // Computed: filtered options based on search
  readonly filteredOptions = computed(() => {
    const opts = this.options();
    const term = this.searchTerm().toLowerCase();
    const cfg = this.mergedConfig();

    if (!opts || !Array.isArray(opts)) {
      return [];
    }

    let filtered: SearchableSelectOption[];
    if (!term) {
      filtered = [...opts];
    } else {
      filtered = opts.filter(option =>
        option.label.toLowerCase().includes(term)
      );
    }

    // Add "None" option for single select with clearable enabled
    if (!cfg.multiple && cfg.clearable) {
      const clearOption: SearchableSelectOption = {
        value: null,
        label: this.translate.instant(cfg.clearOptionLabel || 'common.none'),
        disabled: this.internalValue() === null
      };
      filtered = [clearOption, ...filtered];
    }

    return filtered;
  });

  // Computed: selected option(s)
  readonly selectedOption = computed(() => {
    const opts = this.options();
    const val = this.internalValue();
    const cfg = this.mergedConfig();

    if (!opts || !Array.isArray(opts)) {
      return cfg.multiple ? [] : null;
    }

    if (cfg.multiple) {
      if (Array.isArray(val)) {
        return opts.filter(option => val.includes(option.value));
      }
      return [];
    }

    return opts.find(option => option.value === val) || null;
  });

  // Computed: selected options for multiple mode
  readonly selectedMultipleOptions = computed((): SearchableSelectOption[] => {
    const selected = this.selectedOption();
    const cfg = this.mergedConfig();
    return cfg.multiple && Array.isArray(selected) ? selected : [];
  });

  // Computed: selected option for single mode
  readonly selectedSingleOption = computed((): SearchableSelectOption | null => {
    const selected = this.selectedOption();
    const cfg = this.mergedConfig();
    return !cfg.multiple && selected && !Array.isArray(selected) ? selected : null;
  });

  // Computed: display text
  readonly displayText = computed(() => {
    const cfg = this.mergedConfig();
    if (cfg.multiple) {
      const multipleOptions = this.selectedMultipleOptions();
      if (multipleOptions.length === 0) {
        return '';
      } else if (multipleOptions.length === 1) {
        return multipleOptions[0].label;
      } else {
        return `${multipleOptions.length} items selected`;
      }
    } else {
      const singleOption = this.selectedSingleOption();
      if (singleOption) {
        return singleOption.label;
      }
    }
    return '';
  });

  // Computed: has placeholder (no selection)
  readonly hasPlaceholder = computed(() => {
    const cfg = this.mergedConfig();
    if (cfg.multiple) {
      return this.selectedMultipleOptions().length === 0;
    }
    return !this.selectedSingleOption();
  });

  // Computed: has selected chips
  readonly hasSelectedChips = computed(() => {
    const cfg = this.mergedConfig();
    return cfg.multiple && this.selectedMultipleOptions().length > 0;
  });

  // Computed: show loading state
  readonly showLoadingState = computed(() => !!this.mergedConfig().loading);

  // Computed: show no results
  readonly showNoResults = computed(() => {
    return !this.mergedConfig().loading && this.filteredOptions().length === 0;
  });

  // Computed: show search input
  readonly showSearchInput = computed(() => !!this.mergedConfig().searchable);

  // Computed: dropdown max height
  readonly dropdownMaxHeight = computed(() => this.mergedConfig().maxHeight || '200px');

  // Computed: disabled state
  readonly isDisabled = computed(() => !!this.mergedConfig().disabled);

  // Computed: active descendant ID for ARIA
  readonly activeDescendantId = computed(() => {
    const index = this.highlightedIndex();
    if (index >= 0) {
      return `${this.componentId}-option-${index}`;
    }
    return null;
  });

  // Cached translations
  private cachedPlaceholder = '';
  private cachedSearchPlaceholder = '';
  private cachedNoResultsText = '';
  private cachedLoadingText = '';

  constructor() {
    // Effect to update translations when language changes
    effect(() => {
      // Track mergedConfig to re-run when config changes
      const cfg = this.mergedConfig();
      this.updateTranslations(cfg);
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.translate.onLangChange.subscribe(() => {
      this.updateTranslations(this.mergedConfig());
    });
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Update config with disabled state - we need to create a new config object
    const currentConfig = this.config();
    // Note: Since config is an input signal, we can't directly modify it
    // The disabled state will be handled through mergedConfig
    // For CVA, we store the disabled state separately and merge it in mergedConfig
    this.cvaDisabled.set(isDisabled);
  }

  // CVA disabled state (separate from config.disabled)
  private readonly cvaDisabled = signal(false);

  // Update mergedConfig to include CVA disabled state
  readonly mergedConfigWithCva = computed(() => {
    const base = this.mergedConfig();
    const cvaDisabled = this.cvaDisabled();
    if (cvaDisabled) {
      return { ...base, disabled: true };
    }
    return base;
  });

  // Public methods
  toggle(event?: Event): void {
    if (this.mergedConfigWithCva().disabled) return;

    // Prevent toggle when clicking on chip (multi-select)
    if (event && (event.target as HTMLElement).closest('.chip')) {
      return;
    }

    this.isOpen() ? this.close() : this.open();
  }

  open(): void {
    if (this.mergedConfigWithCva().disabled) return;

    // Update trigger width for overlay
    if (this.triggerElement) {
      this.triggerWidth.set(this.triggerElement.nativeElement.offsetWidth);
    }

    this.isOpen.set(true);
    this.highlightedIndex.set(-1);
    this.searchTerm.set('');

    setTimeout(() => {
      if (this.mergedConfigWithCva().searchable && this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.onTouched();
  }

  onOverlayOutsideClick(): void {
    this.close();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.highlightedIndex.set(-1);
    this.searchChange.emit(value);
  }

  selectOption(option: SearchableSelectOption, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (option.disabled) return;

    const cfg = this.mergedConfigWithCva();
    if (cfg.multiple) {
      this.handleMultipleSelection(option);
    } else {
      this.handleSingleSelection(option);
    }

    if (!cfg.multiple) {
      this.close();
    }
  }

  clear(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const cfg = this.mergedConfigWithCva();
    const newValue = cfg.multiple ? [] : null;
    this.internalValue.set(newValue);
    this.onChange(newValue);

    const changeEvent: SearchableSelectChangeEvent = {
      value: newValue,
      option: cfg.multiple ? [] : null
    };

    this.selectionChange.emit(changeEvent);
  }

  removeOption(option: SearchableSelectOption, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const cfg = this.mergedConfigWithCva();
    if (!cfg.multiple) return;

    const currentSelection = this.selectedMultipleOptions();
    const newSelection = currentSelection.filter(selected => selected.value !== option.value);
    const newValue = newSelection.map(opt => opt.value);

    this.internalValue.set(newValue);
    this.onChange(newValue);

    const changeEvent: SearchableSelectChangeEvent = {
      value: newValue,
      option: newSelection
    };

    this.selectionChange.emit(changeEvent);
  }

  // Keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
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
        const index = this.highlightedIndex();
        const opts = this.filteredOptions();
        if (index >= 0 && opts && opts[index]) {
          this.selectOption(opts[index]);
        }
        break;
    }
  }

  // Private methods
  private handleSingleSelection(option: SearchableSelectOption): void {
    this.internalValue.set(option.value);
    this.onChange(option.value);

    const changeEvent: SearchableSelectChangeEvent = {
      value: option.value,
      option: option
    };

    this.selectionChange.emit(changeEvent);
  }

  private handleMultipleSelection(option: SearchableSelectOption): void {
    const currentSelection = this.selectedMultipleOptions();
    const isSelected = currentSelection.some(selected => selected.value === option.value);

    let newSelection: SearchableSelectOption[];
    if (isSelected) {
      newSelection = currentSelection.filter(selected => selected.value !== option.value);
    } else {
      newSelection = [...currentSelection, option];
    }

    const newValue = newSelection.map(opt => opt.value);
    this.internalValue.set(newValue);
    this.onChange(newValue);

    const changeEvent: SearchableSelectChangeEvent = {
      value: newValue,
      option: newSelection
    };

    this.selectionChange.emit(changeEvent);
  }

  private highlightNext(): void {
    const maxIndex = this.filteredOptions().length - 1;
    const current = this.highlightedIndex();
    this.highlightedIndex.set(Math.min(current + 1, maxIndex));
    this.scrollToHighlighted();
  }

  private highlightPrevious(): void {
    const current = this.highlightedIndex();
    this.highlightedIndex.set(Math.max(current - 1, 0));
    this.scrollToHighlighted();
  }

  private scrollToHighlighted(): void {
    const index = this.highlightedIndex();
    if (this.dropdown && index >= 0) {
      const optionElement = this.dropdown.nativeElement.querySelector(`#${this.componentId}-option-${index}`);
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  // Check if option is selected
  isOptionSelected(option: SearchableSelectOption): boolean {
    const cfg = this.mergedConfigWithCva();
    if (cfg.multiple) {
      return this.selectedMultipleOptions().some(selected => selected.value === option.value);
    }
    const single = this.selectedSingleOption();
    return single ? single.value === option.value : false;
  }

  // Track by function
  trackByOptionValue(index: number, option: SearchableSelectOption): any {
    return option?.value;
  }

  // Get option ID for ARIA
  getOptionId(index: number): string {
    return `${this.componentId}-option-${index}`;
  }

  /**
   * Updates all cached translations.
   */
  private updateTranslations(cfg: SearchableSelectConfig): void {
    const entityKey = cfg.entityKey || 'common.searchableSelect.fallbackEntity';
    const entity = this.translate.instant(entityKey);

    const placeholderKey = cfg.placeholder || this.defaultConfig.placeholder!;
    const searchPlaceholderKey = cfg.searchPlaceholder || this.defaultConfig.searchPlaceholder!;
    const noResultsKey = cfg.noResultsText || this.defaultConfig.noResultsText!;
    const loadingKey = cfg.loadingText || this.defaultConfig.loadingText!;

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
      this.updateTranslations(this.mergedConfigWithCva());
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
