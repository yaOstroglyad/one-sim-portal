import { FieldType, FormConfig } from '../../../shared/components/form-generator/field-config';
import { Validators } from '@angular/forms';
import { of } from 'rxjs';
import { CustomerType } from '../../../shared/model/customer';

export function getRefundFormConfig(products: any): FormConfig {
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
