import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import { GenericRightPanelComponent } from '../../../../shared';
import { GenericTableModule, HeaderModule, TableConfig, DeleteConfirmationComponent } from '../../../../shared';
import { UserService, UsersTableService } from '../../services';
import { User } from '../../models';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserRoleService } from '../../../../shared';
import { RoleManagementFormComponent, RoleOption } from '../role-management-form/role-management-form.component';
import { RoleService } from '../../../roles';

// Constants
const DEFAULT_PAGE_SIZE = 15;
const FILTER_DEBOUNCE_TIME = 700;
const ROLES_PAGE_SIZE = 100;
const NOTIFICATION_DURATION = 2000;
const SEARCH_NOTIFICATION_DURATION = 1000;

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    UserFormComponent,
    DeleteConfirmationComponent,
    RoleManagementFormComponent,
    GenericTableModule,
    HeaderModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    ButtonDirective,
    FormControlDirective,
    IconDirective
  ],
  providers: [UsersTableService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {
  private cdr = inject(ChangeDetectorRef);
  private tableService = inject(UsersTableService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private userRoleService = inject(UserRoleService);
  private roleService = inject(RoleService);

  public tableConfig$: BehaviorSubject<TableConfig>;
  public dataList$: Observable<User[]>;
  public filterForm: FormGroup;

  // Panel states
  showCreatePanel = false;
  showEditPanel = false;
  showDeletePanel = false;
  showAssignRolesPanel = false;
  showRemoveRolesPanel = false;
  selectedUser: User | null = null;

  // Role management data
  availableRoles: RoleOption[] = [];
  userRoles: RoleOption[] = [];

  @ViewChild('assignRoleForm') assignRoleForm: RoleManagementFormComponent;
  @ViewChild('removeRoleForm') removeRoleForm: RoleManagementFormComponent;
  @ViewChild('userRolesTemplate') userRolesTemplate: TemplateRef<any>;

  private unsubscribe$ = new Subject<void>();

  public ngOnInit(): void {
    this.initFormControls();
    this.loadData();
    this.setupFilters();
  }

  public ngAfterViewInit(): void {
    // Pass the template reference to the table service
    this.tableService.setUserRolesTemplate(this.userRolesTemplate);
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onPageChange({ page, size }: { page: number; size: number }): void {
    this.loadData({
      page,
      size,
      ...this.filterForm.getRawValue()
    });
  }

  public applyFilter(): void {
    const params = {
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      ...this.filterForm.getRawValue()
    };
    this.loadData(params);
  }

  public onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      searchQuery: new FormControl(null)
    });
  }

  private setupFilters(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(FILTER_DEBOUNCE_TIME),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.applyFilter();
    });
  }

  // Helper methods for notifications
  private showSuccessNotification(message: string, duration = NOTIFICATION_DURATION): void {
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-success',
      duration
    });
  }

  private showErrorNotification(message: string, duration = NOTIFICATION_DURATION): void {
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-error',
      duration
    });
  }

  private showWarningNotification(message: string, duration = NOTIFICATION_DURATION): void {
    this.snackBar.open(message, null, {
      panelClass: 'app-notification-warning',
      duration
    });
  }

  // Helper method for role conversion
  private convertToRoleOptions(roles: any[]): RoleOption[] {
    return roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName || role.name
    }));
  }

  // Helper method to close panels and reset state
  private closeAllPanelsAndRefresh(): void {
    this.onPanelClose();
    this.loadData();
  }

  private loadData(params: {
    page: number;
    size: number;
    searchQuery?: string;
  } = { page: 0, size: DEFAULT_PAGE_SIZE }): void {
    this.userService.paginatedUsers(params, params.page, params.size)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(data => {
        this.tableService.updateConfigData(data?.totalPages || DEFAULT_PAGE_SIZE);
        this.tableConfig$ = this.tableService.getTableConfig();
        this.dataList$ = of(data.content);
        this.cdr.detectChanges();
        if (this.filterForm.dirty) {
          this.showSuccessNotification(
            `Search results loaded successfully. Total elements: ${data.totalElements}`,
            SEARCH_NOTIFICATION_DURATION
          );
        }
      });
  }

  public createUser(): void {
    this.selectedUser = null;
    this.showCreatePanel = true;
    this.cdr.detectChanges();
  }

  public editUser(user: User): void {
    this.selectedUser = user;
    this.showEditPanel = true;
    this.cdr.detectChanges();
  }

  public deleteUser(user: User): void {
    this.selectedUser = user;
    this.showDeletePanel = true;
    this.cdr.detectChanges();
  }

  public resetPassword(user: User): void {
    if (user.id) {
      this.userService.resetPassword(user.id).subscribe({
        next: () => this.showSuccessNotification('Password reset successfully'),
        error: (error) => {
          console.error('Error resetting password:', error);
          this.showErrorNotification('Error resetting password');
        }
      });
    }
  }

  public resetForm(): void {
    this.filterForm.reset();
  }

  onConfirmDelete(): void {
    if (!this.selectedUser?.id) return;

    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.showSuccessNotification('User deleted successfully');
        this.closeAllPanelsAndRefresh();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.showErrorNotification('Error deleting user');
      }
    });
  }

  onPanelClose(): void {
    this.showCreatePanel = false;
    this.showEditPanel = false;
    this.showDeletePanel = false;
    this.showAssignRolesPanel = false;
    this.showRemoveRolesPanel = false;
    this.selectedUser = null;
    this.cdr.detectChanges();
  }

  onUserSaved(): void {
    this.showSuccessNotification('User saved successfully');
    this.closeAllPanelsAndRefresh();
  }

  canEditUser(user: User): boolean {
    return this.userRoleService.isAdmin() || this.userRoleService.isSupport();
  }

  canManageRoles(user: User): boolean {
    return this.userRoleService.isAdmin();
  }

  assignRoles(user: User): void {
    this.selectedUser = user;
    this.loadAvailableRoles();
    this.showAssignRolesPanel = true;
    this.cdr.detectChanges();
  }

  removeRoles(user: User): void {
    this.selectedUser = user;
    this.loadUserRoles(user);
    this.showRemoveRolesPanel = true;
    this.cdr.detectChanges();
  }

  private loadAvailableRoles(): void {
    if (!this.selectedUser) return;

    this.roleService.getRoles(undefined, 0, ROLES_PAGE_SIZE).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(response => {
      // Get IDs of roles that user already has
      const userRoleIds = (this.selectedUser?.roles || []).map(role => role.id);

      const filteredRoles = response.content
        .filter(role => role.name !== 'ADMIN') // Exclude ADMIN role
        .filter(role => !userRoleIds.includes(role.id)); // Exclude roles user already has

      this.availableRoles = this.convertToRoleOptions(filteredRoles);
      this.cdr.detectChanges();
    });
  }

  private loadUserRoles(user: User): void {
    // Extract roles from the user object
    this.userRoles = this.convertToRoleOptions(user.roles || []);
    this.cdr.detectChanges();
  }

  onConfirmAssignRoles(): void {
    if (!this.selectedUser || !this.assignRoleForm) {
      console.error('Selected user or assign role form not found');
      return;
    }

    const selectedRoleIds = this.assignRoleForm.getSelectedRoleIds();
    if (selectedRoleIds.length === 0) {
      this.showWarningNotification('Please select at least one role');
      return;
    }

    this.userService.assignRoles(this.selectedUser.id, selectedRoleIds).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.showSuccessNotification('Roles assigned successfully');
        this.closeAllPanelsAndRefresh();
      },
      error: (error) => {
        console.error('Error assigning roles:', error);
        this.showErrorNotification('Error assigning roles');
      }
    });
  }

  onConfirmRemoveRoles(): void {
    if (!this.selectedUser || !this.removeRoleForm) {
      console.error('Selected user or remove role form not found');
      return;
    }

    const selectedRoleIds = this.removeRoleForm.getSelectedRoleIds();
    if (selectedRoleIds.length === 0) {
      this.showWarningNotification('Please select at least one role');
      return;
    }

    this.userService.removeRoles(this.selectedUser.id, selectedRoleIds).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.showSuccessNotification('Roles removed successfully');
        this.closeAllPanelsAndRefresh();
      },
      error: (error) => {
        console.error('Error removing roles:', error);
        this.showErrorNotification('Error removing roles');
      }
    });
  }
}
