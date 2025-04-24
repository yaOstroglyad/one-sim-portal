import { FieldType, FormConfig } from '../../../../shared';
import { Validators } from '@angular/forms';
import { DomainsDataService } from '../../../../shared/services/domains-data.service';
import { map } from 'rxjs/operators';
import { AccountsDataService } from '../../../../shared/services/accounts-data.service';
import { WhiteLabelDataService } from '../../../../shared/services/white-label-data.service';

export function getDomainCreateRequest(form: any) {
  return {
    id: form?.id || null,
    name: form.name,
    ownerAccountId: form.ownerAccountId,
    applicationType: form.applicationType
  };
}

export function getCreateDomainFormConfig(
  domainsDataService: DomainsDataService,
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
