import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  SubscriberDataService
} from '@shared';
import { NotificationService } from '@shared/services/ui/notification.service';
import { AddSubscriberProductService } from '../add-subscriber-product/add-subscriber-product.service';

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
    styleUrls: ['./add-subscriber.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSubscriberComponent implements OnInit {
  private readonly subscriberDataService = inject(SubscriberDataService);
  private readonly addSubscriberProductService = inject(AddSubscriberProductService);
  private readonly dialogRef = inject(MatDialogRef<AddSubscriberComponent>);
  private readonly notification = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly data = inject<{ customerId: string; email: string; subscriberId: string }>(MAT_DIALOG_DATA);

  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean;
  loading = false;

  ngOnInit(): void {
    this.formConfig = getAddSubscriberFormConfig(this.addSubscriberProductService, this.data.subscriberId);
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
      this.cdr.markForCheck();

      const formValue = this.form.value;
      const payload = {
        customerId: this.data.customerId,
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
          this.cdr.markForCheck();
          this.notification.error('errors.subscriberCreateFailed');
        }
      });
    }
  }
}
