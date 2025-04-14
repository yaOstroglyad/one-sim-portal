import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../model';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function createControl(field: FieldConfig): FormControl {
	const { value, disabled, validators, asyncValidators } = field;
	return new FormControl({ value, disabled }, validators, asyncValidators);
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
