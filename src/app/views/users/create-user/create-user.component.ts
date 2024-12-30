import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
	CustomersDataService, CustomerType,
	FormConfig,
	FormGeneratorModule
} from '../../../shared';
import { getCreateUserFormConfig } from './create-user.utils';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, Observable, of } from 'rxjs';
import { UsersDataService } from '../users-data.service';
import { catchError, map } from 'rxjs/operators';

@Component({
	selector: 'app-create-user',
	templateUrl: './create-user.component.html',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		FormGeneratorModule,
		MatButtonModule,
		TranslateModule
	],
	styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
	private customersDataService = inject(CustomersDataService);
	private usersDataService = inject(UsersDataService);
	private translate = inject(TranslateService);
	private dialogRef = inject(MatDialogRef<CreateUserComponent>);

	formConfig: FormConfig;
	form: FormGroup;
	isFormValid: boolean;

	ngOnInit(): void {
		this.formConfig = getCreateUserFormConfig(
			this.translate,
			this.getCustomers(),
			this.emailValidator.bind(this)
		);
	}

	getCustomers() {
		return this.customersDataService.list(CustomerType.Corporate).pipe(
			map(customers => customers.map(c => ({
					value: c.accountId,
					displayValue: c.name
				})
			))
		)
	}

	handleFormChanges(form: FormGroup): void {
		this.form = form;
		this.isFormValid = form.valid;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.dialogRef.close(this.form.getRawValue());
	}

	emailValidator(control: FormControl): Observable<{ [key: string]: boolean } | null> {
		if (!control.value) {
			return of(null);
		}

		return this.usersDataService.verifyEmail(control.value).pipe(
			debounceTime(300),
			map((response: { isExist: boolean }) => {
				return response.isExist ? {emailExists: true} : null;
			}),
			catchError((error) => {
				return of(null);
			})
		);
	}
}
