import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormConfig,
  FormGeneratorComponent,
  UserRoleService,
  CompaniesDataService,
  Company
} from '@shared';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CompanyProductService } from '../../product-constructor/services';
import { getCustomerCreateRequest, getEditCustomerFormConfig, getProductOptions$ } from './edit-customer.utils';

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
  private readonly companyProductService = inject(CompanyProductService);
  private readonly companiesDataService = inject(CompaniesDataService);
  private readonly userRoleService = inject(UserRoleService);
  readonly data = inject(MAT_DIALOG_DATA);

  private readonly destroy$ = new Subject<void>();

  @ViewChild(FormGeneratorComponent) formGenerator: FormGeneratorComponent;

  formConfig: FormConfig;
  form: FormGroup;
  isFormValid = false;
  isAdmin = this.userRoleService.isAdmin();

  ngOnInit(): void {
    this.formConfig = getEditCustomerFormConfig(
      this.companyProductService,
      this.data,
      this.isAdmin,
      this.companiesDataService
    );
  }

  private setupCompanyChangeListener(): void {
    if (!this.isAdmin || !this.form) {
      return;
    }

    const companyControl = this.form.get('company');
    if (!companyControl) {
      return;
    }

    companyControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      filter((company: Company) => !!company?.accountId)
    ).subscribe((company: Company) => {
      // Reset product selection when company changes
      this.form.get('productId')?.setValue(null);

      // Load products for the selected company
      this.formGenerator?.setSearchableSelectLoading('productId', true);

      getProductOptions$(this.companyProductService, company.accountId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (options) => {
          this.formGenerator?.updateSearchableSelectOptions('productId', options);
        },
        error: () => {
          this.formGenerator?.updateSearchableSelectOptions('productId', []);
        }
      });
    });
  }

  handleFormChanges(form: FormGroup): void {
    const isFirstFormInit = !this.form;
    this.form = form;
    this.isFormValid = form.valid;

    // Setup company change listener once form is available
    if (isFirstFormInit && this.isAdmin) {
      this.setupCompanyChangeListener();
    }
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
