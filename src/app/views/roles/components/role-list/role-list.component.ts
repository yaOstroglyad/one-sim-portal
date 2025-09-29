import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { map, debounceTime, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericRightPanelComponent, PanelAction } from '../../../../shared';
import { GenericTableModule, HeaderModule, TableConfig, DeleteConfirmationComponent } from '../../../../shared';
import { GenericTableComponent } from '../../../../shared/components/generic-table/generic-table.component';
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
import { UserRoleService } from '../../../../shared';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    RoleFormComponent,
    DeleteConfirmationComponent,
    GenericTableModule,
    HeaderModule,
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
  private snackBar = inject(MatSnackBar);

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

          // Show success message only when filtering (not on initial load)
          if (this.filterForm.dirty) {
            this.snackBar.open(`Search results loaded successfully. Total elements: ${data.totalElements}`, null, {
              panelClass: 'app-notification-success',
              duration: 1000
            });
          }
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.loading = false;
          this.error = true;
          this.roles$ = of([]);
          this.snackBar.open('Error loading roles', null, {
            panelClass: 'app-notification-error',
            duration: 3000
          });
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
          this.snackBar.open('Role deleted successfully', null, {
            panelClass: 'app-notification-success',
            duration: 2000
          });
          this.showDeletePanel = false;
          this.selectedRole = null;
          this.onRefresh();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          
          // Extract meaningful error message from backend response
          let errorMessage = 'Error deleting role';
          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.snackBar.open(errorMessage, null, {
            panelClass: 'app-notification-error',
            duration: 4000 // Longer duration for error messages
          });
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
    this.snackBar.open('Role saved successfully', null, {
      panelClass: 'app-notification-success',
      duration: 2000
    });
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
