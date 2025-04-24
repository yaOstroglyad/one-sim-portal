import { FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import { ViewConfiguration } from '../view-configuration.service';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';

export function getPortalSettingsRequest(form: any): ViewConfiguration {
  const request: ViewConfiguration = {
    id: form.id,
    applicationType: 'admin portal',
    viewConfig: {
      primaryColor: form.primaryColor,
      secondaryColor: form.secondaryColor,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl
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
  isAdmin?: boolean
): FormConfig {
  const safeData: ViewConfiguration = data || {
    id: null,
    applicationType: 'admin portal',
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
    }
  ];

  // Если пользователь администратор и форма для создания (id == null), добавляем выбор аккаунта
  if (isAdmin && !safeData.id && accountsService) {
    const ownerAccountField = {
      type: FieldType.select,
      name: 'ownerAccountId',
      label: 'portal.settings.ownerAccount',
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
