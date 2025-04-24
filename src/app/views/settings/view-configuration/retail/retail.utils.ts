import { FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import { ViewConfiguration } from '../view-configuration.service';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';

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
  isAdmin?: boolean
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
      label: 'retail.settings.ownerAccount',
      value: null,
      options: accountsService.ownerAccounts().pipe(
        map(accounts => accounts.map(
          account => ({
            value: account.id,
            displayValue: account.name || account.email || account.id
          } as SelectOption)
        ))
      ),
      multiple: false
    };

    formFields.splice(1, 0, ownerAccountField);
  }

  return {
    fields: formFields
  };
}
