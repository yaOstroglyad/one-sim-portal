import { FieldType, FormConfig, FormGeneratorComponent, SelectOption, shadeColor } from 'src/app/shared';
import { map } from 'rxjs';
import { ViewConfiguration, ViewConfigurationService } from '../view-configuration.service';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { Validators } from '@angular/forms';

export function getRetailSettingsRequest(form: any): ViewConfiguration {
  const request: ViewConfiguration = {
    id: form.id,
    applicationType: 'retailer',
    viewConfig: {
      primary: form.primary,
      'primary-hover': form['primary-hover'],
      'border-neutral': form['border-neutral'],
      backdrop: form.backdrop,
      brandName: form.brandName,
      heroTitle: form.heroTitle,
      heroSubTitle: form.heroSubTitle,
      logoWidth: form.logoWidth,
      logoHeight: form.logoHeight,
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl,
      supportUrl: form.supportUrl
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
      name: 'primary',
      label: 'retail.settings.primary',
      value: safeData.viewConfig?.primary || '#f9a743',
      inputEvent: (event: any, formGenerator: FormGeneratorComponent, field: any) => {
        if (event) {
          const lighterPrimary = shadeColor(event.target.value, 30);
          formGenerator.form.get('primary-hover').setValue(lighterPrimary);
        }
      }
    },
    {
      type: FieldType.color,
      name: 'primary-hover',
      invisible: true,
      label: 'retail.settings.primaryHover',
      value: safeData.viewConfig?.['primary-hover'] || '#eab308'
    },
    {
      type: FieldType.text,
      name: 'border-neutral',
      label: 'retail.settings.borderNeutral',
      value: safeData.viewConfig?.['border-neutral'] || '0, 0%, 50%',
      invisible: true
    },
    {
      type: FieldType.color,
      name: 'backdrop',
      label: 'retail.settings.backdrop',
      value: safeData.viewConfig?.backdrop || '#272727cc',
      invisible: true
    },
    {
      type: FieldType.text,
      name: 'brandName',
      label: 'retail.settings.brandName',
      value: safeData.viewConfig?.brandName || 'OnlySim'
    },
    {
      type: FieldType.richText,
      name: 'heroTitle',
      label: 'retail.settings.heroTitle',
      value: safeData.viewConfig?.heroTitle || "Connect Globally with <span class='text-primary'>OnlySim eSIM</span>",
      maxLength: 100
    },
    {
      type: FieldType.richText,
      name: 'heroSubTitle',
      label: 'retail.settings.heroSubTitle',
      value: safeData.viewConfig?.heroSubTitle || "Stay connected worldwide with our reliable and affordable eSIM solutions.",
      maxLength: 100
    },
    {
      type: FieldType.number,
      name: 'logoWidth',
      label: 'retail.settings.logoWidth',
      value: safeData.viewConfig?.logoWidth || 120,
      invisible: true
    },
    {
      type: FieldType.number,
      name: 'logoHeight',
      label: 'retail.settings.logoHeight',
      value: safeData.viewConfig?.logoHeight || 40,
      invisible: true
    },
    {
      type: FieldType.text,
      name: 'logoUrl',
      label: 'retail.settings.logoUrl',
      value: safeData.viewConfig?.logoUrl || null,
      placeholder: 'retail.settings.logoUrlPlaceholder',
      hintMessage: 'retail.settings.logoUrlHint',
      inputEvent: (event: any, formGenerator: any, field: any) => {
        if (event && event.target && event.target.value === '') {
          formGenerator.form.get('logoUrl').setValue(null);
        }
      }
    },
    {
      type: FieldType.text,
      name: 'faviconUrl',
      label: 'retail.settings.faviconUrl',
      value: safeData.viewConfig?.faviconUrl || 'assets/img/brand/1esim-logo-small.png',
      placeholder: 'retail.settings.faviconUrlPlaceholder',
      hintMessage: 'retail.settings.faviconUrlHint'
    },
    {
      type: FieldType.text,
      name: 'supportUrl',
      label: 'retail.settings.supportUrl',
      value: safeData.viewConfig?.supportUrl || 'https://t.me/only_sim_bot'
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
                id: accountConfig.id,
                primary: viewConfig.primary,
                'primary-hover': viewConfig['primary-hover'],
                'border-neutral': viewConfig['border-neutral'],
                backdrop: viewConfig.backdrop,
                brandName: viewConfig.brandName,
                heroTitle: viewConfig.heroTitle,
                heroSubTitle: viewConfig.heroSubTitle,
                logoWidth: viewConfig.logoWidth,
                logoHeight: viewConfig.logoHeight,
                logoUrl: viewConfig.logoUrl,
                faviconUrl: viewConfig.faviconUrl,
                supportUrl: viewConfig.supportUrl
              });
            }
          });
      }
    };

    formFields.splice(1, 0, ownerAccountField as any);
  }

  return {
    fields: formFields
  };
}
