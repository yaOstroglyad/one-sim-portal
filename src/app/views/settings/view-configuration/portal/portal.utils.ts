import { FieldType, FormConfig } from 'src/app/shared';
import { ViewConfiguration } from '../view-configuration.service';
import { DomainsService } from 'src/app/shared/services/domains.service';

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
    applicationType: 'portal',
    domains: form.domains,
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl
    }
  };
}

export function getPortalFormConfig(data?: ViewConfiguration, domainsService?: DomainsService): FormConfig {
  return {
    fields: [
      {
        type: FieldType.uuid,
        name: 'id',
        label: 'ID',
        value: data.id || null,
        invisible: true
      },
      {
        type: FieldType.color,
        name: 'primaryColor',
        label: 'portal.settings.primaryColor',
        value: data?.viewConfig?.primaryColor
      },
      {
        type: FieldType.color,
        name: 'secondaryColor',
        label: 'portal.settings.secondaryColor',
        value: data?.viewConfig?.secondaryColor
      },
      {
        type: FieldType.text,
        name: 'logoUrl',
        label: 'portal.settings.logoUrl',
        value: data?.viewConfig?.logoUrl,
        placeholder: 'portal.settings.logoUrlPlaceholder'
      },
      {
        type: FieldType.text,
        name: 'faviconUrl',
        label: 'portal.settings.faviconUrl',
        value: data?.viewConfig?.faviconUrl,
        placeholder: 'portal.settings.faviconUrlPlaceholder',
        hintMessage: 'portal.settings.faviconUrlHint'
      },
      {
        type: FieldType.select,
        name: 'domains',
        label: 'portal.settings.domains',
        value: data?.viewConfig?.domains || [],
        multiple: true,
        options: domainsService?.getAvailableDomains()
      }
    ]
  };
}
