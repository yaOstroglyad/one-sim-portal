import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SetupResourceFormConfig } from './setup-resource.utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-setup-resource',
  templateUrl: './setup-resource.component.html',
  styleUrls: ['./setup-resource.component.scss']
})
export class SetupResourceComponent {
  setupResourceFormConfig = SetupResourceFormConfig;
  form: any;
  isFormValid: any;

  constructor(
    public dialogRef: MatDialogRef<SetupResourceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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
