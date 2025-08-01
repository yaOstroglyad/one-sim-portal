import { FieldType, FormConfig } from '../../../../../shared';
import { Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyProduct, CreateCompanyProductRequest, UpdateCompanyProductRequest } from '../../../models';

// Mock data - will be replaced with actual service calls
const mockCompanies = [
  { id: 'company-1', name: 'TechCorp Solutions' },
  { id: 'company-2', name: 'Global Enterprises Inc' },
  { id: 'company-3', name: 'Digital Services Ltd' }
];

const mockProducts = [
  { id: 'product-1', name: 'Europe Business Plan' },
  { id: 'product-2', name: 'Global Roaming Package' },
  { id: 'product-3', name: 'US Data Bundle' }
];

const timeUnits = [
  { value: 'days', displayValue: 'Days' },
  { value: 'hours', displayValue: 'Hours' },
  { value: 'months', displayValue: 'Months' },
  { value: 'years', displayValue: 'Years' }
];

export function getCompanyProductFormConfig(
  companyProduct: CompanyProduct | null = null,
  isEditing: boolean = false
): FormConfig {
  return {
    fields: [
      // Section Title: Product Assignment
      {
        type: FieldType.text,
        name: 'sectionTitle1',
        label: 'Product Assignment',
        value: '',
        invisible: true // This is just a section divider
      },

      // Company Selection
      {
        type: FieldType.select,
        name: 'companyId',
        label: 'Company',
        placeholder: 'Select a company',
        validators: [Validators.required],
        options: of(mockCompanies.map(company => ({
          value: company.id,
          displayValue: company.name
        }))),
        value: companyProduct?.company?.id || '',
        disabled: isEditing
      },

      // Product Selection
      {
        type: FieldType.select,
        name: 'productId',
        label: 'Product',
        placeholder: 'Select a product',
        validators: [Validators.required],
        options: of(mockProducts.map(product => ({
          value: product.id,
          displayValue: product.name
        }))),
        value: companyProduct?.id || '', // In edit mode, this represents the product
        disabled: isEditing
      },

      // Section Title: Product Details
      {
        type: FieldType.text,
        name: 'sectionTitle2',
        label: 'Product Details',
        value: '',
        invisible: true // This is just a section divider
      },

      // Description
      {
        type: FieldType.textarea,
        name: 'description',
        label: 'Description',
        placeholder: 'Enter a custom description for this company product',
        validators: [Validators.maxLength(500)],
        value: companyProduct?.description || '',
        hintMessage: 'This description will be shown to customers of this company'
      },

      // Section Title: Validity Period Override
      {
        type: FieldType.text,
        name: 'sectionTitle3',
        label: 'Validity Period Override',
        value: '',
        invisible: true // This is just a section divider
      },

      // Validity Period
      {
        type: FieldType.number,
        name: 'period',
        label: 'Period',
        placeholder: '30',
        validators: [Validators.required, Validators.min(1)],
        value: companyProduct?.validityPeriod?.period || 30
      },

      // Time Unit
      {
        type: FieldType.select,
        name: 'timeUnit',
        label: 'Time Unit',
        validators: [Validators.required],
        options: of(timeUnits),
        value: companyProduct?.validityPeriod?.timeUnit || 'days'
      }
    ]
  };
}

export function getCompanyProductCreateRequest(formValue: any): CreateCompanyProductRequest {
  return {
    companyId: formValue.companyId,
    productId: formValue.productId,
    description: formValue.description || undefined
  };
}

export function getCompanyProductUpdateRequest(formValue: any): UpdateCompanyProductRequest {
  return {
    description: formValue.description || undefined,
    validityPeriod: {
      period: parseInt(formValue.period),
      timeUnit: formValue.timeUnit
    }
  };
}