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
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { 
	createControl, 
	initDynamicOptionsForField, 
	setupDisabledState,
	hasFieldHintOrError,
	shouldShowError,
	getFormFieldClass
} from './form-generator.utils';
import { isFunction } from 'rxjs/internal/util/isFunction';
import { Subject, merge, combineLatest, BehaviorSubject, Observable } from 'rxjs';
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
import { IconDirective } from '@coreui/icons-angular';
import { RichTextInputComponent } from '../rich-text-input';
import { MultiselectGridComponent } from '../multiselect-grid';
import { FormArrayItemComponent } from './form-array-item';
import { FileUploadComponent } from '../file-upload';

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
		IconDirective,
		RichTextInputComponent,
		MultiselectGridComponent,
		FormArrayItemComponent,
		FileUploadComponent
	]
})
export class FormGeneratorComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	private unsubscribe$ = new Subject<void>();
	private fieldsHintState$ = new BehaviorSubject<Record<string, boolean>>({});
	
	addingItem = false;

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
			const control = createControl(field);
			controls[field.name] = control;
			return controls;
		}, {} as any);

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

	isRequired(field: FieldConfig): boolean {
		const control = this.form.get(field.name);
		if (control && control.validator) {
			const validator = control.validator({} as any);
			return !!(validator && validator['required']);
		}
		return false;
	}

	getGridOptions(field: FieldConfig): Observable<any[]> | any[] {
		if (!field.gridOptions) {
			return [];
		}

		if (Array.isArray(field.gridOptions)) {
			return field.gridOptions;
		}

		if (typeof field.gridOptions === 'function') {
			return field.gridOptions(this.form.value);
		}

		return field.gridOptions;
	}

	getFieldOptions(field: FieldConfig): Observable<any[]> | any[] {
		if (!field.options) {
			return [];
		}

		if (Array.isArray(field.options)) {
			return field.options;
		}

		if (typeof field.options === 'function') {
			return field.options(this.form.value);
		}

		return field.options;
	}

	getFormArray(fieldName: string): FormArray {
		return this.form.get(fieldName) as FormArray;
	}

	canAddArrayItem(field: FieldConfig): boolean {
		const formArray = this.getFormArray(field.name);
		return !field.arrayConfig?.maxItems || formArray.length < field.arrayConfig.maxItems;
	}

	canRemoveArrayItem(field: FieldConfig): boolean {
		const formArray = this.getFormArray(field.name);
		return !field.arrayConfig?.minItems || formArray.length > field.arrayConfig.minItems;
	}

	addArrayItem(fieldName: string, config: any): void {
		if (this.addingItem) return; // Prevent double clicks
		
		this.addingItem = true;
		const formArray = this.getFormArray(fieldName);
		const itemGroup = this.createArrayItemGroup(config);
		
		// Add the FormGroup directly
		formArray.push(itemGroup);
		
		// Initialize dynamic options for the new item
		config.itemConfig.fields.forEach((field: FieldConfig) => {
			initDynamicOptionsForField(field, itemGroup, this.unsubscribe$);
		});
		
		// Re-enable button after a short delay
		setTimeout(() => {
			this.addingItem = false;
			this.cdr.detectChanges();
		}, 100);
	}

	removeArrayItem(fieldName: string, index: number): void {
		const formArray = this.getFormArray(fieldName);
		formArray.removeAt(index);
	}

	private createArrayItemGroup(config: any): FormGroup {
		const groupControls = config.itemConfig.fields.reduce((controls: any, field: FieldConfig) => {
			// Create a copy of field with default value for new items
			const fieldCopy = {
				...field,
				value: config.defaultItem?.[field.name] ?? field.value
			};
			controls[field.name] = createControl(fieldCopy);
			return controls;
		}, {});

		return this.fb.group(groupControls);
	}

	trackByIndex(index: number, item: any): number {
		return index;
	}

	// File Upload Methods
	getFileUploadConfig(field: FieldConfig): any {
		const defaultConfig = {
			acceptedFormats: ['.csv', '.xlsx', '.xls'],
			dropZoneText: 'Drag and drop a file here, or click to browse',
			supportedFormatsText: 'Supported formats: CSV, Excel (.xlsx, .xls)',
			chooseFileButtonText: 'Choose File',
			uploadButtonText: 'Upload',
			showUploadButton: false,
			autoUpload: false
		};

		return {
			...defaultConfig,
			...field.fileUploadConfig
		};
	}

	onFileSelected(file: File, field: FieldConfig): void {
		// Set the file in the form control
		const control = this.form.get(field.name);
		if (control) {
			control.setValue(file);
			control.markAsTouched();
		}

		// Call custom input event handler if provided
		if (field.inputEvent) {
			field.inputEvent(file, this, field);
		}
	}

	onFileUploadRequested(file: File, field: FieldConfig): void {
		// Emit an event that parent component can handle
		// This allows parent to handle the actual upload logic
		if (field.inputEvent) {
			field.inputEvent({ type: 'upload', file }, this, field);
		}
	}

	onFileCleared(field: FieldConfig): void {
		// Clear the file from form control
		const control = this.form.get(field.name);
		if (control) {
			control.setValue(null);
			control.markAsTouched();
		}

		// Call custom input event handler if provided
		if (field.inputEvent) {
			field.inputEvent({ type: 'clear' }, this, field);
		}
	}

	isFieldRequired(field: FieldConfig): boolean {
		const control = this.form.get(field.name);
		if (control && control.validator) {
			const validator = control.validator({} as any);
			return !!(validator && validator['required']);
		}
		return false;
	}

}
