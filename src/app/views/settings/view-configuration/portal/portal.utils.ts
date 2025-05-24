import { FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import { ViewConfiguration, ViewConfigurationService } from '../view-configuration.service';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { Validators } from '@angular/forms';

export function getPortalSettingsRequest(form: any): ViewConfiguration {
  const request: ViewConfiguration = {
    id: form.id,
    applicationType: 'admin portal',
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
  data?: ViewConfiguration,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  viewConfigService?: ViewConfigurationService
): FormConfig {
  const safeData: ViewConfiguration = data || {
    id: null,
    applicationType: 'admin portal',
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
        if (!viewConfigService || !event || !event.value) {
          return;
        }

        viewConfigService.getViewConfigByApplicationType('admin portal', event.value)
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
