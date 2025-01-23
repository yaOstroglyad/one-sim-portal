import { TemplateRef } from '@angular/core';

export interface GridColumnConfig {
  name: string;
  key: string;
  type: GridColumnType;
  htmlTemplate?: TemplateRef<any>;
  columnHeaderClassName?: string;
  columnClassNameCondition?: Function;
  columnClassName?: string;
}

export interface Pagination<T> {
  totalElements: number;
  totalPages: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  first: boolean;
  last: boolean;
  number: number;
  pageable: {
    page: number;
    size: number;
    sort: string[];
  };
  numberOfElements: number;
  size: number;
  empty: boolean;
  content: T[];
}

export enum GridColumnType {
  text = 'text',
  date = 'date',
  custom = 'custom'
}

export interface EmptyStateConfig {
  title: string;
  imgUrl: string;
}
