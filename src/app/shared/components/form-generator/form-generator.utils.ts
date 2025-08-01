import { FormControl, FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import { FieldConfig, FieldType } from '../../model';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function createControl(field: FieldConfig): AbstractControl {
	if (field.type === FieldType.formArray) {
		const fb = new FormBuilder();
		const array = fb.array([] as AbstractControl[], field.validators);
		
		// Initialize with default items
		if (field.value && Array.isArray(field.value)) {
			field.value.forEach((item: any) => {
				const itemGroup = createArrayItemGroup(field.arrayConfig!, item, fb);
				array.push(itemGroup);
			});
		} else if (field.arrayConfig?.minItems) {
			// Add minimum required items
			for (let i = 0; i < field.arrayConfig.minItems; i++) {
				const itemGroup = createArrayItemGroup(field.arrayConfig, field.arrayConfig.defaultItem || {}, fb);
				array.push(itemGroup);
			}
		}
		
		return array;
	}
	
	const { value, disabled, validators, asyncValidators } = field;
	return new FormControl({ value, disabled }, validators, asyncValidators);
}

function createArrayItemGroup(config: any, itemValue: any, fb: FormBuilder): FormGroup {
	const groupControls = config.itemConfig.fields.reduce((controls: any, field: FieldConfig) => {
		const fieldValue = itemValue[field.name] ?? field.value;
		controls[field.name] = new FormControl(fieldValue, field.validators);
		return controls;
	}, {});

	return fb.group(groupControls);
}

/**
 * Устанавливает начальное состояние disabled для контролов
 */
export function setupDisabledState(form: FormGroup, fields: FieldConfig[]): void {
	fields.forEach(field => {
		if (field.disabled) {
			const control = form.get(field.name);
			if (control) {
				control.disable();
			}
		}
	});
}

// ===== FORM FIELD CLASS UTILITIES =====

/**
 * Determines if a field has active hint or error content
 */
export function hasFieldHintOrError(field: FieldConfig, form: FormGroup): boolean {
	const control = form?.get(field.name);

	// Check for ACTIVE hint (defined and not empty)
	const hasActiveHint = !!(field.hintMessage && field.hintMessage.trim());

	// Check for ACTIVE error (exists, not empty, and field is touched/dirty)
	const hasActiveError = !!(
		control &&
		control.errors &&
		Object.keys(control.errors).length > 0 &&
		(control.touched || control.dirty)
	);

	return hasActiveHint || hasActiveError;
}

/**
 * Determines if field errors should be displayed
 */
export function shouldShowError(fieldName: string, form: FormGroup): boolean {
	const control = form?.get(fieldName);
	return !!(control && control.errors && (control.touched || control.dirty));
}

/**
 * Generates complete CSS class string for form field wrapper
 */
export function getFormFieldClass(field: FieldConfig, form: FormGroup): string {
	const baseClass = field.className || '';
	const control = form?.get(field.name);

	// Check for ACTIVE hint (defined, not empty, and trimmed)
	const hasActiveHint = !!(field.hintMessage && field.hintMessage.trim());

	// Check for ACTIVE error (exists, not empty, and field was interacted with)
	const hasActiveError = !!(
		control &&
		control.errors &&
		Object.keys(control.errors).length > 0 &&
		(control.touched || control.dirty)
	);

	let classes = baseClass;

	// Only add classes when content is actually present/active AND visible
	if (hasActiveHint) {
		classes += ' has-active-hint';
	}

	if (hasActiveError) {
		classes += ' has-active-error';
	}

	if (hasActiveHint || hasActiveError) {
		classes += ' has-active-subscript-content';
	}

	// Add dynamic spacing class
	const spacingClass = getSpacingClass(field, form);
	if (spacingClass) {
		classes += ` ${spacingClass}`;
	}

	return classes.trim();
}

// ===== SPACING UTILITIES =====

/**
 * Determines appropriate spacing class for a field
 */
export function getSpacingClass(field: FieldConfig, form: FormGroup): string {
	// If marginBottom is explicitly set, use it regardless of content
	if (field.marginBottom !== undefined) {
		if (field.marginBottom === 0) {
			return 'mb-0';
		}

		// Handle string aliases
		if (typeof field.marginBottom === 'string') {
			const aliases = ['sm', 'md', 'lg', 'xl'];
			if (aliases.includes(field.marginBottom)) {
				return `mb-${field.marginBottom}`;
			}
		}

		// Handle numeric values
		if (typeof field.marginBottom === 'number') {
			return convertToClassName(field.marginBottom);
		}
	}

	// Smart default spacing based on content presence
	return getSmartDefaultSpacing(field, form);
}

/**
 * Determines smart default spacing based on field content
 */
export function getSmartDefaultSpacing(field: FieldConfig, form: FormGroup): string {
	const control = form?.get(field.name);

	// Check if there's any active content that provides visual separation
	const hasActiveHint = !!(field.hintMessage && field.hintMessage.trim());
	const hasActiveError = !!(
		control &&
		control.errors &&
		Object.keys(control.errors).length > 0 &&
		(control.touched || control.dirty)
	);

	// If there's active content (hint or error), use minimal spacing
	if (hasActiveHint || hasActiveError) {
		return 'mb-1'; // Small spacing when content provides separation
	}

	// No active content - use default spacing for visual separation between fields
	return 'mb-1-5'; // Default spacing when no content
}

/**
 * Converts numeric margin value to CSS class name
 */
export function convertToClassName(value: number): string {
	// Convert decimal values to valid CSS class names
	// 0.25 → mb-0-25, 1.5 → mb-1-5, 2 → mb-2, etc.

	if (value === 0) return 'mb-0';

	const integerPart = Math.floor(value);
	const decimalPart = value - integerPart;

	if (decimalPart === 0) {
		// Whole number: 1 → mb-1, 2 → mb-2
		return `mb-${integerPart}`;
	}

	// Decimal number: convert decimal to hyphen format
	const decimalString = decimalPart.toString().replace('0.', '');
	return `mb-${integerPart}-${decimalString}`;
}

/**
 * Включает контрол если для этого есть условия
 */
export function enableControlIfApplicable(form: FormGroup, fieldName: string, options: any[]): void {
	const control = form.get(fieldName);
	if (control && options.length > 0) {
		control.enable();
	}
}

/**
 * Отключает контрол
 */
export function disableControl(form: FormGroup, fieldName: string): void {
	const control = form.get(fieldName);
	if (control) {
		control.disable();
	}
}

/**
 * Получает текущие значения указанных полей формы
 */
export function getFormValues(form: FormGroup, fieldNames: string[]): Record<string, any> {
	return fieldNames.reduce((acc, name) => {
		acc[name] = form.get(name)?.value;
		return acc;
	}, {} as Record<string, any>);
}

/**
 * Проверяет наличие хотя бы одного значения в объекте
 */
export function hasAnyValue(values: Record<string, any>): boolean {
	return Object.values(values).some(value =>
		value !== null && value !== undefined && value !== ''
	);
}

/**
 * Создаёт Observable с пустым массивом опций
 */
export function createEmptyOptions(): Observable<any[]> {
	return of([]);
}

/**
 * Инициализирует поля с динамическими опциями
 * @param field Конфигурация поля
 * @param form Форма
 * @param destroy$ Сигнал для отписки
 */
export function initDynamicOptionsForField(
	field: FieldConfig,
	form: FormGroup,
	destroy$: Subject<void>
): void {
	if (typeof field.options !== 'function' || !field.dependsOnValue?.length) {
		return;
	}

	// Сохраняем оригинальную функцию для получения опций
	const optionsFn = field.options;

	// Инициализируем options пустым массивом
	field.options = createEmptyOptions();

	// Обработка начальных значений
	const initialValues = getFormValues(form, field.dependsOnValue);
	if (hasAnyValue(initialValues)) {
		// Вызываем функцию для получения начальных опций
		optionsFn(initialValues)
			.pipe(takeUntil(destroy$)) // Отписка при разрушении компонента
			.subscribe(options => {
				field.options = of(options);
				enableControlIfApplicable(form, field.name, options);
			});
	}

	// Подписываемся на изменения зависимых полей
	const combined$ = combineLatest(
		field.dependsOnValue.map(dep => form.get(dep)!.valueChanges)
	);

	combined$
		.pipe(takeUntil(destroy$)) // Отписка при разрушении компонента
		.subscribe(() => {
			const values = getFormValues(form, field.dependsOnValue);
			disableControl(form, field.name);

			// Вызываем функцию и заменяем field.options на observable
			optionsFn(values)
				.pipe(takeUntil(destroy$)) // Отписка при разрушении компонента
				.subscribe(options => {
					field.options = of(options);
					enableControlIfApplicable(form, field.name, options);
				});
		});
}
