import { FieldType, FormConfig, AccountsDataService, WhiteLabelDataService } from '../../../../shared';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';

export function getDomainCreateRequest(form: any) {
  return {
    id: form?.id || null,
    name: form.name?.trim(),
    ownerAccountId: form.ownerAccountId,
    applicationType: form.applicationType
  };
}

export function getCreateDomainFormConfig(
  accountsDataService: AccountsDataService,
  whiteLabelDataService: WhiteLabelDataService
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.uuid,
        name: 'id',
        label: 'ID',
        value: null,
        invisible: true
      },
      {
        type: FieldType.text,
        name: 'name',
        label: 'domains.name',
        value: null,
        validators: [Validators.required]
      },
      {
        type: FieldType.select,
        name: 'ownerAccountId',
        label: 'domains.ownerAccount',
        value: null,
        validators: [Validators.required],
        options: accountsDataService.ownerAccounts().pipe(
          map(accounts => accounts.map(account => ({
            value: account.id,
            displayValue: account.name
          })))
        )
      },
      {
        type: FieldType.select,
        name: 'applicationType',
        label: 'domains.applicationType',
        value: null,
        validators: [Validators.required],
        options: whiteLabelDataService.applicationTypes().pipe(
          map(types => types.map(type => ({
            value: type,
            displayValue: type
          })))
        )
      }
    ]
  };
}
