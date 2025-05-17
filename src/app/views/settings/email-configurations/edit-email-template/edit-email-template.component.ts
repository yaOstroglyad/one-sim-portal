import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormConfig, FormGeneratorModule } from '../../../../shared';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { EmailTemplate } from '../../../../shared';
import { WhiteLabelDataService } from '../../../../shared';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { getEditEmailTemplateFormConfig, getEmailTemplateRequest } from './edit-email-template.utils';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-email-template',
  templateUrl: './edit-email-template.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    FormGeneratorModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditEmailTemplateComponent implements OnInit {
  public formConfig: FormConfig;
  public isFormValid = false;
  private form: FormGroup;

  constructor(
    private whiteLabelService: WhiteLabelDataService,
    private dialogRef: MatDialogRef<EditEmailTemplateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      template?: EmailTemplate;
      type: string;
      ownerAccountId?: string;
    }
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  public handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }

  public close(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    if (this.isFormValid && this.form) {
      const formValue = this.form.getRawValue();
      const payload = getEmailTemplateRequest(formValue, this.data.type, this.data.ownerAccountId);
      this.dialogRef.close(payload);
    }
  }

  private initForm(): void {
    const templateData = this.data.template ? {
      id: this.data.template.id,
      templateId: this.data.template.templateId,
      subject: this.data.template.subject,
      language: this.data.template.language,
      type: this.data.type
    } : null;

    this.formConfig = getEditEmailTemplateFormConfig(templateData, this.whiteLabelService);
  }
}
