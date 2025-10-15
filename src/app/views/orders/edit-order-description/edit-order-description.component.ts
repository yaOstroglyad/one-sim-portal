import { Component, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormConfig, FormGeneratorComponent } from '../../../shared';
import { getEditOrderFormConfig } from './edit-order-description.utils';

@Component({
    standalone: true,
    selector: 'app-edit-order-description-resource',
    imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule,
        FormGeneratorComponent
    ],
    templateUrl: './edit-order-description.component.html',
    styleUrls: ['./edit-order-description.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
