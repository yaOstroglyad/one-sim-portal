import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { TableColumnConfig, TableConfig } from '../../model';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'column-control',
  templateUrl: './column-control.component.html',
  styleUrls: ['./column-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnControlComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config$: Observable<TableConfig>;
  @Input() currentSelectedColumns: Set<string>;
  @Output() columnSelectionChange = new EventEmitter<Set<string>>();

  private destroy$ = new Subject<void>();
  public selectedColumns = new Set<string>();
  public tableConfig: TableConfig | null = null;
  private originalVisibleColumns = new Set<string>();
  
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.config$.pipe(takeUntil(this.destroy$)).subscribe((config: TableConfig) => {
      this.tableConfig = config;
      if (this.selectedColumns.size === 0) {
        // Store original visible columns
        this.originalVisibleColumns.clear();
        config.columns.forEach((col: TableColumnConfig) => {
          if (col.visible) {
            this.selectedColumns.add(col.header);
            this.originalVisibleColumns.add(col.header);
          }
        });
      }
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentSelectedColumns && !changes.currentSelectedColumns.isFirstChange()) {
      this.selectedColumns = new Set(changes.currentSelectedColumns.currentValue);
    }
  }

  onColumnSelect(columnHeader: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedColumns.add(columnHeader);
    } else {
      this.selectedColumns.delete(columnHeader);
    }

    this.columnSelectionChange.emit(this.selectedColumns);
  }
  
  toggleColumn(columnHeader: string): void {
    const isCurrentlySelected = this.selectedColumns.has(columnHeader);
    this.onColumnSelect(columnHeader, !isCurrentlySelected);
    this.cdr.markForCheck();
  }
  
  resetToDefault(): void {
    // Use stored original visible columns
    this.selectedColumns = new Set(this.originalVisibleColumns);
    this.columnSelectionChange.emit(this.selectedColumns);
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
