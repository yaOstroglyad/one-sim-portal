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
		this.form.valueChanges.pipe(
			takeUntil(this.unsubscribe$))
			.subscribe(() => {
				this.formChanges.emit(this.form);
			});
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

	updateFieldValidators(fieldName: string, validators: any[]): void {
		const control = this.form.get(fieldName);

		if (control) {
			control.clearValidators();
			control.setValidators(validators);
			control.updateValueAndValidity();
		}
	}

	toggleFieldHint(fieldName: string, hintMessage: string | null, className?: string): void {
		const fieldConfig = this.config.fields.find(field => field.name === fieldName);
		if (fieldConfig) {
			fieldConfig.hintMessage = hintMessage;
			fieldConfig.className = className;
		}
	}


	protected readonly FieldType = FieldType;
}
