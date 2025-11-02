import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormConfig, FieldType, SelectOption } from '@shared';
import { User } from '../../models';

export function getUserFormConfig(
  user: User | null = null,
  isEditMode: boolean = false,
  companyOptions: Observable<SelectOption[]>,
  emailAsyncValidator?: (control: any) => Observable<{ [key: string]: boolean } | null>
): FormConfig {
  return {
    fields: [
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
    ]
  };
}
