import { Component, Input, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { FieldConfig, FieldType } from '../../../model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TranslateModule } from '@ngx-translate/core';
import { 
	hasFieldHintOrError, 
	shouldShowError, 
	getFormFieldClass 
} from '../../form-generator/form-generator.utils';
import { isFunction } from 'rxjs/internal/util/isFunction';

@Component({
    selector: 'app-form-array-item',
    templateUrl: './form-array-item.component.html',
    styleUrls: ['./form-array-item.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        MatButtonModule,
        MatListModule,
        MatNativeDateModule,
        MatOptionModule,
        FlexLayoutModule
    ]
})
export class FormArrayItemComponent {
	@Input() itemFormGroup: FormGroup;
	@Input() fields: FieldConfig[];
	
	dir: 'ltr' | 'rtl';
	
	constructor() {
		this.dir = document.documentElement.getAttribute('dir') as 'ltr' | 'rtl';
	}
	
	onInputChange(event: any, field: FieldConfig) {
		if (isFunction(field.inputEvent)) {
			// Create a mock form generator object with access to this item's FormGroup
			const mockFormGenerator = {
				form: this.itemFormGroup,
				itemFormGroup: this.itemFormGroup,
				unsubscribe$: new Subject<void>(),
				fieldsHintState$: new BehaviorSubject<Record<string, boolean>>({}),
				addingItem: false,
				config: null,
				formChanges: new EventEmitter<FormGroup>(),
				dir: 'ltr' as 'ltr' | 'rtl',
				cdr: null
			} as any;
			field.inputEvent(event, mockFormGenerator, field);
		}
	}
	
	hasFieldHintOrError(field: FieldConfig): boolean {
		return hasFieldHintOrError(field, this.itemFormGroup);
	}
	
	shouldShowError(fieldName: string): boolean {
		return shouldShowError(fieldName, this.itemFormGroup);
	}
	
	getFormFieldClass(field: FieldConfig): string {
		return getFormFieldClass(field, this.itemFormGroup);
	}
	
	isRequired(field: FieldConfig): boolean {
		const control = this.itemFormGroup.get(field.name);
		if (control && control.validator) {
			const validator = control.validator({} as any);
			return !!(validator && validator['required']);
		}
		return false;
	}
	
	getFieldOptions(field: FieldConfig): Observable<any[]> {
		if (!field.options) {
			return of([]);
		}
		
		if (Array.isArray(field.options)) {
			return of(field.options);
		}
		
		if (typeof field.options === 'function') {
			return field.options(this.itemFormGroup.value);
		}
		
		return field.options;
	}
	
	protected readonly FieldType = FieldType;
}