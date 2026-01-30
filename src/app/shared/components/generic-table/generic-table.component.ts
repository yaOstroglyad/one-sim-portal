import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  ContentChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Observable, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { FormatTimePipe, DisplayValueByKeyPipe } from '@shared/pipes';
import { PaginationComponent } from '../pagination';
import { TableColumnConfig, TableConfig } from '@shared/models';
import { TableFooterAggregationHelper } from './helpers/table-footer-aggregation.helper';
import { TableUtils } from './helpers/table.utils';
import { TableRow, PageChangeEvent, SortChangeEvent } from './models/table-row.interface';

/**
 * Generic reusable table with pagination, sorting, and footer aggregations
 */
@Component({
    standalone: true,

  selector: 'generic-table',
  imports: [
    CommonModule,
    TranslateModule,
    TableDirective,
    FormatTimePipe,
    IconDirective,
    DisplayValueByKeyPipe,
    PaginationComponent
  ],
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericTableComponent<T extends TableRow = TableRow> implements OnChanges {
  // Inputs
  @Input() config$!: Observable<TableConfig>;
  @Input() data$!: Observable<T[]>;
  @Input() menu!: TemplateRef<any>;
  @Input() isRowClickable = false;

  @ContentChild('[custom-toolbar]', { read: TemplateRef })
  public customToolbarTpl?: TemplateRef<any>;

  // Outputs
  @Output() selectedItemsChange = new EventEmitter<T[]>();
  @Output() onRowClickEvent = new EventEmitter<T>();
  @Output() toggleAction = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<PageChangeEvent>();
  @Output() sortChange = new EventEmitter<SortChangeEvent>();

  // State
  public viewModel$!: Observable<{ config: TableConfig; data: T[] }>;
  public currentPage = 0;
  public pageSize = 15;
  public totalPages = 0;
  public selectedItems = new Set<T>();

  // Lifecycle
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['config$'] || changes['data$']) && this.config$ && this.data$) {
      this.createViewModel();
    }
  }

  // View Model
  private createViewModel(): void {
    this.viewModel$ = combineLatest([this.config$, this.data$]).pipe(
      map(([config, data]) => {
        TableUtils.setSortDirection(config.columns);
        if (config.pagination?.totalPages != null) {
          this.totalPages = config.pagination.totalPages;
        }
        return { config, data };
      })
    );
  }

  // Pagination
  public changePage(newPage: number, isServerSide?: boolean): void {
    this.currentPage = newPage;
    this.pageChange.emit({ page: this.currentPage, size: this.pageSize, isServerSide });
  }

  public onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.currentPage = 0;
    this.config$.pipe(take(1)).subscribe(config => {
      const isServerSide = config.pagination?.serverSide;
      this.pageChange.emit({ page: this.currentPage, size: this.pageSize, isServerSide });
    });
  }

  // Selection
  public toggleAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.data$.pipe(take(1)).subscribe(data => {
      if (checkbox.checked) {
        data.forEach(item => this.selectedItems.add(item));
      } else {
        this.selectedItems.clear();
      }
      this.selectedItemsChange.emit(Array.from(this.selectedItems));
    });
  }

  public toggleItemSelection(item: T, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedItems.add(item);
    } else {
      this.selectedItems.delete(item);
    }
    this.selectedItemsChange.emit(Array.from(this.selectedItems));
  }

  public isSelected(item: T): boolean {
    return this.selectedItems.has(item);
  }

  // Sorting
  public onSortColumn(column: TableColumnConfig): void {
    if (!column.sortable) return;
    this.config$.pipe(take(1)).subscribe(config => {
      config.columns.forEach(col => {
        if (col !== column) col.sortDirection = null;
      });
      column.sortDirection = column.sortDirection === 'asc' ? 'desc' : 'asc';
      this.sortChange.emit({ column: column.key, direction: column.sortDirection });
    });
  }

  // Row Actions
  public onEdit(item: T): void {
    this.toggleAction.emit(item);
  }

  public onRowClick(item: T): void {
    this.onRowClickEvent.emit(item);
  }

  // Footer Aggregations
  public getAggregationValue(data: T[], columnKey: string, config: TableConfig): string {
    return TableFooterAggregationHelper.getAggregationValue(data, columnKey, config);
  }

  public getAggregationTooltip(columnKey: string, config: TableConfig): string | undefined {
    return TableFooterAggregationHelper.getAggregationTooltip(columnKey, config);
  }

  // Utilities
  public trackById = TableUtils.trackById;
  public isEven = TableUtils.isEven;
  public isOdd = TableUtils.isOdd;
  public getMinRows = TableUtils.getMinRows;
}
