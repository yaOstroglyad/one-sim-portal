import { FieldType, FormConfig, GridSelectOption, RoleOption } from '@shared';

/**
 * Determines if a role should be disabled for user assignment/removal
 * @param role The role to check
 * @param userAccountType The account type of the user (e.g., 'ADMINISTRATOR', 'CORPORATE', etc.)
 * @param mode The operation mode ('assign' or 'remove')
 * @param currentUsername The username of the currently logged-in user
 * @returns true if the role should be disabled, false otherwise
 */
export function isRoleDisabledForAssignment(
  role: RoleOption,
  userAccountType?: string,
  mode?: 'assign' | 'remove',
  currentUsername?: string | null
): boolean {
  if (role.name === 'ADMIN') {
    // For assignment: ADMIN role can only be assigned to users with ADMINISTRATOR account type
    if (mode === 'assign') {
      return userAccountType !== 'ADMINISTRATOR';
    }

    // For removal: ADMIN role can only be removed by user with username "admin"
    if (mode === 'remove') {
      return currentUsername !== 'admin';
    }
  }
  return false;
}

export function getRoleManagementFormConfig(
  availableRoles: RoleOption[],
  mode: 'assign' | 'remove',
  selectedRoleIds: string[] = [],
  userAccountType?: string,
  currentUsername?: string | null
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.multiselectGrid,
        name: 'roleIds',
        label: mode === 'assign' ? 'users.selectRolesToAssign' : 'users.selectRolesToRemove',
        hintMessage: mode === 'assign' ? 'users.assignRolesHint' : 'users.removeRolesHint',
        value: selectedRoleIds,
        gridOptions: getRoleGridOptions(availableRoles, userAccountType, mode, currentUsername),
        gridConfig: {
          searchable: true,
          searchFields: ['displayValue', 'secondary'],
          showBulkActions: true,
          layout: 'grid',
          searchPlaceholder: 'Search Roles',
          displayFields: {
            primary: 'displayValue',
            secondary: 'secondary',
            tertiary: undefined,
            badge: undefined
          }
        }
      }
    ]
  };
}

export function getRoleGridOptions(
  roles: RoleOption[],
  userAccountType?: string,
  mode?: 'assign' | 'remove',
  currentUsername?: string | null
): GridSelectOption[] {
  if (!roles) return [];

  return roles.map(role => ({
    value: role.id,
    displayValue: role.displayName || role.name,
    secondary: role.name,
    tertiary: undefined,
    badge: undefined,
    disabled: isRoleDisabledForAssignment(role, userAccountType, mode, currentUsername)
  }));
}
