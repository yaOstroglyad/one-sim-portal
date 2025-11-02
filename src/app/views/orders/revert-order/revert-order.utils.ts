import { Validators } from '@angular/forms';
import {
	FormConfig,
	FieldType
} from '@shared';
import { Order } from '@shared/models/payment';

export function getRevertOrderFormConfig(order: Order): FormConfig {
	return {
		fields: [
			{
				type: FieldType.text,
				name: 'parentOrderId',
				label: '',
				value: order.id,
				disabled: true,
				invisible: true
			},
			{
				type: FieldType.textarea,
				name: 'orderDescription',
				label: 'order.revertOrder.orderDescription',
				validators: [Validators.required],
				placeholder: 'order.revertOrder.orderDescriptionPlaceholder'
			},
			{
				type: FieldType.number,
				name: 'simCount',
				label: 'order.revertOrder.simCount',
				validators: [Validators.required, Validators.min(1)],
				placeholder: 'order.revertOrder.simCountPlaceholder'
			}
		]
	};
}