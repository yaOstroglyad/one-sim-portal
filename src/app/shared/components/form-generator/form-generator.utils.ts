import { FormControl } from '@angular/forms';
import { FieldConfig } from '../../model/field-config';

export function createControl(field: FieldConfig): FormControl {
	const { value, disabled, validators, asyncValidators } = field;
	return new FormControl({ value, disabled }, validators, asyncValidators);
}
