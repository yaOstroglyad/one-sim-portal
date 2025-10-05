import { Component, OnInit } from '@angular/core';
import { getDomainCreateRequest, getCreateDomainFormConfig } from './create-domain.utils';
import {
	FormConfig, FormGeneratorComponent, AccountsDataService,
	WhiteLabelDataService, DomainsDataService
} from '../../../../shared';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-create-domain',
    templateUrl: './create-domain.component.html',
    styleUrls: ['./create-domain.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        TranslateModule,
        FormGeneratorComponent
    ]
})
export class CreateDomainComponent implements OnInit {
	formConfig: FormConfig;
	isFormValid = false;
	formValue: any;

	constructor(
		private dialogRef: MatDialogRef<CreateDomainComponent>,
		private domainsDataService: DomainsDataService,
		private accountsDataService: AccountsDataService,
		private whiteLabelDataService: WhiteLabelDataService
	) {
	}

	ngOnInit() {
		this.formConfig = getCreateDomainFormConfig(
			this.accountsDataService,
			this.whiteLabelDataService
		);
	}

	handleFormChanges(event: { valid: boolean, value: any }) {
		this.isFormValid = event.valid;
		this.formValue = event.value;
	}

	close() {
		this.dialogRef.close();
	}

	submit() {
		if (!this.isFormValid) {
			return;
		}

		const request = getDomainCreateRequest(this.formValue);
		this.domainsDataService.create(request).subscribe(() => {
			this.dialogRef.close(true);
		});
	}
}
