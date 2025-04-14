import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input, OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges
} from '@angular/core';
import { FieldConfig, FieldType, FormConfig } from '../../model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { createControl, initDynamicOptionsForField, setupDisabledState } from './form-generator.utils';
import { isFunction } from 'rxjs/internal/util/isFunction';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-form-generator',
	templateUrl: './form-generator.component.html',
	styleUrls: ['./form-generator.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGeneratorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	private unsubscribe$ = new Subject<void>();
	@Input() config: FormConfig;
	@Output() formChanges = new EventEmitter<FormGroup>();
	form: FormGroup = new FormGroup({});
	dir: 'ltr' | 'rtl';

	constructor(private fb: FormBuilder) {
		this.dir = document.documentElement.getAttribute('dir') as 'ltr' | 'rtl';
	}

	public ngOnInit(): void {
		this.form = this.createGroup(this.config);

		setupDisabledState(this.form, this.config.fields);

		this.form.valueChanges.pipe(
			takeUntil(this.unsubscribe$))
			.subscribe(() => {
				this.formChanges.emit(this.form);
			});

		this.initDynamicOptions();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['config']) {
			console.log('Form config received in form generator:', this.config);
		}
	}

	public ngAfterViewInit(): void {
		this.formChanges.emit(this.form);
	}

	public ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	createGroup(config: FormConfig): FormGroup {
		const groupControls = config.fields.reduce((controls, field) => {
			controls[field.name] = createControl(field);
			return controls;
		}, {});

		return this.fb.group(groupControls, {validators: config.formValidators});
	}

	onInputChange(event: any, field: FieldConfig) {
		if (isFunction(field.inputEvent)) {
			field.inputEvent(event, this, field);
		}
	}

	shouldFieldBeVisible(field: FieldConfig): boolean {
		if (!field.dependsOn || field.dependsOn.length === 0) {
			return true;
		}

		return field.dependsOn.every(dep => {
			const control = this.form.get(dep);
			return control && control.value !== undefined && control.value !== null && control.value !== '';
		});
	}

	private initDynamicOptions(): void {
		this.config.fields.forEach(field => {
			initDynamicOptionsForField(field, this.form, this.unsubscribe$);
		});
	}

	openColorPicker(fieldName: string): void {
		const input = document.getElementById(fieldName) as HTMLInputElement;
		if (input) {
			input.click();
		}
	}

	protected readonly FieldType = FieldType;
}
