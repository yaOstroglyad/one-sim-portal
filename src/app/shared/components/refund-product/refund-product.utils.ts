import { FieldType, FormConfig, SelectOption } from '../../model/field-config';
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
