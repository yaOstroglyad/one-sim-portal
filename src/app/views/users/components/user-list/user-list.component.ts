import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import {
  ADMIN_PERMISSION,
  AuthService,
  CompaniesDataService,
  DeleteConfirmationComponent,
  GenericRightPanelComponent,
  GenericTableComponent,
  HeaderComponent,
  RoleOption,
  SearchableSelectComponent,
  SearchableSelectOption,
  SmartFilterConfig,
  SmartFilterHeaderComponent,
  TableConfig,
  UserRoleService
} from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { UserService, UsersTableService } from '../../services';
import { User } from '../../models';
import { UserFormComponent } from '../user-form/user-form.component';
import { RoleManagementFormComponent } from '../role-management-form/role-management-form.component';
import { RoleService } from '../../../roles';
import { USERS_CONFIG, UsersFilterParams, UsersUtils } from './user-list.utils';

@Component({
  standalone: true,
  selector: 'app-user-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    GenericRightPanelComponent,
    UserFormComponent,
    DeleteConfirmationComponent,
    RoleManagementFormComponent,
    GenericTableComponent,
    HeaderComponent,
    SmartFilterHeaderComponent,
    SearchableSelectComponent,
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
export class UserListComponent implements OnInit, AfterViewInit {
  // Dependency injection
  private readonly destroyRef = inject(DestroyRef);
  private readonly notification = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);
  private readonly tableService = inject(UsersTableService);
  private readonly userRoleService = inject(UserRoleService);
  private readonly companiesDataService = inject(CompaniesDataService);

  // View children (signal-based)
  readonly assignRoleForm = viewChild<RoleManagementFormComponent>('assignRoleForm');
  readonly removeRoleForm = viewChild<RoleManagementFormComponent>('removeRoleForm');
  readonly userRolesTemplate = viewChild<TemplateRef<unknown>>('userRolesTemplate');

  // Panel states (signals)
  readonly showCreatePanel = signal(false);
  readonly showDeletePanel = signal(false);
  readonly showAssignRolesPanel = signal(false);
  readonly showRemoveRolesPanel = signal(false);
  readonly selectedUser = signal<User | null>(null);

  // Data signals
  readonly dataList = signal<User[]>([]);
  readonly availableRoles = signal<RoleOption[]>([]);
  readonly userRoles = signal<RoleOption[]>([]);
  readonly userTypeOptions = signal<SearchableSelectOption[]>([]);

  // Observable for generic-table compatibility
  readonly dataList$ = toObservable(this.dataList);

  // Computed properties
  readonly canConfirmAssignRoles = computed(() => {
    const form = this.assignRoleForm();
    if (form?.loading) return false;
    return form?.hasSelectedRoles() ?? false;
  });

  readonly canConfirmRemoveRoles = computed(() => {
    const form = this.removeRoleForm();
    if (form?.loading) return false;
    return form?.hasSelectedRoles() ?? false;
  });

  // Auth state (computed from service)
  readonly isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  readonly currentUsername = this.authService.currentUsername;

  // Table configuration (from service)
  tableConfig$: BehaviorSubject<TableConfig>;

  // Form and filter configuration
  filterForm: FormGroup;
  companyOptions$: Observable<SearchableSelectOption[]>;
  smartFilterConfig: SmartFilterConfig;

  // Lifecycle
  ngOnInit(): void {
    this.initFormControls();
    this.initializeCompanyOptions();
    this.loadUserTypes();
    this.initSmartFilterConfig();
    this.initTableConfig();

    const initialParams = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue());
    this.loadData(initialParams);
  }

  ngAfterViewInit(): void {
    const template = this.userRolesTemplate();
    if (template) {
      this.tableService.setUserRolesTemplate(template);
    }
  }

  // Public methods - Pagination
  onPageChange({ page, size }: { page: number; size: number }): void {
    const params = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue(), page, size);
    this.loadData(params);
  }

  onColumnSelectionChanged(selectedColumns: Set<string>): void {
    this.tableService.updateColumnVisibility(selectedColumns);
  }

  // Public methods - Filters
  onFiltersChanged(formValues: unknown): void {
    const params = UsersUtils.Form.createFilterParams(formValues);
    this.loadData(params);
  }

  resetForm(): void {
    this.filterForm.reset();
  }

  // Public methods - User actions
  createUser(): void {
    this.selectedUser.set(null);
    this.showCreatePanel.set(true);
  }

  onUserSaved(): void {
    this.showSuccessNotification('notifications.userSaved');
    this.closeAllPanelsAndRefresh();
  }

  onConfirmDelete(): void {
    const user = this.selectedUser();
    if (!user?.id) return;

    this.userService.deleteUser(user.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.showSuccessNotification('notifications.userDeleted');
        this.closeAllPanelsAndRefresh();
      },
      error: () => {
        this.showErrorNotification('errors.userDeleteFailed');
      }
    });
  }

  onPanelClose(): void {
    this.showCreatePanel.set(false);
    this.showDeletePanel.set(false);
    this.showAssignRolesPanel.set(false);
    this.showRemoveRolesPanel.set(false);
    this.selectedUser.set(null);
  }

  // Public methods - Role management
  canManageRoles(): boolean {
    return this.userRoleService.isAdmin();
  }

  shouldDisableRoleButton(user: User): boolean {
    return !this.canManageRoles() || (this.isSelfUser(user) && !this.canManageSelfRoles());
  }

  assignRoles(user: User): void {
    if (this.isSelfUser(user) && !this.canManageSelfRoles()) {
      this.showWarningNotification('errors.cannotManageOwnRoles');
      return;
    }
    this.selectedUser.set(user);
    this.loadAvailableRoles();
    this.showAssignRolesPanel.set(true);
  }

  removeRoles(user: User): void {
    if (this.isSelfUser(user) && !this.canManageSelfRoles()) {
      this.showWarningNotification('errors.cannotManageOwnRoles');
      return;
    }
    this.selectedUser.set(user);
    this.loadUserRoles(user);
    this.showRemoveRolesPanel.set(true);
  }

  onConfirmAssignRoles(): void {
    const user = this.selectedUser();
    const form = this.assignRoleForm();

    if (!user || !form) {
      console.error('Selected user or assign role form not found');
      return;
    }

    const selectedRoleIds = form.getSelectedRoleIds();
    if (selectedRoleIds.length === 0) {
      this.showWarningNotification('errors.selectAtLeastOneRole');
      return;
    }

    this.userService.assignRoles(user.id, selectedRoleIds).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.showSuccessNotification('notifications.rolesAssigned');
        this.closeAllPanelsAndRefresh();
      },
      error: () => {
        this.showErrorNotification('errors.rolesAssignFailed');
      }
    });
  }

  onConfirmRemoveRoles(): void {
    const user = this.selectedUser();
    const form = this.removeRoleForm();

    if (!user || !form) {
      console.error('Selected user or remove role form not found');
      return;
    }

    const selectedRoleIds = form.getSelectedRoleIds();
    if (selectedRoleIds.length === 0) {
      this.showWarningNotification('errors.selectAtLeastOneRole');
      return;
    }

    this.userService.removeRoles(user.id, selectedRoleIds).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.showSuccessNotification('notifications.rolesRemoved');
        this.closeAllPanelsAndRefresh();
      },
      error: () => {
        this.showErrorNotification('errors.rolesRemoveFailed');
      }
    });
  }

  // Private methods - Initialization
  private initFormControls(): void {
    this.filterForm = UsersUtils.Form.createFilterForm();
    this.filterForm.markAsDirty();
  }

  private initializeCompanyOptions(): void {
    if (this.isAdmin) {
      this.companyOptions$ = UsersUtils.Company.createCompanyOptions(this.companiesDataService);
    }
  }

  private initSmartFilterConfig(): void {
    this.smartFilterConfig = UsersUtils.SmartFilter.create(this.companiesDataService, this.isAdmin);
  }

  private initTableConfig(): void {
    this.tableConfig$ = this.tableService.getTableConfig();
  }

  private loadUserTypes(): void {
    this.userService.getUserTypes().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(types => {
      this.userTypeOptions.set(UsersUtils.Type.createUserTypeOptions(types));
    });
  }

  // Private methods - Data loading
  private loadData(params: UsersFilterParams = UsersUtils.Form.createFilterParams({})): void {
    this.userService.paginatedUsers(params, params.page, params.size).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => {
      const processedData = UsersUtils.Data.processUsersData(data);

      this.tableService.updateConfigData(processedData.totalPages);
      this.dataList.set(processedData.content);

      if (this.filterForm.dirty) {
        this.showSearchResultsNotification(processedData.totalElements);
      }
    });
  }

  private loadAvailableRoles(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.roleService.getRoles(undefined, 0, USERS_CONFIG.ROLES_PAGE_SIZE).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      const userRoleIds = user.roles?.map(role => role.id) ?? [];

      const filteredRoles = response.content
        .filter(role => role.name !== 'ADMIN')
        .filter(role => !userRoleIds.includes(role.id));

      this.availableRoles.set(UsersUtils.Role.convertToRoleOptions(filteredRoles));
    });
  }

  private loadUserRoles(user: User): void {
    this.userRoles.set(UsersUtils.Role.convertToRoleOptions(user.roles ?? []));
  }

  // Private methods - Helpers
  private closeAllPanelsAndRefresh(): void {
    this.onPanelClose();
    const currentParams = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue());
    this.loadData(currentParams);
  }

  private isSelfUser(user: User): boolean {
    return user.loginName === this.currentUsername;
  }

  private canManageSelfRoles(): boolean {
    return this.currentUsername === 'admin';
  }

  // Private methods - Notifications
  private showSuccessNotification(messageKey: string): void {
    UsersUtils.Notification.showSuccessNotification(this.notification, messageKey);
  }

  private showErrorNotification(messageKey: string): void {
    UsersUtils.Notification.showErrorNotification(this.notification, messageKey);
  }

  private showWarningNotification(messageKey: string): void {
    UsersUtils.Notification.showWarningNotification(this.notification, messageKey);
  }

  private showSearchResultsNotification(count: number): void {
    UsersUtils.Notification.showSearchResultsNotification(this.notification, count);
  }
}
