import { FieldType, FormConfig, SelectOption } from '../../../shared';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export function getCreateUserFormConfig(
	translate: TranslateService,
	accounts: Observable<SelectOption[]>,
	emailValidator: () => Observable<{ [key: string]: boolean } | null>
): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'accountId',
				label: translate.instant('createUser.account'),
				placeholder: translate.instant('createUser.accountPlaceholder'),
				options: accounts,
				validators: [Validators.required]
			},
			{
				type: FieldType.text,
				name: 'loginName',
				label: translate.instant('createUser.username'),
				placeholder: translate.instant('createUser.usernamePlaceholder'),
				validators: [Validators.required]
			},
			{
				type: FieldType.password,
				name: 'password',
				label: translate.instant('createUser.password'),
				placeholder: translate.instant('createUser.passwordPlaceholder'),
				validators: [Validators.required]
			},
			{
				type: FieldType.email,
				name: 'email',
				label: translate.instant('createUser.email'),
				placeholder: translate.instant('createUser.emailPlaceholder'),
				validators: [Validators.required, Validators.email],
				asyncValidators: [emailValidator]
			},
			{
				type: FieldType.text,
				name: 'phone',
				label: translate.instant('createUser.phone'),
				placeholder: translate.instant('createUser.phonePlaceholder')
			},
			{
				type: FieldType.text,
				name: 'firstName',
				label: translate.instant('createUser.firstName'),
				placeholder: translate.instant('createUser.firstNamePlaceholder'),
			},
			{
				type: FieldType.text,
				name: 'lastName',
				label: translate.instant('createUser.lastName'),
				placeholder: translate.instant('createUser.lastNamePlaceholder'),
			}
		]
	};
}
