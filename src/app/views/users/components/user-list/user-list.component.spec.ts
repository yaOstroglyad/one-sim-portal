import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject, firstValueFrom } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { configureTestBed } from '@shared/utils/testing';
import { AuthService, CompaniesDataService, TableConfig, UserRoleService } from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { UserService, UsersTableService } from '../../services';
import { User } from '../../models';
import { RoleService } from '../../../roles';

describe('UserListComponent', () => {
    let component: UserListComponent;
    let fixture: ComponentFixture<UserListComponent>;

    // Mock services
    let mockUserService: Partial<UserService>;
    let mockRoleService: Partial<RoleService>;
    let mockAuthService: Partial<AuthService>;
    let mockTableService: Partial<UsersTableService>;
    let mockUserRoleService: Partial<UserRoleService>;
    let mockCompaniesDataService: Partial<CompaniesDataService>;
    let mockNotificationService: Partial<NotificationService>;

    const mockTableConfig: TableConfig = {
        columns: [
            { key: 'loginName', header: 'username', visible: true },
            { key: 'email', header: 'email', visible: true }
        ],
        pagination: { enabled: true, serverSide: true, totalPages: 5 }
    };

    const mockUsers: User[] = [
        {
            id: '1',
            name: 'Test User 1',
            loginName: 'testuser1',
            email: 'test1@example.com',
            accountInfo: { id: 'acc1', name: 'Account 1', type: 'CORPORATE', externalId: 'ext1' },
            roles: [{ id: 'role1', name: 'USER', displayName: 'User' }]
        },
        {
            id: '2',
            name: 'Test User 2',
            loginName: 'testuser2',
            email: 'test2@example.com',
            accountInfo: { id: 'acc2', name: 'Account 2', type: 'PRIVATE', externalId: 'ext2' },
            roles: []
        }
    ];

    const mockPaginatedResponse = {
        content: mockUsers,
        totalPages: 5,
        totalElements: 10
    };

    beforeEach(async () => {
        // Create mock services
        mockUserService = {
            paginatedUsers: vi.fn().mockReturnValue(of(mockPaginatedResponse)),
            getUserTypes: vi.fn().mockReturnValue(of(['CORPORATE', 'PRIVATE'])),
            deleteUser: vi.fn().mockReturnValue(of(undefined)),
            assignRoles: vi.fn().mockReturnValue(of(undefined)),
            removeRoles: vi.fn().mockReturnValue(of(undefined))
        };

        mockRoleService = {
            getRoles: vi.fn().mockReturnValue(of({
                content: [
                    { id: 'role1', name: 'USER', displayName: 'User' },
                    { id: 'role2', name: 'MANAGER', displayName: 'Manager' }
                ]
            }))
        };

        mockAuthService = {
            hasPermission: vi.fn().mockReturnValue(false),
            currentUsername: 'testuser'
        };

        mockTableService = {
            getTableConfig: vi.fn().mockReturnValue(new BehaviorSubject(mockTableConfig)),
            updateConfigData: vi.fn(),
            updateColumnVisibility: vi.fn(),
            setUserRolesTemplate: vi.fn()
        };

        mockUserRoleService = {
            isAdmin: vi.fn().mockReturnValue(true)
        };

        mockCompaniesDataService = {
            list: vi.fn().mockReturnValue(of([]))
        };

        mockNotificationService = {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn()
        };

        await configureTestBed({
            imports: [UserListComponent],
            providers: [
                { provide: UserService, useValue: mockUserService },
                { provide: RoleService, useValue: mockRoleService },
                { provide: AuthService, useValue: mockAuthService },
                { provide: UsersTableService, useValue: mockTableService },
                { provide: UserRoleService, useValue: mockUserRoleService },
                { provide: CompaniesDataService, useValue: mockCompaniesDataService },
                { provide: NotificationService, useValue: mockNotificationService }
            ]
        });

        fixture = TestBed.createComponent(UserListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initialization', () => {
        /**
         * CRITICAL: Table config must be initialized BEFORE data loading completes.
         *
         * Why this order matters:
         * 1. The template binds to tableConfig$ immediately on render
         * 2. If tableConfig$ is undefined, generic-table cannot initialize
         * 3. Data loading is async (HTTP) - config must exist before it completes
         * 4. Wrong order causes infinite loading state (config undefined when data arrives)
         *
         * Correct order: initTableConfig() → loadData()
         * Wrong order:   loadData() → tableConfig$ set in subscribe (too late!)
         */
        it('should initialize tableConfig$ synchronously in ngOnInit (before async data loads)', () => {
            // Act - call ngOnInit but do NOT await async operations
            component.ngOnInit();

            // Assert - tableConfig$ must be defined IMMEDIATELY (synchronously)
            // If this fails, it means tableConfig$ is set inside async callback (wrong!)
            expect(component.tableConfig$).toBeDefined();
            expect(component.tableConfig$.getValue()).toBeDefined();
            expect(component.tableConfig$.getValue().columns).toBeDefined();
        });

        it('should have default signal values', () => {
            // Assert
            expect(component.showCreatePanel()).toBe(false);
            expect(component.showDeletePanel()).toBe(false);
            expect(component.showAssignRolesPanel()).toBe(false);
            expect(component.showRemoveRolesPanel()).toBe(false);
            expect(component.selectedUser()).toBeNull();
            expect(component.dataList()).toEqual([]);
            expect(component.availableRoles()).toEqual([]);
            expect(component.userRoles()).toEqual([]);
        });

        it('should load data on init', async () => {
            // Act
            component.ngOnInit();
            await fixture.whenStable();

            // Assert
            expect(mockUserService.paginatedUsers).toHaveBeenCalled();
            expect(mockUserService.getUserTypes).toHaveBeenCalled();
            expect(component.dataList()).toEqual(mockUsers);
        });

        it('should load user types on init', async () => {
            // Act
            component.ngOnInit();
            await fixture.whenStable();

            // Assert
            expect(component.userTypeOptions().length).toBe(2);
            expect(component.userTypeOptions()[0].value).toBe('CORPORATE');
        });

        it('should initialize filter form with default type', () => {
            // Act
            component.ngOnInit();

            // Assert
            expect(component.filterForm).toBeDefined();
            expect(component.filterForm.get('type')?.value).toBe('CORPORATE');
        });
    });

    describe('panel management', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
        });

        it('should open create panel', () => {
            // Act
            component.createUser();

            // Assert
            expect(component.showCreatePanel()).toBe(true);
            expect(component.selectedUser()).toBeNull();
        });

        it('should close all panels', () => {
            // Arrange
            component.showCreatePanel.set(true);
            component.showDeletePanel.set(true);
            component.selectedUser.set(mockUsers[0]);

            // Act
            component.onPanelClose();

            // Assert
            expect(component.showCreatePanel()).toBe(false);
            expect(component.showDeletePanel()).toBe(false);
            expect(component.showAssignRolesPanel()).toBe(false);
            expect(component.showRemoveRolesPanel()).toBe(false);
            expect(component.selectedUser()).toBeNull();
        });

        it('should open assign roles panel', async () => {
            // Act
            component.assignRoles(mockUsers[0]);
            await fixture.whenStable();

            // Assert
            expect(component.showAssignRolesPanel()).toBe(true);
            expect(component.selectedUser()).toEqual(mockUsers[0]);
            expect(mockRoleService.getRoles).toHaveBeenCalled();
        });

        it('should open remove roles panel', () => {
            // Act
            component.removeRoles(mockUsers[0]);

            // Assert
            expect(component.showRemoveRolesPanel()).toBe(true);
            expect(component.selectedUser()).toEqual(mockUsers[0]);
            expect(component.userRoles().length).toBe(1);
        });
    });

    describe('user actions', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
        });

        it('should delete user on confirm', async () => {
            // Arrange
            component.selectedUser.set(mockUsers[0]);

            // Act
            component.onConfirmDelete();
            await fixture.whenStable();

            // Assert
            expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
            expect(mockNotificationService.success).toHaveBeenCalledWith('notifications.userDeleted');
        });

        it('should not delete if no user selected', () => {
            // Arrange
            component.selectedUser.set(null);

            // Act
            component.onConfirmDelete();

            // Assert
            expect(mockUserService.deleteUser).not.toHaveBeenCalled();
        });

        it('should show success notification on user saved', async () => {
            // Act
            component.onUserSaved();
            await fixture.whenStable();

            // Assert
            expect(mockNotificationService.success).toHaveBeenCalledWith('notifications.userSaved');
        });

        it('should show error notification on delete failure', async () => {
            // Arrange
            mockUserService.deleteUser = vi.fn().mockReturnValue(new (await import('rxjs')).Observable(subscriber => subscriber.error(new Error('Delete failed'))));
            component.selectedUser.set(mockUsers[0]);

            // Act
            component.onConfirmDelete();
            await fixture.whenStable();

            // Assert
            expect(mockNotificationService.error).toHaveBeenCalledWith('errors.userDeleteFailed');
        });
    });

    describe('pagination', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
            vi.clearAllMocks();
        });

        it('should load data on page change', async () => {
            // Act
            component.onPageChange({ page: 2, size: 20 });
            await fixture.whenStable();

            // Assert
            expect(mockUserService.paginatedUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 2, size: 20 }), 2, 20);
        });
    });

    describe('filters', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
            vi.clearAllMocks();
        });

        it('should load data on filter change', async () => {
            // Act
            component.onFiltersChanged({ searchQuery: 'test', type: 'CORPORATE' });
            await fixture.whenStable();

            // Assert
            expect(mockUserService.paginatedUsers).toHaveBeenCalledWith(expect.objectContaining({ searchQuery: 'test', type: 'CORPORATE' }), 0, 15);
        });

        it('should reset form', () => {
            // Arrange
            component.filterForm.patchValue({ searchQuery: 'test' });

            // Act
            component.resetForm();

            // Assert
            expect(component.filterForm.get('searchQuery')?.value).toBeNull();
        });
    });

    describe('role management permissions', () => {
        it('should return true for canManageRoles when user is admin', () => {
            // Arrange
            mockUserRoleService.isAdmin = vi.fn().mockReturnValue(true);

            // Assert
            expect(component.canManageRoles()).toBe(true);
        });

        it('should return false for canManageRoles when user is not admin', () => {
            // Arrange
            mockUserRoleService.isAdmin = vi.fn().mockReturnValue(false);

            // Assert
            expect(component.canManageRoles()).toBe(false);
        });

        it('should disable role button for self user when not admin username', () => {
            // Arrange
            mockUserRoleService.isAdmin = vi.fn().mockReturnValue(true);
            const selfUser: User = {
                ...mockUsers[0],
                loginName: 'testuser' // matches currentUsername
            };

            // Assert
            expect(component.shouldDisableRoleButton(selfUser)).toBe(true);
        });

        it('should not disable role button for other users', () => {
            // Arrange
            mockUserRoleService.isAdmin = vi.fn().mockReturnValue(true);

            // Assert
            expect(component.shouldDisableRoleButton(mockUsers[0])).toBe(false);
        });

        it('should disable role button when user cannot manage roles', () => {
            // Arrange
            mockUserRoleService.isAdmin = vi.fn().mockReturnValue(false);

            // Assert
            expect(component.shouldDisableRoleButton(mockUsers[0])).toBe(true);
        });
    });

    describe('role assignment', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
        });

        it('should show warning when trying to manage own roles', () => {
            // Arrange
            const selfUser: User = {
                ...mockUsers[0],
                loginName: 'testuser'
            };

            // Act
            component.assignRoles(selfUser);

            // Assert
            expect(mockNotificationService.warning).toHaveBeenCalledWith('errors.cannotManageOwnRoles');
            expect(component.showAssignRolesPanel()).toBe(false);
        });

        it('should filter out ADMIN role and already assigned roles', async () => {
            // Arrange
            mockRoleService.getRoles = vi.fn().mockReturnValue(of({
                content: [
                    { id: 'role1', name: 'USER', displayName: 'User' },
                    { id: 'role2', name: 'ADMIN', displayName: 'Admin' },
                    { id: 'role3', name: 'MANAGER', displayName: 'Manager' }
                ]
            }));

            // Act
            component.assignRoles(mockUsers[0]); // User already has role1
            await fixture.whenStable();

            // Assert
            const roles = component.availableRoles();
            expect(roles.length).toBe(1);
            expect(roles[0].name).toBe('MANAGER');
        });

        it('should show warning when trying to remove own roles', () => {
            // Arrange
            const selfUser: User = {
                ...mockUsers[0],
                loginName: 'testuser'
            };

            // Act
            component.removeRoles(selfUser);

            // Assert
            expect(mockNotificationService.warning).toHaveBeenCalledWith('errors.cannotManageOwnRoles');
            expect(component.showRemoveRolesPanel()).toBe(false);
        });
    });

    describe('column selection', () => {
        it('should handle column selection change without error', async () => {
            // Arrange
            component.ngOnInit();
            await fixture.whenStable();
            const selectedColumns = new Set(['loginName', 'email']);

            // Act & Assert
            expect(() => component.onColumnSelectionChanged(selectedColumns)).not.toThrow();
        });
    });

    describe('computed properties', () => {
        it('should compute canConfirmAssignRoles as false when no form', () => {
            // Assert
            expect(component.canConfirmAssignRoles()).toBe(false);
        });

        it('should compute canConfirmRemoveRoles as false when no form', () => {
            // Assert
            expect(component.canConfirmRemoveRoles()).toBe(false);
        });
    });

    describe('dataList$ observable', () => {
        it('should emit values from dataList signal', async () => {
            // Arrange
            component.ngOnInit();
            await fixture.whenStable();

            // Act
            const data = await firstValueFrom(component.dataList$);

            // Assert
            expect(data).toEqual(mockUsers);
        });
    });

    describe('admin features', () => {
        it('should not initialize company options for non-admin', async () => {
            // Arrange
            mockAuthService.hasPermission = vi.fn().mockReturnValue(false);

            // Act
            component.ngOnInit();
            await fixture.whenStable();

            // Assert
            expect(component.companyOptions$).toBeUndefined();
        });
    });

    describe('role confirmation actions', () => {
        beforeEach(async () => {
            component.ngOnInit();
            await fixture.whenStable();
        });

        it('should not assign roles when no user selected', () => {
            // Arrange
            component.selectedUser.set(null);

            // Act
            component.onConfirmAssignRoles();

            // Assert
            expect(mockUserService.assignRoles).not.toHaveBeenCalled();
        });

        it('should not remove roles when no user selected', () => {
            // Arrange
            component.selectedUser.set(null);

            // Act
            component.onConfirmRemoveRoles();

            // Assert
            expect(mockUserService.removeRoles).not.toHaveBeenCalled();
        });
    });
});
