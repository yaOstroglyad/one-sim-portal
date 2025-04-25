import { FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import { ViewConfiguration, ViewConfigurationService } from '../view-configuration.service';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { Validators } from '@angular/forms';

export function getRetailSettingsRequest(form: any): ViewConfiguration {
  const request: ViewConfiguration = {
    id: form.id,
    applicationType: 'retailer',
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl,
      headlineText: form.headlineText
    }
  };

  // Добавляем ownerAccountId только если он присутствует в форме
  if (form.ownerAccountId) {
    request.ownerAccountId = form.ownerAccountId;
  }

  return request;
}

export function getRetailFormConfig(
  data?: ViewConfiguration,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  viewConfigService?: ViewConfigurationService
): FormConfig {
  const safeData: ViewConfiguration = data || {
    id: null,
    applicationType: 'retailer',
    viewConfig: {}
  };

  // Формируем базовые поля формы
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
    }
  ];

  // Если пользователь администратор и форма для создания (id == null), добавляем выбор аккаунта
  if (isAdmin && !safeData.id && accountsService) {
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
        // Если сервис не передан или значение не выбрано, не выполняем запрос
        if (!viewConfigService || !event || !event.value) {
          return;
        }

        // Запрашиваем конфигурацию для выбранного аккаунта
        viewConfigService.getViewConfigByApplicationType('retailer', event.value)
          .subscribe(accountConfig => {
            if (accountConfig && accountConfig.viewConfig) {
              // Обновляем значения полей формы на основе полученной конфигурации
              const viewConfig = accountConfig.viewConfig;
              formGenerator.form.patchValue({
                primaryColor: viewConfig.primaryColor,
                secondaryColor: viewConfig.secondaryColor,
                headlineText: viewConfig.headlineText,
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
