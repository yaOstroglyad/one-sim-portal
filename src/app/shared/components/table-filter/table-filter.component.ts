import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FilterConfig } from './table-filter-config.interface';
import { Observable, take } from 'rxjs';
import { TableConfig } from '../generic-table/table-column-config.interface';

@Component({
  selector: 'table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableFilterComponent implements OnInit {
  @Input() config: FilterConfig;
  @Input() tableConfig$: Observable<TableConfig>;
  @Output() filteredData = new EventEmitter<any>();
  @Output() columnSelectionChange = new EventEmitter<Set<string>>();

  filterForm: FormGroup;

  private initialTableConfig: TableConfig;

  public currentSelectedColumns = new Set<string>();

  protected readonly Object = Object;

  ngOnInit() {
    const group = {};
    Object.keys(this.config).forEach(key => {
      group[key] = new FormControl('');
    });
    this.filterForm = new FormGroup(group);

    this.filterForm.valueChanges.subscribe(val => {
      this.filteredData.emit(val);
    });

    this.tableConfig$ && this.tableConfig$.pipe(
        take(1)
    ).subscribe((config: TableConfig) => {
      this.initialTableConfig = { ...config };
    });
  }

  public resetForm(): void {
    this.filterForm.reset();
    this.filteredData.emit();
    this.resetTableConfig();
    this.resetColumnSelection();
  }

  private resetColumnSelection(): void {
    const resetColumns = new Set<string>();
    if (this.initialTableConfig) {
      this.initialTableConfig.columns.forEach(col => {
        if (col.visible) {
          resetColumns.add(col.header);
        }
      });
      this.currentSelectedColumns = resetColumns;
    }
    this.columnSelectionChange.emit(resetColumns);
  }

  private resetTableConfig(): void {
    if (this.initialTableConfig) {
      const resetColumns = new Set<string>();
      this.initialTableConfig.columns.forEach(col => {
        if (col.visible) {
          resetColumns.add(col.header);
        }
      });
      this.columnSelectionChange.emit(resetColumns);
    }
  }

  onColumnSelectionChanged($event: Set<string>) {
    this.currentSelectedColumns = $event;
    this.columnSelectionChange.emit($event);
  }
}
