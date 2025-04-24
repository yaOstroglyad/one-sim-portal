import { DomainsDataService, FieldType, FormConfig } from 'src/app/shared';
import { ViewConfiguration } from '../view-configuration.service';

export interface PortalSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  domains: string[];
}

export function getPortalSettingsRequest(form: any): ViewConfiguration {
  return {
    id: form.id,
    applicationType: 'admin portal',
    domains: form.domains,
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl
    }
  };
}

export function getPortalFormConfig(data?: ViewConfiguration, domainsService?: DomainsDataService): FormConfig {
  const safeData: ViewConfiguration = data || {
    id: null,
    applicationType: 'admin portal',
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
        label: 'portal.settings.primaryColor',
        value: safeData.viewConfig?.primaryColor
      },
      {
        type: FieldType.color,
        name: 'secondaryColor',
        label: 'portal.settings.secondaryColor',
        value: safeData.viewConfig?.secondaryColor
      },
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'portal.settings.logoUrl',
        value: safeData.viewConfig?.logoUrl,
        placeholder: 'portal.settings.logoUrlPlaceholder'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'portal.settings.faviconUrl',
        value: safeData.viewConfig?.faviconUrl,
        placeholder: 'portal.settings.faviconUrlPlaceholder',
        hintMessage: 'portal.settings.faviconUrlHint'
      },
      {
        type: FieldType.select,
        name: 'domains',
        label: 'portal.settings.domains',
        value: safeData.domains || [],
        multiple: true,
        options: domainsService?.getAvailableDomains()
      }
    ]
  };
}
