export interface SearchableSelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  data?: any; // Additional data that can be passed with the option
}

export interface SearchableSelectConfig {
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  clearable?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  maxHeight?: string;
  searchable?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export interface SearchableSelectChangeEvent {
  value: any;
  option: SearchableSelectOption | SearchableSelectOption[] | null;
}