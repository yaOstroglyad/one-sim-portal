import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
	inject,
	TemplateRef,
	AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ButtonDirective, FormControlDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';

import {
	GenericRightPanelComponent,
	SmartFilterHeaderComponent,
	SmartFilterConfig,
	SearchableSelectComponent,
	SearchableSelectOption,
	CompaniesDataService,
	AuthService,
	ADMIN_PERMISSION
} from '../../../../shared';
import { GenericTableComponent, HeaderComponent, TableConfig, DeleteConfirmationComponent } from '../../../../shared';
import { UserService, UsersTableService } from '../../services';
import { User } from '../../models';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserRoleService } from '../../../../shared';
import { RoleManagementFormComponent, RoleOption } from '../role-management-form/role-management-form.component';
import { RoleService } from '../../../roles';
import { UsersUtils, UsersFilterParams } from './user-list.utils';

// Constants
const ROLES_PAGE_SIZE = 100;

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
	private snackBar = inject(MatSnackBar);
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
		this.initializeCompanyOptions();
		this.loadUserTypes();
		this.initSmartFilterConfig();
		// Load data with initial filter values
		const initialParams = UsersUtils.Form.createFilterParams(this.filterForm.getRawValue());
		this.loadData(initialParams);
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

	private setupFilters(): void {
		// Smart filter handles its own application logic
		// We only need to listen for explicit filter events from the smart filter component
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

	// Helper methods for notifications
	private showSuccessNotification(message: string, duration = UsersUtils.CONFIG.NOTIFICATION_DURATION): void {
		UsersUtils.Notification.showSuccessNotification(this.snackBar, message, duration);
	}

	private showErrorNotification(message: string, duration = UsersUtils.CONFIG.NOTIFICATION_DURATION): void {
		UsersUtils.Notification.showErrorNotification(this.snackBar, message, duration);
	}

	private showWarningNotification(message: string, duration = UsersUtils.CONFIG.NOTIFICATION_DURATION): void {
		UsersUtils.Notification.showWarningNotification(this.snackBar, message, duration);
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
					UsersUtils.Notification.showSearchResultsNotification(
						this.snackBar,
						processedData.totalElements
					);
				}
			});
	}

	public createUser(): void {
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

	canManageRoles(): boolean {
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
