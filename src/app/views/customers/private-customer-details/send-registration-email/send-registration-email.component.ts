import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FieldType, FormConfig, FormGeneratorModule, SubscriberDataService, PurchasedProductsDataService, InfoStripComponent } from '../../../../shared';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-send-registration-email',
  standalone: true,
  templateUrl: './send-registration-email.component.html',
  styleUrls: ['./send-registration-email.component.scss'],
  imports: [FormGeneratorModule, MatDialogModule, TranslateModule, ReactiveFormsModule, MatButtonModule, InfoStripComponent, CommonModule]
})
export class SendRegistrationEmailComponent implements OnInit {
  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean = false;
  hasActiveProducts: boolean = false;
  isLoadingProducts: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    public dialogRef: MatDialogRef<SendRegistrationEmailComponent>,
    private snackBar: MatSnackBar,
    private subscriberDataService: SubscriberDataService,
    private purchasedProductsDataService: PurchasedProductsDataService
  ) {}

  ngOnInit(): void {
    this.checkActiveProducts();
  }

  private checkActiveProducts(): void {
    this.purchasedProductsDataService.getPurchasedProducts({ subscriberId: this.data.id, isActive: true }).subscribe({
      next: (products) => {
        this.hasActiveProducts = products && products.length > 0;
        this.isLoadingProducts = false;
        
        if (this.hasActiveProducts) {
          this.formConfig = this.getFormConfig();
        }
      },
      error: () => {
        this.hasActiveProducts = false;
        this.isLoadingProducts = false;
      }
    });
  }

  getFormConfig(): FormConfig {
    return {
      fields: [
        {
          type: FieldType.uuid,
          name: 'subscriberId',
          label: 'ID',
          value: this.data.id,
          invisible: true
        },
        {
          type: FieldType.email,
          name: 'email',
          label: 'Email',
          validators: [Validators.required, Validators.email],
          placeholder: 'Enter email'
        }
      ]
    };
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.isFormValid) {
      const email = this.form.value.email;
      this.sendEmail(this.data.id, email);
    }
  }

  sendEmail(subscriberId: string, email: string): void {
    this.subscriberDataService.sendRegistrationEmail(subscriberId, email).subscribe({
      next: () => {
        this.snackBar.open('Registration email sent successfully', null, {
          panelClass: 'app-notification-success',
          duration: 3000
        });
        this.close();
      },
      error: (error) => {
        const errorMessage = error?.error?.message || 'An error occurred while sending registration email.';
        this.snackBar.open(errorMessage, null, {
          panelClass: 'app-notification-error',
          duration: 3000
        });
      }
    });
  }
}
