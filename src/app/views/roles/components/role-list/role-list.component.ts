import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  GenericRightPanelComponent,
  PanelAction,
  GenericTableComponent,
  HeaderComponent,
  TableConfig,
  DeleteConfirmationComponent
} from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { RoleService, RolesTableService } from '../../services';
import { Role } from '../../models';
import { RoleFormComponent } from '../role-form/role-form.component';

@Component({
    standalone: true,
    selector: 'app-role-list',
    imports: [
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    RoleFormComponent,
    DeleteConfirmationComponent,
    GenericTableComponent,
    HeaderComponent,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    ButtonDirective,
    FormControlDirective,
    IconDirective
],
    providers: [RolesTableService],
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleListComponent implements OnInit, OnDestroy {
  private roleService = inject(RoleService);
  private tableService = inject(RolesTableService);
  private cdr = inject(ChangeDetectorRef);
  private notification = inject(NotificationService);

  @ViewChild('genericTable') genericTable: GenericTableComponent;

  roles$: Observable<Role[]>;
  tableConfig$: BehaviorSubject<TableConfig>;
  filterForm: FormGroup;
  loading = false;
  error = false;

  private unsubscribe$ = new Subject<void>();

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDeletePanel = false;
  selectedRole: Role | null = null;

  // Panel actions
  detailsPanelActions: PanelAction[] = [];

  constructor() {
    // Initialize form
    this.filterForm = new FormGroup({
      category: new FormControl('')
    });

    // Get table config from service
    this.tableConfig$ = this.tableService.getTableConfig();

    // Initialize roles$ with empty data
    this.roles$ = of([]);
  }

  ngOnInit(): void {
    this.setupFilters();
    this.loading = true;
    this.loadData(); // Load initial data
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(700),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  private loadData(params: {
    page: number;
    size: number;
    category?: string;
    sort?: string[];
  } = { page: 0, size: 15 }): void {

    this.roleService.getRoles(
      params.category,
      params.page,
      params.size,
      params.sort || []
    )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          this.tableService.updateConfigData(data?.totalPages || 1);
          this.tableConfig$ = this.tableService.getTableConfig();
          this.roles$ = of(data.content);
          this.loading = false;
          this.error = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.error = true;
          this.roles$ = of([]);
          this.notification.error('errors.roleLoadFailed');
          this.cdr.detectChanges();
        }
      });
  }

  onRefresh(): void {
    const currentFilters = this.filterForm.getRawValue();
    this.loadData({
      page: 0,
      size: 15,
      category: currentFilters.category || undefined
    });
  }

  resetForm(): void {
    // Reset pagination directly on the table component
    if (this.genericTable) {
      this.genericTable.currentPage = 0;
    }

    this.filterForm.reset();
    this.applyFilter();
  }

  applyFilter(): void {
    const formValues = this.filterForm.getRawValue();
    const params = {
      page: 0,
      size: 15,
      category: formValues.category || undefined
    };
    this.loadData(params);
  }

  onPageChange({ page, size }: { page: number; size: number }): void {
    const formValues = this.filterForm.getRawValue();
    this.loadData({
      page,
      size,
      category: formValues.category || undefined
    });
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  onCreateNew(): void {
    this.selectedRole = null;
    this.showCreatePanel = true;
    this.cdr.detectChanges();
  }

  onEdit(role: Role): void {
    this.selectedRole = role;
    this.showEditPanel = true;
    this.cdr.detectChanges();
  }

  onDelete(role: Role): void {
    this.selectedRole = role;
    this.showDeletePanel = true;
    this.cdr.detectChanges();
  }

  onConfirmDelete(): void {
    if (this.selectedRole) {
      this.roleService.deleteRole(this.selectedRole.id).subscribe({
        next: () => {
          this.notification.success('notifications.roleDeleted');
          this.showDeletePanel = false;
          this.selectedRole = null;
          this.onRefresh();
        },
        error: () => {
          this.notification.error('errors.roleDeleteFailed');
        }
      });
    }
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDeletePanel = false;
    this.selectedRole = null;
    this.cdr.detectChanges();
  }

  onRoleSaved(): void {
    this.notification.success('notifications.roleSaved');
    this.onPanelClose();
    this.onRefresh();
  }

  isRoleProtected(role: Role): boolean {
    return role.isProtected === true;
  }

  canDeleteRole(role: Role): boolean {
    return !this.isRoleProtected(role);
  }

  canEditRole(role: Role): boolean {
    return !this.isRoleProtected(role);
  }
}
