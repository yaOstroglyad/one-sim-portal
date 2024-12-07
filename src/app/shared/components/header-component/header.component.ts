import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { TableConfig } from '../generic-table/table-column-config.interface';
import { HeaderConfig } from './header-config.interface';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  @Input() config: HeaderConfig;
  @Input() tableConfig$: Observable<TableConfig>;
  @Output() filteredData = new EventEmitter<any>();
  @Output() onAddAction = new EventEmitter<any>();
  @Output() columnSelectionChange = new EventEmitter<Set<string>>();

  headerForm: FormGroup;
  formKeys: string[] = [];
  private initialTableConfig: TableConfig;
  public currentSelectedColumns = new Set<string>();

  ngOnInit() {
    this.initForm();
    this.subscribeToTableConfig();
  }

  initForm() {
    const group = {};
    this.formKeys = Object.keys(this.config);
    this.formKeys.forEach(key => {
      group[key] = new FormControl(this.config[key].defaultValue || '');
    });
    this.headerForm = new FormGroup(group);
    this.headerForm.valueChanges.pipe(
      debounceTime(400)
    ).subscribe(val => this.filteredData.emit(val));
  }

  subscribeToTableConfig() {
    this.tableConfig$?.pipe(take(1)).subscribe((config: TableConfig) => {
      this.initialTableConfig = { ...config };
      this.resetColumnSelection(true);
    });
  }

  resetForm(): void {
    this.headerForm.reset();
    this.filteredData.emit();
    this.resetColumnSelection();
  }

  resetColumnSelection(initial = false): void {
    const resetColumns = new Set<string>();
    this.initialTableConfig?.columns.forEach(col => {
      if (col.visible || initial) { // Initially add all or only visible based on the flag
        resetColumns.add(col.header);
      }
    });
    this.currentSelectedColumns = resetColumns;
    this.columnSelectionChange.emit(resetColumns);
  }

  onColumnSelectionChanged($event: Set<string>): void {
    this.currentSelectedColumns = $event;
    this.columnSelectionChange.emit($event);
  }

  addNewEntity(): void {
    this.onAddAction.emit();
  }
}
