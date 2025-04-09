import { FieldType, FormConfig } from '../../../../shared';
import { Validators } from '@angular/forms';
import { DomainsDataService } from '../../../../shared/services/domains-data.service';
import { map } from 'rxjs/operators';

export function getDomainCreateRequest(form: any) {
  return {
    id: form?.id || null,
    name: form.name,
    applicationType: form.applicationType,
    active: form.active || false
  };
}

export function getCreateDomainFormConfig(domainsDataService: DomainsDataService): FormConfig {
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
        name: 'applicationType',
        label: 'domains.applicationType',
        value: null,
        validators: [Validators.required],
        options: domainsDataService.getApplicationTypes().pipe(
          map(types => types.map(type => ({
            value: type,
            displayValue: type
          })))
        )
      },
      {
        type: FieldType.checkbox,
        name: 'active',
        label: 'domains.active',
        value: false
      }
    ]
  };
}
