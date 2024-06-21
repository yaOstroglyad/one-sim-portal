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

export enum GridColumnType {
  text = 'text',
  date = 'date',
  custom = 'custom'
}

export interface EmptyStateConfig {
  title: string;
  imgUrl: string;
}
