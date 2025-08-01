import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';

import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { CompanyProductService, ProductService } from '../../../services';
import { CompanyProduct } from '../../../models';
import { AccountsDataService } from '../../../../../shared/services/accounts-data.service';
import { AuthService, ADMIN_PERMISSION } from '../../../../../shared/auth/auth.service';
import { 
  getCompanyProductFormConfig,
  getCompanyProductCreateRequest,
  getCompanyProductUpdateRequest
} from './company-product-form.utils';

@Component({
  selector: 'app-company-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorComponent,
    IconDirective
  ],
  templateUrl: './company-product-form.component.html',
  styleUrls: ['./company-product-form.component.scss']
})
export class CompanyProductFormComponent implements OnInit {

  @Input() companyProduct: CompanyProduct | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  companyProductForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private companyProductService: CompanyProductService,
    private accountsService: AccountsDataService,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
    this.formConfig = getCompanyProductFormConfig(
      this.companyProduct, 
      this.isEditing, 
      this.accountsService, 
      isAdmin,
      this.productService
    );
  }

  get isEditing(): boolean {
    return !!this.companyProduct;
  }

  onFormChanges(form: FormGroup): void {
    this.companyProductForm = form;
  }

  onSubmit(): void {
    if (!this.companyProductForm?.valid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.companyProductForm.value;
    
    const operation$ = this.isEditing
      ? this.companyProductService.updateCompanyProduct(
          this.companyProduct!.id, 
          getCompanyProductUpdateRequest(formValue)
        )
      : this.companyProductService.createCompanyProduct(
          getCompanyProductCreateRequest(formValue)
        );

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error saving company product:', error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}