import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { FormConfig, FieldConfig, FieldType, SelectOption } from '../../../../shared';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../../models';
import { RoleService } from '../../services';

/**
 * Creates form configuration for role form
 */
export function getRoleFormConfig(role: Role | null = null, isEditMode: boolean = false, roleService?: RoleService): FormConfig {
  const fields: FieldConfig[] = [
    {
      type: FieldType.text,
      name: 'name',
      label: 'roles.name',
      placeholder: 'roles.namePlaceholder',
      value: role?.name || '',
      disabled: isEditMode,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ],
      hintMessage: !isEditMode ? 'roles.nameHint' : undefined
    },
    {
      type: FieldType.text,
      name: 'displayName',
      label: 'roles.displayName',
      placeholder: 'roles.displayNamePlaceholder',
      value: role?.displayName || '',
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    },
    {
      type: FieldType.select,
      name: 'category',
      label: 'roles.category',
      placeholder: 'roles.categoryPlaceholder',
      value: role?.category || '',
      disabled: isEditMode,
      validators: [
        Validators.required
      ],
      options: roleService ? roleService.getCategories().pipe(
        map((categories: string[]) =>
          categories.map(category => ({
            value: category,
            displayValue: category
          } as SelectOption))
        )
      ) : undefined,
      hintMessage: !isEditMode ? 'roles.categoryHint' : undefined
    },
    {
      type: FieldType.textarea,
      name: 'description',
      label: 'roles.description',
      placeholder: 'roles.descriptionPlaceholder',
      value: role?.description || '',
      validators: [
        Validators.required,
        Validators.maxLength(500)
      ]
    }
  ];

  return {
    fields
  };
}

/**
 * Transforms form values to create request
 */
export function getRoleCreateRequest(formValue: any): CreateRoleRequest {
  return {
    name: formValue.name,
    displayName: formValue.displayName,
    description: formValue.description,
    category: formValue.category
  };
}

/**
 * Transforms form values to update request
 */
export function getRoleUpdateRequest(formValue: any): UpdateRoleRequest {
  return {
    displayName: formValue.displayName,
    description: formValue.description
  };
}

