import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { getAddSubscriberFormConfig } from './add-subscriber.utils';
import {
  FormConfig,
  FormGeneratorComponent,
  ProductsDataService,
  ProvidersDataService,
  SubscriberDataService
} from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';

@Component({
    standalone: true,
    selector: 'app-add-subscriber',
    templateUrl: './add-subscriber.component.html',
    imports: [
    MatDialogModule,
    FormGeneratorComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    LoaderComponent,
    TranslateModule
],
    styleUrls: ['./add-subscriber.component.scss']
})
export class AddSubscriberComponent implements OnInit {
  private readonly subscriberDataService = inject(SubscriberDataService);
  private readonly providersDataService = inject(ProvidersDataService);
  private readonly productsDataService = inject(ProductsDataService);
  private readonly dialogRef = inject(MatDialogRef<AddSubscriberComponent>);
  private readonly notification = inject(NotificationService);
  readonly data = inject<{ customerId: string, email: string }>(MAT_DIALOG_DATA);

  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;
  loading = true;

  ngOnInit(): void {
    const providers$ = this.providersDataService.list();

    this.formConfig = getAddSubscriberFormConfig(
      providers$,
      this.productsDataService,
      this.data.customerId
    );
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
        serviceProviderId: formValue.serviceProviderId,
        productId: formValue.productId,
        subscriberName: formValue.subscriberName,
        email: formValue.email
      };

      this.subscriberDataService.createSubscriber(payload).subscribe({
        next: () => {
          this.notification.success('notifications.subscriberCreated');
          this.loading = false;
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
          this.notification.error('errors.subscriberCreateFailed');
        }
      });
    }
  }
}
