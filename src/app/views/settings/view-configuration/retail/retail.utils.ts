import { DomainsDataService, FieldType, FormConfig } from 'src/app/shared';
import { ViewConfiguration } from '../view-configuration.service';

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
    id: form.id,
    applicationType: 'retailer',
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

export function getRetailFormConfig(data?: ViewConfiguration, domainsService?: DomainsDataService): FormConfig {
  const safeData: ViewConfiguration = data || { 
    id: null, 
    applicationType: 'retailer', 
    domains: [], 
    viewConfig: {} 
  };

  return {
    fields: [
      {
        type: FieldType.uuid,
        name: 'id',
        label: 'ID',
        value: safeData.id || null,
        invisible: true
      },
      {
        type: FieldType.color,
        name: 'primaryColor',
        label: 'retail.settings.primaryColor',
        value: safeData.viewConfig?.primaryColor
      },
      {
        type: FieldType.color,
        name: 'secondaryColor',
        label: 'retail.settings.secondaryColor',
        value: safeData.viewConfig?.secondaryColor
      },
      {
        type: FieldType.text,
        name: 'headlineText',
        label: 'retail.settings.headlineText',
        value: safeData.viewConfig?.headlineText
      },
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'retail.settings.logoUrl',
        value: safeData.viewConfig?.logoUrl,
        placeholder: 'retail.settings.logoUrlPlaceholder'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'retail.settings.faviconUrl',
        value: safeData.viewConfig?.faviconUrl,
        placeholder: 'retail.settings.faviconUrlPlaceholder',
        hintMessage: 'retail.settings.faviconUrlHint'
      },
      {
        type: FieldType.select,
        name: 'domains',
        label: 'retail.settings.domains',
        value: safeData.domains || [],
        multiple: true,
        options: domainsService?.getAvailableDomains()
      }
    ]
  };
}
