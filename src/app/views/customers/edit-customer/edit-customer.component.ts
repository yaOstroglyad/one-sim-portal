import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import {
  ProvidersDataService,
  FormConfig,
  ProductsDataService,
  FormGeneratorComponent,
  AccountsDataService,
  UserRoleService
} from '@shared';
import { Subject } from 'rxjs';
import { getCustomerCreateRequest, getEditCustomerFormConfig } from './edit-customer.utils';

@Component({
  standalone: true,
  selector: 'app-edit-customer',
  imports: [
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    FormGeneratorComponent
  ],
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditCustomerComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<EditCustomerComponent>);
  private readonly providersDataService = inject(ProvidersDataService);
  private readonly productsDataService = inject(ProductsDataService);
  private readonly accountsDataService = inject(AccountsDataService);
  private readonly userRoleService = inject(UserRoleService);
  readonly data = inject(MAT_DIALOG_DATA);

  private readonly destroy$ = new Subject<void>();

  formConfig: FormConfig;
  form: FormGroup;
  isFormValid = false;
  isAdmin = this.userRoleService.isAdmin();

  ngOnInit(): void {
    this.formConfig = getEditCustomerFormConfig(
      this.providersDataService,
      this.productsDataService,
      this.data,
      this.isAdmin,
      this.accountsDataService
    );
  }

  handleFormChanges(form: FormGroup): void {
    this.form = form;
    this.isFormValid = form.valid;
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(getCustomerCreateRequest(this.form.value, this.isAdmin));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
