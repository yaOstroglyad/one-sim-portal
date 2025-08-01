# FormGenerator Component Documentation

## Overview

FormGenerator is a dynamic form component that creates reactive forms based on configuration objects. It supports various field types, validation, conditional logic, and dynamic data loading.

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

### Static Dependencies

For simple static dependencies (like the bundle type/unit example):

```typescript
{
  type: FieldType.select,
  name: 'unitType',
  label: 'Unit Type',
  options: (values: Record<string, any>) => {
    const selectedType = values['type'] || 'data';
    const unitTypes = {
      data: [{ value: 'MB', displayValue: 'Megabytes' }],
      voice: [{ value: 'Minutes', displayValue: 'Minutes' }]
    };
    return of(unitTypes[selectedType] || []);
  },
  dependsOnValue: ['type'],
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
  options: (values: Record<string, any>) => {
    const countryId = values['country'];
    if (!countryId) return of([]);
    
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
  dependsOnValue: ['country'],
  validators: [Validators.required]
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