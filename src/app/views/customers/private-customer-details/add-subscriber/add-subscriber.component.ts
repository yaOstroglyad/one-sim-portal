import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { NgIf } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { FormConfig, FormGeneratorModule } from '../../../../shared';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { getAddSubscriberFormConfig } from './add-subscriber.utils';
import { SubscriberDataService } from '../../../../shared/services/subscriber-data.service';
import { ProvidersDataService } from '../../../../shared/services/providers-data.service';
import { ProductsDataService } from '../../../../shared/services/products-data.service';

@Component({
  selector: 'app-add-subscriber',
  templateUrl: './add-subscriber.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    FormGeneratorModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    NgIf,
    LoaderComponent,
    TranslateModule
  ],
  styleUrls: ['./add-subscriber.component.scss']
})
export class AddSubscriberComponent implements OnInit {
  subscriberDataService = inject(SubscriberDataService);
  providersDataService = inject(ProvidersDataService);
  productsDataService = inject(ProductsDataService);
  
  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { customerId: string },
    public dialogRef: MatDialogRef<AddSubscriberComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const providers$ = this.providersDataService.list();
    const products$ = this.productsDataService.list();
    
    this.formConfig = getAddSubscriberFormConfig(providers$, products$);
    this.loading = false;
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
      this.loading = true;
      
      const formValue = this.form.value;
      const payload = {
        customerId: this.data.customerId,
        serviceProviderId: formValue.serviceProvider.id,
        productId: formValue.product.id,
        subscriberName: formValue.subscriberName,
        email: formValue.email
      };
      
      this.subscriberDataService.createSubscriber(payload).subscribe({
        next: (response) => {
          this.snackBar.open('Subscriber created successfully', null, {
            panelClass: 'app-notification-success',
            duration: 3000
          });
        },
        error: (error) => {
          const errorMessage = error?.error?.message || 'An error occurred during subscriber creation.';
          this.snackBar.open(errorMessage, null, {
            panelClass: 'app-notification-error',
            duration: 3000
          });
        },
        complete: () => {
          this.loading = false;
          this.dialogRef.close(true);
        }
      });
    } else {
      console.warn('Form is invalid. Cannot submit.');
    }
  }
} 