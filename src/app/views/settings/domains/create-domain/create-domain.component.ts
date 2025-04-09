import { Component, OnInit, Inject } from '@angular/core';
import { Domain } from '../../../../shared/model/domain';
import { FormConfig, FormGeneratorModule } from '../../../../shared';
import { DomainsDataService } from '../../../../shared/services/domains-data.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { getCreateDomainFormConfig, getDomainCreateRequest } from './create-domain.utils';

@Component({
	selector: 'app-create-domain',
	templateUrl: './create-domain.component.html',
	styleUrls: ['./create-domain.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatButtonModule,
		TranslateModule,
		FormGeneratorModule
	]
})
export class CreateDomainComponent implements OnInit {
	domain: Domain;
	formConfig: FormConfig;
	isFormValid = false;
	formValue: any;

	constructor(
		private dialogRef: MatDialogRef<CreateDomainComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { domain?: Domain },
		private domainsDataService: DomainsDataService
	) {
		this.domain = data?.domain;
	}

	ngOnInit() {
		this.formConfig = getCreateDomainFormConfig(this.domain);
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
