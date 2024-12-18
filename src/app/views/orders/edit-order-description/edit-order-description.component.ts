import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormConfig } from '../../../shared/model/field-config';
import { getEditOrderFormConfig } from './edit-order-description.utils';

@Component({
  selector: 'app-edit-order-description-resource',
  templateUrl: './edit-order-description.component.html',
  styleUrls: ['./edit-order-description.component.scss']
})
export class EditOrderDescriptionComponent {
  editOrderFormConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditOrderDescriptionComponent>
  ) {
    this.editOrderFormConfig = getEditOrderFormConfig(this.data);
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }


  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.get('orderDescription').value);
  }
}
