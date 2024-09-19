import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FieldConfig, FieldType, FormConfig } from './field-config';
import { FormBuilder, FormGroup } from '@angular/forms';
import { createControl } from './form-generator.utils';
import { isFunction } from 'rxjs/internal/util/isFunction';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-form-generator',
	templateUrl: './form-generator.component.html',
	styleUrls: ['./form-generator.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGeneratorComponent implements OnInit, OnDestroy {
	private unsubscribe$ = new Subject<void>();
	@Input() config: FormConfig;
	@Output() formChanges = new EventEmitter<FormGroup>();
	form: FormGroup = new FormGroup({});

	constructor(private fb: FormBuilder) {
	}

	ngOnInit(): void {
		this.form = this.createGroup(this.config);
		this.form.valueChanges.pipe(
			takeUntil(this.unsubscribe$))
			.subscribe(() => {
				this.formChanges.emit(this.form);
			});
	}

	ngOnDestroy(): void {
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
			field.inputEvent(event, this.form, field);
		}
	}

	protected readonly FieldType = FieldType;
}
