import { FieldType, FormConfig } from '../../../shared';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export function getCreateUserFormConfig(translate: TranslateService): FormConfig {
  return {
    fields: [
      {
        type: FieldType.email,
        name: 'email',
        label: translate.instant('createUser.email'),
        placeholder: translate.instant('createUser.emailPlaceholder'),
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'username',
        label: translate.instant('createUser.username'),
        placeholder: translate.instant('createUser.usernamePlaceholder'),
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'firstName',
        label: translate.instant('createUser.firstName'),
        placeholder: translate.instant('createUser.firstNamePlaceholder'),
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'lastName',
        label: translate.instant('createUser.lastName'),
        placeholder: translate.instant('createUser.lastNamePlaceholder'),
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'accountId',
        label: translate.instant('createUser.accountId'),
        placeholder: translate.instant('createUser.accountIdPlaceholder'),
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'accountType',
        label: translate.instant('createUser.accountType'),
        placeholder: translate.instant('createUser.accountTypePlaceholder'),
        validators: [Validators.required]
      }
    ]
  };
}
