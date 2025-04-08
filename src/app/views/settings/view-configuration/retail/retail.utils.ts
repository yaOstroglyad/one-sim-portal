import { FieldType, FormConfig } from 'src/app/shared';
import { ViewConfiguration } from '../view-configuration.service';
import { DomainsService } from 'src/app/shared/services/domains.service';

export interface RetailSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  headlineText: string;
  domains: string[];
}

export function getRetailSettingsRequest(form: any): ViewConfiguration {
  return {
    id: '', // ID будет установлен на бэкенде
    applicationType: 'retail',
    domains: form.domains,
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl,
      headlineText: form.headlineText
    }
  };
}

export function getRetailFormConfig(data?: ViewConfiguration, domainsService?: DomainsService): FormConfig {
  return {
    fields: [
      {
        type: FieldType.color,
        name: 'primaryColor',
        label: 'retail.settings.primaryColor',
        value: data?.viewConfig?.primaryColor
      },
      {
        type: FieldType.color,
        name: 'secondaryColor',
        label: 'retail.settings.secondaryColor',
        value: data?.viewConfig?.secondaryColor
      },
      {
        type: FieldType.text,
        name: 'headlineText',
        label: 'retail.settings.headlineText',
        value: data?.viewConfig?.headlineText
      },
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'retail.settings.logoUrl',
        value: data?.viewConfig?.logoUrl,
        placeholder: 'retail.settings.logoUrlPlaceholder'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'retail.settings.faviconUrl',
        value: data?.viewConfig?.faviconUrl,
        placeholder: 'retail.settings.faviconUrlPlaceholder',
        hintMessage: 'retail.settings.faviconUrlHint'
      },
      {
        type: FieldType.select,
        name: 'domains',
        label: 'retail.settings.domains',
        value: data?.viewConfig?.domains || [],
        multiple: true,
        options: domainsService?.getAvailableDomains()
      }
    ]
  };
}
