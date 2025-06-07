import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
import { 
	createControl, 
	initDynamicOptionsForField, 
	setupDisabledState,
	hasFieldHintOrError,
	shouldShowError,
	getFormFieldClass
} from './form-generator.utils';
import { isFunction } from 'rxjs/internal/util/isFunction';
import { Subject, merge, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChipsInputComponent } from '../chips-input/chips-input.component';
import { FormCheckComponent, FormCheckInputDirective } from '@coreui/angular';
import { RichTextInputComponent } from '../rich-text-input';

@Component({
	selector: 'app-form-generator',
	templateUrl: './form-generator.component.html',
	styleUrls: ['./form-generator.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatCheckboxModule,
		MatIconModule,
		TranslateModule,
		ColorPickerComponent,
		MatButtonModule,
		MatListModule,
		MatNativeDateModule,
		FlexLayoutModule,
		ChipsInputComponent,
		FormCheckComponent,
		FormCheckInputDirective,
		RichTextInputComponent
	]
})
export class FormGeneratorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	private unsubscribe$ = new Subject<void>();
	private fieldsHintState$ = new BehaviorSubject<Record<string, boolean>>({});

	@Input() config: FormConfig;
	@Output() formChanges = new EventEmitter<FormGroup>();
	form: FormGroup = new FormGroup({});
	dir: 'ltr' | 'rtl';

	constructor(
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef
	) {
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
		this.initHintStateTracking();
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

	hasFieldHintOrError(field: FieldConfig): boolean {
		const hasHintOrError = hasFieldHintOrError(field, this.form);

		// Update state for reactive tracking
		const currentState = this.fieldsHintState$.value;
		if (currentState[field.name] !== hasHintOrError) {
			this.fieldsHintState$.next({
				...currentState,
				[field.name]: hasHintOrError
			});
		}

		return hasHintOrError;
	}

	getFormFieldClass(field: FieldConfig): string {
		return getFormFieldClass(field, this.form);
	}



	private initDynamicOptions(): void {
		this.config.fields.forEach(field => {
			initDynamicOptionsForField(field, this.form, this.unsubscribe$);
		});
	}

	private initHintStateTracking(): void {
		// Track status changes for all form controls to detect error state changes
		const statusChanges$ = this.config.fields.map(field => {
			const control = this.form.get(field.name);
			return control ? control.statusChanges.pipe(
				startWith(control.status),
				map(() => ({
					fieldName: field.name,
					hasErrors: !!(control.errors),
					hasHint: !!field.hintMessage
				}))
			) : null;
		}).filter(obs => obs !== null);

		if (statusChanges$.length > 0) {
			merge(...statusChanges$).pipe(
				takeUntil(this.unsubscribe$),
				distinctUntilChanged((a, b) =>
					a.fieldName === b.fieldName &&
					a.hasErrors === b.hasErrors &&
					a.hasHint === b.hasHint
				)
			).subscribe(() => {
				// Trigger change detection when hint/error state changes
				this.cdr.markForCheck();
			});
		}
	}

	protected readonly FieldType = FieldType;

	shouldShowError(fieldName: string): boolean {
		return shouldShowError(fieldName, this.form);
	}
}
