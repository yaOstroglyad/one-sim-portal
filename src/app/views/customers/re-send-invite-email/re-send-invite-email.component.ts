import { Component, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormConfig } from '../../../shared/model/field-config';
import { getResendInviteEmailFormConfig } from './re-send-invite-email.utils';

@Component({
  selector: 'app-re-send-invite-email',
  templateUrl: './re-send-invite-email.component.html',
  styleUrls: ['./re-send-invite-email.component.scss']
})
export class ReSendInviteEmailComponent {
  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReSendInviteEmailComponent>
  ) {
    this.formConfig = getResendInviteEmailFormConfig();
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
