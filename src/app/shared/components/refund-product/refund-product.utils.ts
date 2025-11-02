import { FieldType, FormConfig, SelectOption } from '@shared/models/ui';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';

export function getRefundFormConfig(products: Observable<SelectOption[]>): FormConfig {
	return {
		fields: [
			{
				type: FieldType.select,
				name: 'product',
				label: 'Product',
				placeholder: 'Select product',
				options: products,
				validators: [Validators.required]
			}
		]
	};
}
