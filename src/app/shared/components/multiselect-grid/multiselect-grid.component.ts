import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { IconDirective } from '@coreui/icons-angular';

import { GridSelectOption, GridConfig } from '../../model';

@Component({
  selector: 'app-multiselect-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IconDirective
  ],
  templateUrl: './multiselect-grid.component.html',
  styleUrls: ['./multiselect-grid.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiselectGridComponent),
      multi: true
    }
  ]
})
export class MultiselectGridComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() options: Observable<GridSelectOption[]> | GridSelectOption[] = [];
  @Input() config: GridConfig = {};
  @Input() disabled = false;
  @Input() placeholder = 'Search...';

  @Output() selectionChange = new EventEmitter<any[]>();

  private destroy$ = new Subject<void>();
  private searchQuery$ = new BehaviorSubject<string>('');
  private allOptions$ = new BehaviorSubject<GridSelectOption[]>([]);

  searchQuery = '';
  selectedValues: Set<any> = new Set();
  filteredOptions: GridSelectOption[] = [];

  // ControlValueAccessor
  private onChange = (value: any[]) => {};
  private onTouched = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOptions();
    this.setupFiltering();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadOptions(): void {
    if (Array.isArray(this.options)) {
      this.allOptions$.next(this.options);
    } else if (this.options) {
      (this.options as Observable<GridSelectOption[]>)
        .pipe(takeUntil(this.destroy$))
        .subscribe(options => {
          this.allOptions$.next(options);
        });
    }
  }

  private setupFiltering(): void {
    combineLatest([
      this.allOptions$,
      this.searchQuery$.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$),
      map(([options, query]) => this.filterOptions(options, query))
    ).subscribe(filtered => {
      this.filteredOptions = filtered;
      this.cdr.markForCheck();
    });
  }

  private filterOptions(options: GridSelectOption[], query: string): GridSelectOption[] {
    if (!query.trim() || !this.config.searchable) {
      return options;
    }

    const searchFields = this.config.searchFields || ['displayValue'];
    const searchLower = query.toLowerCase();

    return options.filter(option => {
      return searchFields.some(field => {
        const value = this.getNestedProperty(option, field);
        return value && value.toString().toLowerCase().includes(searchLower);
      });
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchQuery$.next(query);
  }

  onItemToggle(option: GridSelectOption): void {
    if (option.disabled || this.disabled) return;

    if (this.selectedValues.has(option.value)) {
      this.selectedValues.delete(option.value);
    } else {
      this.selectedValues.add(option.value);
    }

    this.emitChange();
    this.onTouched();
  }

  onSelectAll(): void {
    if (this.disabled) return;

    this.filteredOptions
      .filter(option => !option.disabled)
      .forEach(option => {
        this.selectedValues.add(option.value);
      });

    this.emitChange();
    this.onTouched();
  }

  onDeselectAll(): void {
    if (this.disabled) return;

    this.filteredOptions
      .filter(option => !option.disabled)
      .forEach(option => {
        this.selectedValues.delete(option.value);
      });

    this.emitChange();
    this.onTouched();
  }

  isSelected(option: GridSelectOption): boolean {
    return this.selectedValues.has(option.value);
  }

  get selectedCount(): number {
    return this.selectedValues.size;
  }

  get hasFilteredResults(): boolean {
    return this.filteredOptions.length > 0;
  }

  get showNoResults(): boolean {
    return this.searchQuery.trim() !== '' && this.filteredOptions.length === 0;
  }

  private emitChange(): void {
    const values = Array.from(this.selectedValues);
    this.onChange(values);
    this.selectionChange.emit(values);
  }

  // ControlValueAccessor implementation
  writeValue(value: any[]): void {
    if (value) {
      this.selectedValues = new Set(value);
    } else {
      this.selectedValues = new Set();
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}