export interface DatePickerConfig {
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  errorMessage?: string;
  helperText?: string;
  mode: 'single' | 'range';
  appearance?: 'outline' | 'fill';
  size?: 'small' | 'medium' | 'large';
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export type DateValue = Date | DateRange | null;