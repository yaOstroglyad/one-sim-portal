import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { TableColumnConfig, TableConfig } from '../generic-table/table-column-config.interface';
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

  ngOnInit(): void {
    this.config$.pipe(takeUntil(this.destroy$)).subscribe((config: TableConfig) => {
      if (this.selectedColumns.size === 0) {
        config.columns.forEach((col: TableColumnConfig) => {
          if (col.visible) {
            this.selectedColumns.add(col.header);
          }
        });
      }
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
