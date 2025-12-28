import { FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import {
  APPLICATION_TYPES,
  WhitelabelConfig,
  WhitelabelConfigService
} from '@shared';
import { AccountsDataService } from 'src/app/shared/services/data/accounts-data.service';
import { Validators } from '@angular/forms';

export function getPortalSettingsRequest(form: any): WhitelabelConfig {
  const request: WhitelabelConfig = {
    id: form.id,
    applicationType: APPLICATION_TYPES.ADMIN_PORTAL,
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl,
      height: form.height || 47
    }
  };

  // Добавляем ownerAccountId только если он присутствует в форме
  if (form.ownerAccountId) {
    request.ownerAccountId = form.ownerAccountId;
  }

  return request;
}

export function getPortalFormConfig(
  data?: WhitelabelConfig,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  whitelabelConfigService?: WhitelabelConfigService
): FormConfig {
  const safeData: WhitelabelConfig = data || {
    id: null,
    applicationType: APPLICATION_TYPES.ADMIN_PORTAL,
    viewConfig: {}
  };

  const formFields = [
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
      type: FieldType.number,
      name: 'height',
      label: 'portal.settings.logoHeight',
      value: safeData.viewConfig?.height || 47,
      placeholder: 'portal.settings.logoHeightPlaceholder',
      min: 20,
      max: 100
    }
  ];

  if (isAdmin && accountsService) {
    const ownerAccountField = {
      type: FieldType.select,
      name: 'ownerAccountId',
      label: 'domains.ownerAccount',
      value: null,
      validators: [Validators.required],
      options: accountsService.ownerAccounts().pipe(
        map(accounts => accounts.map(
          account => ({
            value: account.id,
            displayValue: account.name || account.email || account.id
          } as SelectOption)
        ))
      ),
      multiple: false,
      inputEvent: (event: any, formGenerator: any, field: any) => {
        if (!whitelabelConfigService || !event || !event.value) {
          return;
        }

        whitelabelConfigService.getByApplicationType(APPLICATION_TYPES.ADMIN_PORTAL, event.value)
          .subscribe(accountConfig => {
            if (accountConfig && accountConfig.viewConfig) {
              const viewConfig = accountConfig.viewConfig;
              formGenerator.form.patchValue({
                id: accountConfig.id,
                primaryColor: viewConfig.primaryColor,
                secondaryColor: viewConfig.secondaryColor,
                logoUrl: viewConfig.logoUrl,
                faviconUrl: viewConfig.faviconUrl
              });
            }
          });
      }
    };

    formFields.splice(1, 0, ownerAccountField);
  }

  return {
    fields: formFields
  };
}
