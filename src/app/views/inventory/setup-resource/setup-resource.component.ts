import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { getSetupResourceFormConfig } from './setup-resource.utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProvidersDataService } from '../../../shared/services/providers-data.service';
import { FormConfig } from '../../../shared/components/form-generator/field-config';

@Component({
  selector: 'app-setup-resource',
  templateUrl: './setup-resource.component.html',
  styleUrls: ['./setup-resource.component.scss']
})
export class SetupResourceComponent {
  setupResourceFormConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SetupResourceComponent>,
    private providersDataService: ProvidersDataService,
  ) {
    this.setupResourceFormConfig = getSetupResourceFormConfig(this.providersDataService);
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.value);
  }
}
