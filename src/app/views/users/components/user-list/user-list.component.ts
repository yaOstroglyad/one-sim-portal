import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
export class UserListComponent implements OnInit, OnDestroy, AfterViewInit {
	private cdr = inject(ChangeDetectorRef);
	private notification = inject(NotificationService);
	private userService = inject(UserService);
	private roleService = inject(RoleService);
	private authService = inject(AuthService);
	private tableService = inject(UsersTableService);
	private userRoleService = inject(UserRoleService);
	private companiesDataService = inject(CompaniesDataService);

	public tableConfig$: BehaviorSubject<TableConfig>;
	public dataList$: Observable<User[]>;
	public filterForm: FormGroup;
	public companyOptions$: Observable<SearchableSelectOption[]>;
	public userTypeOptions: SearchableSelectOption[] = [];
	public smartFilterConfig: SmartFilterConfig;
	public isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	public currentUsername = this.authService.currentUsername;

	// Panel states
	showCreatePanel = false;
	showDeletePanel = false;
	showAssignRolesPanel = false;
	showRemoveRolesPanel = false;
	selectedUser: User | null = null;

	// Role management data
	availableRoles: RoleOption[] = [];
	userRoles: RoleOption[] = [];

	// Getters for button disabled state
	get canConfirmAssignRoles(): boolean {
		if (this.assignRoleForm?.loading) return false;
		return this.assignRoleForm?.hasSelectedRoles() || false;
	}

	get canConfirmRemoveRoles(): boolean {
		if (this.removeRoleForm?.loading) return false;
		return this.removeRoleForm?.hasSelectedRoles() || false;
	}

	@ViewChild('assignRoleForm') assignRoleForm: RoleManagementFormComponent;
	@ViewChild('removeRoleForm') removeRoleForm: RoleManagementFormComponent;
	@ViewChild('userRolesTemplate') userRolesTemplate: TemplateRef<any>;

	private unsubscribe$ = new Subject<void>();

	public ngOnInit(): void {
		this.initFormControls();
		this.initializeCompanyOptions();
		this.loadUserTypes();
		this.initSmartFilterConfig();
		// Load data with initial filter values
		const initialParams = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue());
		this.loadData(initialParams);
	}

	public ngAfterViewInit(): void {
		// Pass the template reference to the table service
		this.tableService.setUserRolesTemplate(this.userRolesTemplate);
	}

	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	public onPageChange({page, size}: { page: number; size: number }): void {
		const params = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue(), page, size);
		this.loadData(params);
	}

	public onColumnSelectionChanged(selectedColumns: Set<string>): void {
		this.tableService.updateColumnVisibility(selectedColumns);
	}

	private initFormControls(): void {
		this.filterForm = UsersUtils.Form.createFilterForm();
		// Mark form as dirty since we have a default value
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

	private loadUserTypes(): void {
		this.userService.getUserTypes().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(types => {
			this.userTypeOptions = UsersUtils.Type.createUserTypeOptions(types);
			this.cdr.markForCheck();
		});
	}

	// Helper method to close panels and reset state
	private closeAllPanelsAndRefresh(): void {
		this.onPanelClose();
		// Preserve current filters when refreshing data
		const currentParams = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue());
		this.loadData(currentParams);
	}

	private loadData(params: UsersFilterParams = UsersUtils.Form.createFilterParams({})): void {
		this.userService.paginatedUsers(params, params.page, params.size)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe(data => {
				const processedData = UsersUtils.Data.processUsersData(data);

				this.tableService.updateConfigData(processedData.totalPages);
				this.tableConfig$ = this.tableService.getTableConfig();
				this.dataList$ = of(processedData.content);
				this.cdr.detectChanges();

				if (this.filterForm.dirty) {
					this.showSearchResultsNotification(processedData.totalElements);
				}
			});
	}

	public createUser(): void {
		console.log('[UserList] createUser called');
		this.selectedUser = null;
		this.showCreatePanel = true;
		this.cdr.detectChanges();
	}

	public resetForm(): void {
		this.filterForm.reset();
		this.cdr.markForCheck();
	}

	public onFiltersChanged(formValues: any): void {
		// Smart filter now handles debouncing internally
		const params = UsersUtils.Form.createFilterParams(formValues);
		this.loadData(params);
	}

	onConfirmDelete(): void {
		if (!this.selectedUser?.id) return;

		this.userService.deleteUser(this.selectedUser.id).subscribe({
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
		this.showCreatePanel = false;
		this.showDeletePanel = false;
		this.showAssignRolesPanel = false;
		this.showRemoveRolesPanel = false;
		this.selectedUser = null;
		this.cdr.detectChanges();
	}

	onUserSaved(): void {
		this.showSuccessNotification('notifications.userSaved');
		this.closeAllPanelsAndRefresh();
	}

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

	canManageRoles(): boolean {
		return this.userRoleService.isAdmin();
	}

	shouldDisableRoleButton(user: User): boolean {
		return !this.canManageRoles() || (this.isSelfUser(user) && !this.canManageSelfRoles());
	}

	private isSelfUser(user: User): boolean {
		return user.loginName === this.currentUsername;
	}

	private canManageSelfRoles(): boolean {
		return this.currentUsername === 'admin';
	}

	assignRoles(user: User): void {
		if (this.isSelfUser(user) && !this.canManageSelfRoles()) {
			this.showWarningNotification('errors.cannotManageOwnRoles');
			return;
		}
		this.selectedUser = user;
		this.loadAvailableRoles();
		this.showAssignRolesPanel = true;
		this.cdr.detectChanges();
	}

	removeRoles(user: User): void {
		if (this.isSelfUser(user) && !this.canManageSelfRoles()) {
			this.showWarningNotification('errors.cannotManageOwnRoles');
			return;
		}
		this.selectedUser = user;
		this.loadUserRoles(user);
		this.showRemoveRolesPanel = true;
		this.cdr.detectChanges();
	}

	private loadAvailableRoles(): void {
		if (!this.selectedUser) return;

		this.roleService.getRoles(undefined, 0, USERS_CONFIG.ROLES_PAGE_SIZE).pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(response => {
			// Get IDs of roles that user already has
			const userRoleIds = this.selectedUser.roles.map(role => role.id);

			const filteredRoles = response.content
				.filter(role => role.name !== 'ADMIN') // Exclude ADMIN role
				.filter(role => !userRoleIds.includes(role.id)); // Exclude roles user already has

			this.availableRoles = UsersUtils.Role.convertToRoleOptions(filteredRoles);
			this.cdr.detectChanges();
		});
	}

	private loadUserRoles(user: User): void {
		// Extract roles from the user object
		this.userRoles = UsersUtils.Role.convertToRoleOptions(user.roles || []);
		this.cdr.detectChanges();
	}

	onConfirmAssignRoles(): void {
		if (!this.selectedUser || !this.assignRoleForm) {
			console.error('Selected user or assign role form not found');
			return;
		}

		const selectedRoleIds = this.assignRoleForm.getSelectedRoleIds();
		if (selectedRoleIds.length === 0) {
			this.showWarningNotification('errors.selectAtLeastOneRole');
			return;
		}

		this.userService.assignRoles(this.selectedUser.id, selectedRoleIds).pipe(
			takeUntil(this.unsubscribe$)
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
		if (!this.selectedUser || !this.removeRoleForm) {
			console.error('Selected user or remove role form not found');
			return;
		}

		const selectedRoleIds = this.removeRoleForm.getSelectedRoleIds();
		if (selectedRoleIds.length === 0) {
			this.showWarningNotification('errors.selectAtLeastOneRole');
			return;
		}

		this.userService.removeRoles(this.selectedUser.id, selectedRoleIds).pipe(
			takeUntil(this.unsubscribe$)
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
}
