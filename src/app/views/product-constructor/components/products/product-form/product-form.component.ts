import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { IconDirective } from '@coreui/icons-angular';

import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { Product } from '../../../models';
import { 
  ProductService, 
  BundleService, 
  RegionService,
  CountryService 
} from '../../../services';
import { 
  getProductFormConfig,
  getProductCreateRequest,
  getProductUpdateRequest
} from './product-form.utils';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorComponent,
    IconDirective
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  productForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private bundleService: BundleService,
    private regionService: RegionService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.formConfig = getProductFormConfig(
      this.product,
      this.isEditing,
      this.bundleService,
      this.regionService,
      this.countryService
    );
  }

  get isEditing(): boolean {
    return !!this.product;
  }

  onFormChanges(form: FormGroup): void {
    this.productForm = form;
  }

  onSubmit(): void {
    if (!this.productForm?.valid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.productForm.value;
    
    const operation$ = this.isEditing
      ? this.productService.updateProduct(
          this.product!.id, 
          getProductUpdateRequest(formValue)
        )
      : this.productService.createProduct(
          getProductCreateRequest(formValue)
        );

    operation$.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.save.emit();
      },
      error: (error) => {
        this.error = this.getErrorMessage(error);
        console.error('Error saving product:', error);
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