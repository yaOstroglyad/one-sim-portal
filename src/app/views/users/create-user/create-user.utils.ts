import { FieldType, FormConfig } from '../../../shared';
import { Validators } from '@angular/forms';

export function getCreateUserFormConfig(): FormConfig {
  return {
    fields: [
      {
        type: FieldType.email,
        name: 'email',
        label: 'Email',
        placeholder: 'Enter the user\'s email',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'username',
        label: 'Username',
        placeholder: 'Enter the username',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'firstName',
        label: 'First Name',
        placeholder: 'Enter the first name',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter the last name',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'accountId',
        label: 'Account ID',
        placeholder: 'Enter the account ID',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'accountType',
        label: 'Account Type',
        placeholder: 'Enter the account type',
        validators: [Validators.required]
      }
    ]
  };
}
