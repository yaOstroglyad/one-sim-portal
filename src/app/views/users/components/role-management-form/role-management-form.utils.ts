import { FieldType, FormConfig, GridSelectOption } from '@shared';
import { RoleOption } from './role-management-form.component';

/**
 * Determines if a role should be disabled for user assignment/removal
 * @param role The role to check
 * @returns true if the role should be disabled, false otherwise
 */
export function isRoleDisabledForAssignment(role: RoleOption): boolean {
  // Admin role cannot be assigned/removed through UI
  return role.name === 'ADMIN';
}

export function getRoleManagementFormConfig(
  availableRoles: RoleOption[],
  mode: 'assign' | 'remove',
  selectedRoleIds: string[] = []
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.multiselectGrid,
        name: 'roleIds',
        label: mode === 'assign' ? 'users.selectRolesToAssign' : 'users.selectRolesToRemove',
        hintMessage: mode === 'assign' ? 'users.assignRolesHint' : 'users.removeRolesHint',
        value: selectedRoleIds,
        gridOptions: getRoleGridOptions(availableRoles),
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

export function getRoleGridOptions(roles: RoleOption[]): GridSelectOption[] {
  if (!roles) return [];

  return roles.map(role => ({
    value: role.id,
    displayValue: role.displayName || role.name,
    secondary: role.name,
    tertiary: undefined,
    badge: undefined,
    disabled: isRoleDisabledForAssignment(role)
  }));
}
