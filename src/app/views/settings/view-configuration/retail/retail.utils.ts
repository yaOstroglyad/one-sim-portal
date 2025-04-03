import { FieldConfig, FieldType, FormConfig } from 'src/app/shared/model';
import { Validators } from '@angular/forms';

export interface RetailSettings {
  logoUrl: string;
  buttonColor: string;
  headlineText: string;
}

export function getRetailSettingsRequest(form: any): RetailSettings {
  return {
    logoUrl: form.logoUrl,
    buttonColor: form.buttonColor,
    headlineText: form.headlineText
  };
}

export function getRetailFormConfig(data?: RetailSettings): FormConfig {
  return {
    fields: [
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'portal.settings.logoUrl',
        value: data?.logoUrl || 'assets/img/brand/1esim-logo.png',
        placeholder: 'portal.settings.logoUrlPlaceholder',
        validators: [Validators.required],
        className: 'form-field'
      },
      {
        type: FieldType.color,
        name: 'buttonColor',
        label: 'portal.settings.primaryColor',
        value: data?.buttonColor || '#f89c2e',
        validators: [Validators.required],
        className: 'form-field'
      },
      {
        type: FieldType.text,
        name: 'headlineText',
        label: 'retail.settings.headlineText',
        value: data?.headlineText || 'Welcome to Our Retail Portal',
        placeholder: 'retail.settings.headlineTextPlaceholder',
        validators: [Validators.required],
        className: 'form-field'
      }
    ]
  };
} 