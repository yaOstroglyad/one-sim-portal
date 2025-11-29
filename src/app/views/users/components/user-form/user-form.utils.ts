import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormConfig, FieldType, SelectOption } from '@shared';
import { User } from '../../models';

/**
 * Custom validator to check if password and confirmPassword match
 */
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  if (confirmPassword.value && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  // Clear the error if passwords match
  if (confirmPassword.errors?.['passwordMismatch']) {
    delete confirmPassword.errors['passwordMismatch'];
    if (Object.keys(confirmPassword.errors).length === 0) {
      confirmPassword.setErrors(null);
    }
  }

  return null;
}

export function getUserFormConfig(
  user: User | null = null,
  isEditMode: boolean = false,
  companyOptions: Observable<SelectOption[]>,
  emailAsyncValidator?: (control: any) => Observable<{ [key: string]: boolean } | null>
): FormConfig {
  const baseFields = [
    {
      type: FieldType.select,
      name: 'accountId',
      label: 'users.company',
      placeholder: 'users.companyPlaceholder',
      value: user?.accountInfo?.id || '',
      disabled: isEditMode,
      validators: [
        Validators.required
      ],
      options: companyOptions,
      hintMessage: !isEditMode ? 'users.companyHint' : undefined
    },
    {
      type: FieldType.text,
      name: 'loginName',
      label: 'users.username',
      placeholder: 'users.usernamePlaceholder',
      value: user?.loginName || '',
      disabled: isEditMode,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_.-]+$/)
      ],
      hintMessage: !isEditMode ? 'users.usernameHint' : undefined
    },
    {
      type: FieldType.text,
      name: 'name',
      label: 'users.name',
      placeholder: 'users.firstNamePlaceholder',
      value: user?.name || '',
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    },
    {
      type: FieldType.email,
      name: 'email',
      label: 'users.email',
      placeholder: 'users.emailPlaceholder',
      value: user?.email || '',
      validators: [
        Validators.required,
        Validators.email
      ],
      asyncValidators: emailAsyncValidator ? [emailAsyncValidator] : undefined,
      hintMessage: 'users.emailHint'
    },
    {
      type: FieldType.text,
      name: 'phone',
      label: 'createUser.phone',
      placeholder: 'createUser.phonePlaceholder',
      value: user?.phone || '',
      validators: [
        Validators.pattern(/^\+?[1-9]\d{1,14}$/)
      ],
      hintMessage: undefined
    }
  ];

  // Add password fields only for create mode
  if (!isEditMode) {
    baseFields.push(
      {
        type: FieldType.password,
        name: 'password',
        label: 'users.password',
        placeholder: 'users.passwordPlaceholder',
        value: '',
        disabled: false,
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(128)
        ],
        hintMessage: 'users.passwordHint'
      } as any,
      {
        type: FieldType.password,
        name: 'confirmPassword',
        label: 'users.confirmPassword',
        placeholder: 'users.confirmPasswordPlaceholder',
        value: '',
        disabled: false,
        validators: [
          Validators.required
        ],
        hintMessage: undefined
      } as any
    );
  }

  return {
    fields: baseFields,
    formValidators: !isEditMode ? [passwordMatchValidator] : undefined
  };
}
