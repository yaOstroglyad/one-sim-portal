import { Component, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormConfig } from '../../../shared';
import { getEditOrderFormConfig } from './edit-order-description.utils';

@Component({
    selector: 'app-edit-order-description-resource',
    templateUrl: './edit-order-description.component.html',
    styleUrls: ['./edit-order-description.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class EditOrderDescriptionComponent {
  editOrderFormConfig: FormConfig;
  form: FormGroup;
  isFormValid = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditOrderDescriptionComponent>,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.editOrderFormConfig = getEditOrderFormConfig(this.data, this.translate);
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
    this.cdr.markForCheck();
  }


  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.get('orderDescription').value);
  }
}
