import { FieldType, FormConfig } from '../../../shared';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export function getEditOrderFormConfig(data: any, translate: TranslateService): FormConfig {
	return {
		fields: [
			{
				type: FieldType.textarea,
				value: data.description,
				name: 'orderDescription',
				label: translate.instant('editOrderDescription.orderDescriptionLabel'),
				validators: [Validators.required]
			}
		]
	};
}
