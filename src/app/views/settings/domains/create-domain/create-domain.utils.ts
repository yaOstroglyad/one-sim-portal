import { FieldType, FormConfig } from '../../../../shared';
import { Validators } from '@angular/forms';
import { Domain } from '../../../../shared/model/domain';

export function getDomainCreateRequest(form: any) {
  return {
    id: form?.id || null,
    name: form.name,
    applicationType: form.applicationType,
    active: form.active || false
  };
}

export function getCreateDomainFormConfig(data: Domain): FormConfig {
  return {
    fields: [
      {
        type: FieldType.uuid,
        name: 'id',
        label: 'ID',
        value: data?.id || null,
        invisible: true
      },
      {
        type: FieldType.text,
        name: 'name',
        label: 'domains.name',
        value: data?.name || '',
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'applicationType',
        label: 'domains.applicationType',
        value: data?.applicationType || '',
        validators: [Validators.required]
      },
      {
        type: FieldType.checkbox,
        name: 'active',
        label: 'domains.active',
        value: data?.active || false
      }
    ]
  };
}
