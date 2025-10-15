import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { getSetupResourceFormConfig } from './setup-resource.utils';
import { ProvidersDataService, FormGeneratorComponent } from '../../../shared';
import { FormConfig } from '../../../shared';

@Component({
    standalone: true,
    selector: 'app-setup-resource',
    imports: [
        MatDialogModule,
        MatButtonModule,
        TranslateModule,
        FormGeneratorComponent
    ],
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
