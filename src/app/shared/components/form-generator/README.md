# FormGenerator Component Documentation

## Overview

FormGenerator is a dynamic form component that creates reactive forms based on configuration objects. It supports various field types, validation, conditional logic, and dynamic data loading.

## 🏗️ **Architecture Standards & Best Practices**

### **Mandatory File Structure Pattern**

When creating forms with form-generator, follow this **required structure**:

```
component-name/
├── component-name.component.ts    # Component logic, service injection, submission
├── component-name.component.html  # Minimal template with <app-form-generator>
├── component-name.component.scss  # Component-specific styles
└── component-name.utils.ts        # Form configuration & data transformation
```

### **🚨 Critical Requirements**

1. **Use `inject()` pattern** - NEVER use constructor injection
2. **Extract form config to `.utils.ts`** - NEVER inline form configuration
3. **Standalone components only** - NO NgModules
4. **OnPush change detection** - Mandatory for performance
5. **Separate data transformation** - Utils handle form ↔ API conversions

---

## 📋 **Component Implementation Template**

### **1. Component File (`component.ts`)**

```typescript
import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { YourService } from '../../services';
import { YourModel } from '../../models';
import { FormGeneratorComponent, FormConfig } from '../../../../shared';
import { getYourFormConfig, getYourCreateRequest, getYourUpdateRequest } from './your-form.utils';

@Component({
  selector: 'app-your-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormGeneratorComponent
  ],
  templateUrl: './your-form.component.html',
  styleUrls: ['./your-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YourFormComponent implements OnInit {
  private yourService = inject(YourService);
  private cdr = inject(ChangeDetectorRef);

  @Input() item: YourModel | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  form: FormGroup;
  loading = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.item;
    this.formConfig = getYourFormConfig(this.item, this.isEditMode);
  }

  onFormChanges(form: FormGroup): void {
    this.form = form;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.form || this.form.invalid || this.loading) return;

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.form.getRawValue();

    const operation$ = this.isEditMode && this.item
      ? this.yourService.update(this.item.id, getYourUpdateRequest(formValue))
      : this.yourService.create(getYourCreateRequest(formValue));

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
        this.cdr.markForCheck();
      }
    });
  }

  private handleError(error: any): void {
    console.error('Error saving:', error);
    // Handle specific API errors (409 conflicts, validation errors, etc.)
  }
}
```

### **2. Template File (`component.html`)**

```html
<app-form-generator 
  [config]="formConfig"
  (formChanges)="onFormChanges($event)">
</app-form-generator>
```

### **3. Utils File (`component.utils.ts`)**

```typescript
import { Validators } from '@angular/forms';
import { FormConfig, FieldConfig, FieldType } from '../../../../shared';
import { YourModel, CreateYourRequest, UpdateYourRequest } from '../../models';

/**
 * Creates form configuration for your form
 */
export function getYourFormConfig(item: YourModel | null = null, isEditMode: boolean = false): FormConfig {
  const fields: FieldConfig[] = [
    {
      type: FieldType.text,
      name: 'name',
      label: 'your.name',
      placeholder: 'your.namePlaceholder',
      value: item?.name || '',
      disabled: isEditMode, // Disable critical fields in edit mode
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ],
      hintMessage: !isEditMode ? 'your.nameHint' : undefined
    },
    {
      type: FieldType.textarea,
      name: 'description',
      label: 'your.description',
      placeholder: 'your.descriptionPlaceholder',
      value: item?.description || '',
      validators: [
        Validators.required,
        Validators.maxLength(500)
      ]
    }
    // Add more fields as needed
  ];

  return { fields };
}

/**
 * Transforms form values to create request
 */
export function getYourCreateRequest(formValue: any): CreateYourRequest {
  return {
    name: formValue.name,
    description: formValue.description
    // Transform other fields as needed
  };
}

/**
 * Transforms form values to update request
 */
export function getYourUpdateRequest(formValue: any): UpdateYourRequest {
  return {
    description: formValue.description
    // Usually fewer fields for updates
  };
}

/**
 * Gets initial form values from model
 */
export function getYourInitialValues(item: YourModel | null): any {
  if (!item) {
    return {
      name: '',
      description: ''
    };
  }

  return {
    name: item.name,
    description: item.description || ''
  };
}
```

### **4. Export Pattern (`index.ts`)**

Always export utilities in component index.ts:

```typescript
export * from './your-component/your-component.component';
export * from './your-component/your-component.utils';
```

---

## Basic Usage

```typescript
import { FormGeneratorComponent, FormConfig, FieldType } from '../../../shared';

@Component({
  template: `
    <app-form-generator 
      [config]="formConfig" 
      (formChanges)="onFormChanges($event)">
    </app-form-generator>
  `
})
export class MyComponent {
  formConfig: FormConfig = {
    fields: [
      {
        type: FieldType.text,
        name: 'name',
        label: 'Name',
        validators: [Validators.required]
      }
    ]
  };

  onFormChanges(form: FormGroup) {
    console.log('Form value:', form.value);
  }
}
```

## Field Types

### Supported Field Types

- `FieldType.text` - Text input
- `FieldType.email` - Email input with validation
- `FieldType.password` - Password input
- `FieldType.number` - Number input
- `FieldType.textarea` - Multi-line text input
- `FieldType.select` - Dropdown selection
- `FieldType.checkbox` - Boolean checkbox
- `FieldType.datepicker` - Date picker
- `FieldType.formArray` - Dynamic array of form groups
- `FieldType.chips` - Tag/chip input
- `FieldType.color` - Color picker
- `FieldType.richText` - Rich text editor
- `FieldType.multiselectGrid` - Multi-selection grid
- `FieldType.fileUpload` - File upload with drag-and-drop

## Field Dependencies & HTTP Integration

FormGenerator supports powerful field dependencies where child fields can dynamically load options based on parent field values. This is essential for creating cascading dropdowns and conditional forms.

### 🔑 Key Properties for Dependencies

```typescript
interface FieldConfig {
  dependsOnValue: string[];        // 🎯 Array of parent field names
  disabled?: boolean;              // 🔒 Initially disabled until parent has value
  options: (values: Record<string, any>) => Observable<SelectOption[]>; // 🚀 Dynamic function
}
```

### ⚠️ Important Rules

1. **Use `dependsOnValue` (not `dependsOn`)** - This is the correct property name
2. **Use function for `options`** - Not static array/Observable  
3. **Set `disabled: true`** - Child fields should be initially disabled
4. **Return `of([])` when no parent value** - Always return empty Observable, not undefined

### Static Dependencies

For simple static dependencies (like the bundle type/unit example):

```typescript
{
  type: FieldType.select,
  name: 'unitType',
  label: 'Unit Type',
  dependsOnValue: ['type'],          // 🔑 Depends on 'type' field
  disabled: true,                    // 🔒 Initially disabled
  options: (values: Record<string, any>) => {
    const selectedType = values['type'] || 'data';
    const unitTypes = {
      data: [{ value: 'MB', displayValue: 'Megabytes' }],
      voice: [{ value: 'Minutes', displayValue: 'Minutes' }]
    };
    return of(unitTypes[selectedType] || []); // 🚀 Static data wrapped in Observable
  },
  validators: [Validators.required]
}
```

### HTTP Dependencies

For dynamic data loading from APIs:

```typescript
{
  type: FieldType.select,
  name: 'region',
  label: 'Region',
  dependsOnValue: ['country'],          // 🔑 Depends on 'country' field
  disabled: true,                       // 🔒 Initially disabled
  options: (values: Record<string, any>) => {
    const countryId = values['country'];
    if (!countryId) return of([]);      // 🚀 Return empty when no parent value
    
    // HTTP request with proper error handling
    return this.regionService.getRegionsByCountry(countryId).pipe(
      map(regions => regions.map(r => ({
        value: r.id,
        displayValue: r.name
      }))),
      startWith([]), // Show empty list while loading
      catchError(error => {
        console.error('Failed to load regions:', error);
        return of([]); // Fallback to empty array
      })
    );
  },
  validators: [Validators.required]
}
```

### Real-World Examples

#### Example 1: Company → Product Dependency (from company-product-form)

```typescript
// Parent field: Company selection
{
  type: FieldType.select,
  name: 'companyId',
  label: 'Company',
  placeholder: 'Select a company',
  validators: [Validators.required],
  options: accountsService.ownerAccounts().pipe(
    map(accounts => accounts.map(account => ({
      value: account.id,
      displayValue: account.name || account.email || account.id
    })))
  )
}

// Child field: Available products for selected company
{
  type: FieldType.select,
  name: 'productId',
  label: 'Product',
  placeholder: 'Select a product',
  dependsOnValue: ['companyId'],        // 🔑 Depends on company selection
  disabled: true,                       // 🔒 Initially disabled
  validators: [Validators.required],
  options: (values: any) => {
    const { companyId } = values;
    if (!companyId || !companyProductService) return of([]); // 🚀 Empty when no company
    
    return companyProductService.getMissingCoreProducts(companyId).pipe(
      map(products => {
        if (products.length === 0) {
          return [{
            value: '',
            displayValue: 'All products have been added to this company',
            disabled: true
          }];
        }
        return products.map(product => ({
          value: product.id,
          displayValue: product.name
        }));
      }),
      catchError(() => of([])) // 🛡️ Error handling
    );
  }
}
```

#### Example 2: Product → Tariff Offers Dependency

```typescript
// Parent field: Product selection (already defined above)

// Child field: Available tariff offers for selected product
{
  type: FieldType.select,
  name: 'tariffOfferId',
  label: 'Tariff Offer',
  placeholder: 'Select a tariff offer',
  dependsOnValue: ['productId'],        // 🔑 Depends on product selection
  disabled: true,                       // 🔒 Initially disabled
  validators: [Validators.required],
  options: (values: any) => {
    const { productId } = values;
    if (!productId || !tariffOfferService) return of([]); // 🚀 Empty when no product
    
    return tariffOfferService.getActiveTariffOffers(productId).pipe(
      map((offers: ActiveTariffOffer[]) => 
        offers.map((offer, index) => ({
          value: offer.id || `${offer.productId}_${index}`,
          displayValue: `${offer.serviceProvider.name} - ${offer.price} ${offer.currency.toUpperCase()}`
        }))
      ),
      catchError(() => of([])) // 🛡️ Error handling
    );
  }
}
```

#### Example 3: Service Provider → Products Filter (from edit-customer.utils.ts)

```typescript
{
  type: FieldType.select,
  name: 'productId',
  label: 'Product',
  dependsOnValue: ['serviceProviderId'], // 🔑 Depends on service provider
  disabled: true,                        // 🔒 Initially disabled  
  validators: [],
  options: (values) => {
    const { serviceProviderId } = values;
    if (!serviceProviderId) return of([]); // 🚀 Empty when no provider

    return productsDataService.listFiltered({
      serviceProviderId: serviceProviderId
    }).pipe(
      map(products => products.map(p => ({
        value: p.id,
        displayValue: p.name
      }))),
      catchError(() => of([])) // 🛡️ Error handling
    );
  }
}
```

### Advanced HTTP Patterns

#### 1. Loading States

```typescript
{
  type: FieldType.select,
  name: 'cities',
  label: 'Cities',
  options: (values: Record<string, any>) => {
    const regionId = values['region'];
    if (!regionId) return of([]);
    
    return this.locationService.getCities(regionId).pipe(
      startWith([{ value: '', displayValue: 'Loading cities...' }]),
      map(cities => cities.map(c => ({ value: c.id, displayValue: c.name }))),
      catchError(() => of([{ value: '', displayValue: 'Failed to load cities' }]))
    );
  },
  dependsOnValue: ['region']
}
```

#### 2. Caching & Performance

```typescript
{
  type: FieldType.select,
  name: 'products',
  label: 'Products',
  options: (values: Record<string, any>) => {
    const categoryId = values['category'];
    
    return this.productService.getProductsByCategory(categoryId).pipe(
      shareReplay(1), // Cache the result
      map(products => products.map(p => ({ 
        value: p.id, 
        displayValue: p.name 
      })))
    );
  },
  dependsOnValue: ['category']
}
```

#### 3. Multiple Dependencies

```typescript
{
  type: FieldType.select,
  name: 'availableSlots',
  label: 'Available Time Slots',
  options: (values: Record<string, any>) => {
    const { doctorId, date, serviceType } = values;
    
    // Only load when all dependencies are present
    if (!doctorId || !date || !serviceType) return of([]);
    
    return this.appointmentService.getAvailableSlots({
      doctorId,
      date,
      serviceType
    }).pipe(
      debounceTime(300), // Wait for user to stop typing/selecting
      map(slots => slots.map(slot => ({
        value: slot.id,
        displayValue: `${slot.time} - ${slot.duration}min`
      })))
    );
  },
  dependsOnValue: ['doctorId', 'date', 'serviceType']
}
```

#### 4. Search with HTTP

```typescript
{
  type: FieldType.select,
  name: 'customer',
  label: 'Customer',
  options: (values: Record<string, any>) => {
    const searchTerm = values['customerSearch'];
    
    if (!searchTerm || searchTerm.length < 2) return of([]);
    
    return this.customerService.searchCustomers(searchTerm).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => 
        this.customerService.search(term).pipe(
          catchError(() => of([]))
        )
      ),
      map(customers => customers.map(c => ({
        value: c.id,
        displayValue: `${c.name} (${c.email})`
      })))
    );
  },
  dependsOnValue: ['customerSearch']
}
```

## FormArray with Dependencies

FormArray items also support field dependencies:

```typescript
{
  type: FieldType.formArray,
  name: 'usageUnits',
  label: 'Usage Units',
  arrayConfig: {
    itemConfig: {
      fields: [
        {
          type: FieldType.select,
          name: 'type',
          label: 'Type',
          options: of([
            { value: 'data', displayValue: 'Data' },
            { value: 'voice', displayValue: 'Voice' }
          ]),
          inputEvent: (event, formGenerator, field) => {
            // Update dependent field when type changes
            const unitTypeControl = formGenerator.form.get('unitType');
            if (unitTypeControl) {
              unitTypeControl.setValue(getDefaultUnit(event.value));
            }
          }
        },
        {
          type: FieldType.select,
          name: 'unitType',
          label: 'Unit',
          options: (values) => {
            const type = values['type'] || 'data';
            return this.unitService.getUnitsForType(type);
          },
          dependsOnValue: ['type']
        }
      ]
    }
  }
}
```

### 🚀 How Dependencies Work Automatically

FormGenerator handles all dependency logic automatically:

1. **User selects parent field** (e.g., Company)
2. **FormGenerator detects change** in `companyId` field
3. **FormGenerator finds dependent fields** with `dependsOnValue: ['companyId']`
4. **FormGenerator calls `options(currentFormValues)`** function for dependent fields
5. **HTTP request is made** and options are loaded
6. **Child field is enabled** automatically if options are available
7. **Process repeats** for multi-level dependencies (Company → Product → TariffOffer)

### 🛠️ Implementation Checklist

When creating field dependencies:

✅ **Use `dependsOnValue: ['parentField']`** (not `dependsOn`)  
✅ **Set `disabled: true`** for child fields  
✅ **Use function for `options`**: `(values) => Observable<SelectOption[]>`  
✅ **Return `of([])` when no parent value**  
✅ **Add proper error handling** with `catchError(() => of([]))`  
✅ **Inject required services** in your component constructor  
✅ **Pass services to form config** creation function  

❌ **Don't use static `options`** for dependent fields  
❌ **Don't forget error handling** - forms will break  
❌ **Don't manually subscribe to valueChanges** - FormGenerator handles it  
❌ **Don't use `dependsOn`** - use `dependsOnValue` instead  

### 🔧 Troubleshooting Common Issues

#### Issue 1: "Field not loading options"
**Problem**: Using `dependsOn` instead of `dependsOnValue`
```typescript
// ❌ Wrong
dependsOn: ['parentField']

// ✅ Correct  
dependsOnValue: ['parentField']
```

#### Issue 2: "Field stays disabled"
**Problem**: Not returning empty Observable when parent is empty
```typescript
// ❌ Wrong
if (!parentValue) return; // undefined breaks FormGenerator

// ✅ Correct
if (!parentValue) return of([]); // Empty Observable
```

#### Issue 3: "Options not updating"
**Problem**: Using static options instead of function
```typescript
// ❌ Wrong - static Observable
options: this.service.getOptions()

// ✅ Correct - dynamic function
options: (values) => this.service.getOptions(values.parentField)
```

## Best Practices

### 1. Error Handling
Always provide fallback values and error handling for HTTP dependencies:

```typescript
options: (values) => {
  return this.apiService.getData(values.param).pipe(
    catchError(error => {
      console.error('API Error:', error);
      this.notificationService.showError('Failed to load data');
      return of([]); // Always return an array
    })
  );
}
```

### 2. Loading States
Provide immediate feedback to users:

```typescript
options: (values) => {
  return this.apiService.getData(values.param).pipe(
    startWith([{ value: '', displayValue: 'Loading...' }]),
    finalize(() => {
      // Hide loading indicator
    })
  );
}
```

### 3. Performance
Use debouncing and caching for better performance:

```typescript
options: (values) => {
  return this.apiService.getData(values.param).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    shareReplay(1)
  );
}
```

### 4. Validation
Validate dependent fields when parent values change:

```typescript
inputEvent: (event, formGenerator, field) => {
  const dependentControl = formGenerator.form.get('dependentField');
  if (dependentControl) {
    dependentControl.updateValueAndValidity();
  }
}
```

## Memory Management

The FormGenerator automatically handles subscriptions and memory leaks:

- All HTTP subscriptions are automatically unsubscribed when the component is destroyed
- Uses `takeUntil(destroy$)` pattern for proper cleanup
- No manual subscription management required

## Configuration Reference

### FieldConfig Interface

```typescript
interface FieldConfig {
  type: FieldType;
  name: string;
  label: string;
  
  // Static or dynamic options
  options?: Observable<SelectOption[]> | ((values: Record<string, any>) => Observable<SelectOption[]>);
  
  // Field dependencies
  dependsOnValue?: string[];
  
  // Event handling
  inputEvent?: (event: any, formGenerator: any, field: FieldConfig) => void;
  
  // Validation
  validators?: ValidatorFn[];
  
  // Styling
  className?: string;
  hintMessage?: string;
}
```

### HTTP Service Integration

To use HTTP services in field options, inject them in your component and reference them in the configuration:

```typescript
constructor(
  private regionService: RegionService,
  private productService: ProductService
) {}

getFormConfig(): FormConfig {
  return {
    fields: [
      {
        // ... field config with this.regionService.method() ...
      }
    ]
  };
}
```

## File Upload Field

The `FieldType.fileUpload` provides a drag-and-drop file upload interface that integrates seamlessly with reactive forms.

### Basic File Upload

```typescript
{
  type: FieldType.fileUpload,
  name: 'uploadFile',
  label: 'Upload File',
  fileUploadConfig: {
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
    dropZoneText: 'Drag and drop your file here, or click to browse',
    supportedFormatsText: 'Supported formats: CSV, Excel (.xlsx, .xls)',
    chooseFileButtonText: 'Choose File',
    showUploadButton: false,
    autoUpload: false
  },
  validators: [Validators.required]
}
```

### File Upload with Custom Handler

```typescript
{
  type: FieldType.fileUpload,
  name: 'uploadFile',
  label: 'Upload Provider Products',
  fileUploadConfig: {
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
    showUploadButton: true,
    autoUpload: false
  },
  inputEvent: (event, formGenerator, field) => {
    if (event.type === 'upload') {
      // Handle file upload
      this.uploadService.uploadFile(event.file).subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
        },
        error: (error) => {
          console.error('Upload failed:', error);
        }
      });
    } else if (event.type === 'clear') {
      // Handle file clear
      console.log('File cleared');
    } else {
      // Handle file selection (File object)
      console.log('File selected:', event.name);
    }
  },
  validators: [Validators.required]
}
```

### File Upload Configuration Options

```typescript
interface FileUploadConfig {
  acceptedFormats: string[];           // Array of accepted file extensions
  maxFileSize?: number;                // Maximum file size in bytes
  dropZoneText?: string;               // Text shown in drop zone
  supportedFormatsText?: string;       // Text showing supported formats
  chooseFileButtonText?: string;       // Text for choose file button
  uploadButtonText?: string;           // Text for upload button
  showUploadButton?: boolean;          // Whether to show upload button
  autoUpload?: boolean;                // Whether to auto-upload on file selection
}
```

### Integration with Services

```typescript
// In your component
constructor(
  private uploadService: UploadService
) {}

getFormConfig(): FormConfig {
  return {
    fields: [
      {
        type: FieldType.fileUpload,
        name: 'bulkUpload',
        label: 'Bulk Upload',
        fileUploadConfig: {
          acceptedFormats: ['.csv', '.xlsx'],
          showUploadButton: true
        },
        inputEvent: (event, formGenerator, field) => {
          if (event.type === 'upload') {
            this.handleFileUpload(event.file);
          }
        }
      }
    ]
  };
}

handleFileUpload(file: File): void {
  this.uploadService.uploadFile(file).subscribe({
    next: (response) => {
      // Handle successful upload
      this.notificationService.showSuccess('File uploaded successfully');
    },
    error: (error) => {
      // Handle upload error
      this.notificationService.showError('Upload failed');
    }
  });
}
```