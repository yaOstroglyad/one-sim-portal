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
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DatePickerConfig, DateRange, DateValue } from './date-picker-wrapper.types';

@Component({
  selector: 'app-date-picker-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerWrapperComponent),
      multi: true
    }
  ],
  templateUrl: './date-picker-wrapper.component.html',
  styleUrls: ['./date-picker-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePickerWrapperComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {

  @Input() config: DatePickerConfig = {
    mode: 'single',
    appearance: 'outline',
    size: 'medium'
  };
  
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() error?: string;
  @Input() helperText?: string;

  @Output() dateChange = new EventEmitter<DateValue>();
  @Output() dateRangeChange = new EventEmitter<DateRange>();

  // Form controls for different modes
  singleDateControl = new FormControl<Date | null>(null);
  startDateControl = new FormControl<Date | null>(null);
  endDateControl = new FormControl<Date | null>(null);

  // Internal state
  private currentValue: DateValue = null;
  private destroy$ = new Subject<void>();

  // ControlValueAccessor
  private onChange: (value: DateValue) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupFormControls();
    this.mergeInputsWithConfig();
    // Apply initial disabled state if configured
    if (this.config.disabled || this.disabled) {
      this.updateControlsDisabledState();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update disabled state when @Input() disabled changes
    if (changes['disabled'] && !changes['disabled'].firstChange) {
      this.updateControlsDisabledState();
      this.cdr.markForCheck();
    }
    
    // Update disabled state when config changes
    if (changes['config'] && !changes['config'].firstChange) {
      const configChange = changes['config'];
      if (configChange.currentValue?.disabled !== configChange.previousValue?.disabled) {
        this.updateControlsDisabledState();
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: DateValue): void {
    this.currentValue = value;
    this.updateFormControls(value);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: DateValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.updateControlsDisabledState();
    this.cdr.markForCheck();
  }

  // Private methods
  private setupFormControls(): void {
    if (this.config.mode === 'single') {
      this.singleDateControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(date => {
          this.handleSingleDateChange(date);
        });
    } else {
      // Range mode
      this.startDateControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.handleRangeDateChange();
        });

      this.endDateControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.handleRangeDateChange();
        });
    }
  }

  private mergeInputsWithConfig(): void {
    // Merge individual inputs with config object
    if (this.label) this.config.label = this.label;
    if (this.placeholder) this.config.placeholder = this.placeholder;
    if (this.required !== undefined) this.config.required = this.required;
    if (this.disabled !== undefined) {
      this.config.disabled = this.disabled;
      // Update the internal disabled flag for updateControlsDisabledState
      this.disabled = this.disabled;
    }
    if (this.error) this.config.errorMessage = this.error;
    if (this.helperText) this.config.helperText = this.helperText;
  }

  private updateFormControls(value: DateValue): void {
    if (this.config.mode === 'single') {
      this.singleDateControl.setValue(value as Date, { emitEvent: false });
    } else {
      const range = value as DateRange;
      if (range) {
        this.startDateControl.setValue(range.start, { emitEvent: false });
        this.endDateControl.setValue(range.end, { emitEvent: false });
      } else {
        this.startDateControl.setValue(null, { emitEvent: false });
        this.endDateControl.setValue(null, { emitEvent: false });
      }
    }
  }

  private updateControlsDisabledState(): void {
    const isDisabled = this.disabled || this.config.disabled;
    
    if (isDisabled) {
      this.singleDateControl.disable({ emitEvent: false });
      this.startDateControl.disable({ emitEvent: false });
      this.endDateControl.disable({ emitEvent: false });
    } else {
      this.singleDateControl.enable({ emitEvent: false });
      this.startDateControl.enable({ emitEvent: false });
      this.endDateControl.enable({ emitEvent: false });
    }
  }

  private handleSingleDateChange(date: Date | null): void {
    this.currentValue = date;
    this.onChange(date);
    this.dateChange.emit(date);
    this.onTouched();
  }

  private handleRangeDateChange(): void {
    const range: DateRange = {
      start: this.startDateControl.value,
      end: this.endDateControl.value
    };
    
    this.currentValue = range;
    this.onChange(range);
    this.dateChange.emit(range);
    this.dateRangeChange.emit(range);
    this.onTouched();
  }

  // Getters for template
  get isSingleMode(): boolean {
    return this.config.mode === 'single';
  }

  get isRangeMode(): boolean {
    return this.config.mode === 'range';
  }

  get displayLabel(): string {
    return this.config.label || '';
  }

  get displayPlaceholder(): string {
    return this.config.placeholder || '';
  }

  get hasError(): boolean {
    return !!this.config.errorMessage;
  }

  get displayError(): string {
    return this.config.errorMessage || '';
  }

  get displayHelperText(): string {
    return this.config.helperText || '';
  }

  get fieldSize(): string {
    return `date-picker--${this.config.size || 'medium'}`;
  }

  get fieldAppearance(): 'outline' | 'fill' {
    return this.config.appearance || 'outline';
  }
}