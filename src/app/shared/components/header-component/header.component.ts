import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
  computed,
  signal,
  effect,
  DestroyRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControlDirective, FormSelectDirective } from '@coreui/angular';
import { ColumnControlComponent } from '../column-control/column-control.component';
import { debounceTime, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { TableConfig, HeaderConfig } from '@shared/models';
import { OsResponsiveActionsComponent, OsActionItem } from '@shared/components/ui/os-responsive-actions';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormControlDirective,
    FormSelectDirective,
    ColumnControlComponent,
    OsResponsiveActionsComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly destroyRef = inject(DestroyRef);

  // Signal-based inputs
  readonly config = input<HeaderConfig>();
  readonly tableConfig$ = input<Observable<TableConfig>>();

  // Signal-based outputs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Different consumers expect different shapes
  readonly filteredData = output<any>();
  readonly onAddAction = output<void>();
  readonly columnSelectionChange = output<Set<string>>();

  // Internal signals
  readonly formKeys = signal<string[]>([]);
  readonly showAddButton = signal<boolean>(false);
  readonly selectedColumns = signal<Set<string>>(new Set());
  readonly isFormPristine = signal<boolean>(true);

  // Form (not a signal - reactive forms have their own reactivity)
  headerForm = new FormGroup<Record<string, FormControl<string>>>({});
  private initialTableConfig: TableConfig | null = null;

  // ViewChild for column control
  readonly columnControlRef = viewChild<ColumnControlComponent>('columnControl');

  /** Computed: Actions for responsive actions component */
  readonly headerActions = computed<OsActionItem[]>(() => {
    const actions: OsActionItem[] = [];
    const keys = this.formKeys();
    const showAdd = this.showAddButton();
    const isPristine = this.isFormPristine();
    const columnControl = this.columnControlRef();

    // Columns button - secondary (goes to menu on mobile)
    actions.push({
      id: 'columns',
      icon: 'cilColumns',
      label: 'columnControl.title',
      menuTriggerRef: columnControl ?? undefined
    });

    // Add button - primary (always visible as button)
    if (showAdd) {
      actions.push({
        id: 'add',
        icon: 'cilPlus',
        label: 'common.add',
        action: () => this.addNewEntity(),
        primary: true,
        color: 'primary'
      });
    }

    // Reset button - secondary (goes to menu on mobile)
    if (keys.length > 0) {
      actions.push({
        id: 'reset',
        icon: 'cilReload',
        label: 'common.reset',
        action: () => this.resetForm(),
        disabled: isPristine
      });
    }

    return actions;
  });

  constructor() {
    // Effect to initialize form when config changes
    effect(() => {
      const cfg = this.config();
      if (cfg) {
        this.initForm(cfg);
      }
    });

    // Effect to subscribe to tableConfig when it changes
    effect(() => {
      const config$ = this.tableConfig$();
      if (config$) {
        this.subscribeToTableConfig(config$);
      }
    });
  }

  private initForm(config: HeaderConfig): void {
    const keys = Object.keys(config);
    this.formKeys.set(keys);

    const group: Record<string, FormControl<string>> = {};
    keys.forEach(key => {
      group[key] = new FormControl(config[key].defaultValue || '', { nonNullable: true });
    });

    this.headerForm = new FormGroup(group);
    this.isFormPristine.set(true);

    // Track form changes
    this.headerForm.valueChanges.pipe(
      debounceTime(400),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isFormPristine.set(this.headerForm.pristine);
      this.filteredData.emit(val);
    });

    // Also track pristine state changes
    this.headerForm.statusChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isFormPristine.set(this.headerForm.pristine);
    });
  }

  private subscribeToTableConfig(config$: Observable<TableConfig>): void {
    config$.pipe(take(1)).subscribe((config: TableConfig) => {
      this.initialTableConfig = { ...config };
      this.showAddButton.set(config.showAddButton ?? false);
      this.resetColumnSelection();
    });
  }

  resetForm(): void {
    this.headerForm.reset();
    this.isFormPristine.set(true);
    this.filteredData.emit(undefined);
    this.resetColumnSelection();
  }

  private resetColumnSelection(): void {
    const resetColumns = new Set<string>();
    this.initialTableConfig?.columns.forEach(col => {
      if (col.visible) {
        resetColumns.add(col.header);
      }
    });
    this.selectedColumns.set(resetColumns);
    this.columnSelectionChange.emit(resetColumns);
  }

  onColumnSelectionChanged(columns: Set<string>): void {
    this.selectedColumns.set(columns);
    this.columnSelectionChange.emit(columns);
  }

  addNewEntity(): void {
    this.onAddAction.emit();
  }

  // Getter for template compatibility with currentSelectedColumns
  get currentSelectedColumns(): Set<string> {
    return this.selectedColumns();
  }
}
