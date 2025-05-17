import { EditEmailTemplateIntegration, FieldType, FormConfig } from '../../../../shared';
import { Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { WhiteLabelDataService } from '../../../../shared';

export function getEmailTemplateRequest(form: any, type: string, ownerAccountId?: string): EditEmailTemplateIntegration {
  return {
    id: form?.id || null,
    templateId: form.templateId,
    subject: form.subject,
    language: form.language,
    type,
    ownerAccountId
  };
}

export function getEditEmailTemplateFormConfig(
  data: EditEmailTemplateIntegration | null,
  whiteLabelService: WhiteLabelDataService
): FormConfig {
  return {
    fields: [
      {
        type: FieldType.uuid,
        name: 'id',
        label: 'ID',
        value: data?.id,
        invisible: true
      },
      {
        type: FieldType.text,
        name: 'templateId',
        label: 'email.template.templateId',
        value: data?.templateId,
        validators: [Validators.required]
      },
      {
        type: FieldType.text,
        name: 'subject',
        label: 'email.template.subject',
        value: data?.subject,
        validators: [Validators.required]
      },
      {
        type: FieldType.select,
        name: 'language',
        label: 'email.template.language',
        value: data?.language,
        validators: [Validators.required],
        options: whiteLabelService.allEmailTemplateLanguages().pipe(
          map(languages => languages.map(lang => ({
            value: lang,
            displayValue: lang
          })))
        ),
        multiple: false
      }
    ]
  };
}
