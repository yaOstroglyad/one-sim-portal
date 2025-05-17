import { EditCompanySettings, FieldType, FormConfig, SelectOption } from 'src/app/shared';
import { map } from 'rxjs';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { Validators } from '@angular/forms';
import { WhiteLabelDataService } from 'src/app/shared/services/white-label-data.service';

export function getCompanySettingsRequest(form: any): EditCompanySettings {
  const request: EditCompanySettings = {
    logoUrl: form.logoUrl || '',
    telegramBotLink: form.telegramBotLink || '',
    whatsappSupportLink: form.whatsappSupportLink || '',
    senderEmail: form.senderEmail || '',
    incomingEmail: form.incomingEmail || ''
  };

  if (form.id) {
    request.id = form.id;
  }

  if (form.accountId) {
    request.accountId = form.accountId;
  }

  return request;
}

export function getGeneralSettingsFormConfig(
  data?: EditCompanySettings,
  accountsService?: AccountsDataService,
  isAdmin?: boolean,
  whiteLabelService?: WhiteLabelDataService
): FormConfig {
  const safeData: EditCompanySettings = data || {
    logoUrl: '',
    telegramBotLink: '',
    whatsappSupportLink: '',
    senderEmail: '',
    incomingEmail: ''
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
      type: FieldType.text,
      name: 'logoUrl',
      label: 'settings.general.logoUrl',
      value: safeData.logoUrl || 'assets/img/brand/1esim-logo.png',
      validators: [Validators.required],
      placeholder: 'settings.general.logoUrlPlaceholder'
    },
    {
      type: FieldType.text,
      name: 'telegramBotLink',
      label: 'settings.general.telegramBotLink',
      value: safeData.telegramBotLink || '',
      placeholder: 'settings.general.telegramBotLinkPlaceholder'
    },
    {
      type: FieldType.text,
      name: 'whatsappSupportLink',
      label: 'settings.general.whatsappSupportLink',
      value: safeData.whatsappSupportLink || '',
      placeholder: 'settings.general.whatsappSupportLinkPlaceholder'
    },
    {
      type: FieldType.text,
      name: 'senderEmail',
      label: 'settings.general.senderEmail',
      value: safeData.senderEmail || '',
      validators: [Validators.required, Validators.email],
      placeholder: 'settings.general.senderEmailPlaceholder'
    },
    {
      type: FieldType.text,
      name: 'incomingEmail',
      label: 'settings.general.incomingEmail',
      value: safeData.incomingEmail || '',
      placeholder: 'settings.general.incomingEmailPlaceholder'
    }
  ];

  if (isAdmin && accountsService) {
    const accountField = {
      type: FieldType.select,
      name: 'accountId',
      label: 'domains.ownerAccount',
      value: safeData.accountId || null,
      validators: [Validators.required],
      placeholder: 'domains.selectOwnerAccount',
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
        if (!whiteLabelService || !event || !event.value) {
          return;
        }

        whiteLabelService.companySettings(event.value)
          .subscribe(settings => {
            if (settings) {
              const companySettings = settings;
              formGenerator.form.patchValue({
                id: companySettings.id,
                logoUrl: companySettings.logoUrl,
                telegramBotLink: companySettings.telegramBotLink,
                whatsappSupportLink: companySettings.whatsappSupportLink,
                senderEmail: companySettings.senderEmail,
                incomingEmail: companySettings.incomingEmail
              });
            }
          });
      }
    };

    formFields.splice(1, 0, accountField);
  }

  return {
    fields: formFields
  };
}
