import { FieldConfig, FieldType, FormConfig } from 'src/app/shared/model';
import { Validators } from '@angular/forms';
import { ViewConfiguration } from '../view-configuration.service';

export interface RetailSettings {
  logoUrl: string;
  buttonColor: string;
  headlineText: string;
  faviconUrl: string;
}

export function getRetailSettingsRequest(form: any): RetailSettings {
  return {
    logoUrl: form.logoUrl,
    buttonColor: form.buttonColor,
    headlineText: form.headlineText,
    faviconUrl: form.faviconUrl
  };
}

export function getRetailFormConfig(data?: ViewConfiguration): FormConfig {
  return {
    fields: [
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'portal.settings.logoUrl',
        value: data?.viewConfig?.logoUrl,
        placeholder: 'portal.settings.logoUrlPlaceholder',
        validators: [Validators.required],
        className: 'form-field'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'portal.settings.faviconUrl',
        value: data?.viewConfig?.faviconUrl,
        placeholder: 'portal.settings.faviconUrlPlaceholder',
        hintMessage: 'portal.settings.faviconUrlHint',
        validators: [Validators.required],
        className: 'form-field'
      },
      {
        type: FieldType.color,
        name: 'buttonColor',
        label: 'portal.settings.primaryColor',
        value: data?.viewConfig?.buttonColor,
        validators: [Validators.required],
        className: 'form-field'
      },
      {
        type: FieldType.text,
        name: 'headlineText',
        label: 'retail.settings.headlineText',
        value: data?.viewConfig?.headlineText,
        placeholder: 'retail.settings.headlineTextPlaceholder',
        validators: [Validators.required],
        className: 'form-field'
      }
    ]
  };
}
