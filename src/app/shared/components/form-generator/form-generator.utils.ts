import { FormControl } from '@angular/forms';
import { FieldConfig } from './field-config';

export function createControl(config: FieldConfig): FormControl {
	const { value, disabled, validators } = config;
	return new FormControl({ value, disabled }, validators);
}
