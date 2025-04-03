import { FieldType, FormConfig } from 'src/app/shared';

export interface PortalSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export function getPortalSettingsRequest(form: any): PortalSettings {
  return {
    primaryColor: form.primaryColor,
    secondaryColor: form.secondaryColor,
    logoUrl: form.logoUrl,
    faviconUrl: form.faviconUrl
  };
}

export function getPortalFormConfig(data?: PortalSettings): FormConfig {
  return {
    fields: [
      {
        type: FieldType.color,
        name: 'primaryColor',
        label: 'portal.settings.primaryColor',
        value: data?.primaryColor || '#f89c2e'
      },
      {
        type: FieldType.color,
        name: 'secondaryColor',
        label: 'portal.settings.secondaryColor',
        value: data?.secondaryColor || '#fef6f0'
      },
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'portal.settings.logoUrl',
        value: data?.logoUrl || 'assets/img/brand/1esim-logo.png',
        placeholder: 'portal.settings.logoUrlPlaceholder'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'portal.settings.faviconUrl',
        value: data?.faviconUrl || 'assets/img/brand/1esim-logo-small.png',
        placeholder: 'portal.settings.faviconUrlPlaceholder',
        hintMessage: 'portal.settings.faviconUrlHint'
      }
    ]
  };
} 