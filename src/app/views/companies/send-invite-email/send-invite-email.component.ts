import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormConfig, FormGeneratorModule } from '../../../shared';
import { getInviteEmailFormConfig } from './send-invite-email.utils';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-send-invite-email',
  templateUrl: './send-invite-email.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    FormGeneratorModule,
    TranslateModule,
    MatButtonModule
  ],
  styleUrls: ['./send-invite-email.component.scss']
})
export class SendInviteEmailComponent {
  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SendInviteEmailComponent>
  ) {
    this.formConfig = getInviteEmailFormConfig();
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }


  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.dialogRef.close(this.form.get('email').value);
  }
}
