# Info Strip Component Examples

## Basic Examples

### Simple Information Message
```html
<app-info-strip text="Your data has been saved successfully"></app-info-strip>
```

### Warning Message
```html
<app-info-strip 
  icon="warning"
  text="This action cannot be undone"
  type="warning">
</app-info-strip>
```

### Error Alert
```html
<app-info-strip 
  icon="error"
  text="Failed to save changes. Please try again."
  type="alert">
</app-info-strip>
```

## Advanced Examples

### HTML Content Support
```html
<!-- Plain text - displays as text -->
<app-info-strip 
  text="This is plain text without any HTML tags"
  type="primary">
</app-info-strip>

<!-- HTML content - renders as HTML -->
<app-info-strip 
  text="Need help? Visit our <a href='/support' target='_blank'>support center</a> or <strong>contact us</strong>"
  type="primary">
</app-info-strip>
```

### Custom Icons
```html
<!-- Success message with check icon -->
<app-info-strip 
  icon="check_circle"
  text="Email sent successfully"
  type="primary">
</app-info-strip>

<!-- Network issue with wifi icon -->
<app-info-strip 
  icon="wifi_off"
  text="Network connection required"
  type="warning">
</app-info-strip>

<!-- Security alert with shield icon -->
<app-info-strip 
  icon="security"
  text="Your session will expire in 5 minutes"
  type="alert">
</app-info-strip>
```

## Integration Examples

### In Dialog Components
```typescript
// Component
@Component({
  imports: [InfoStripComponent, MatDialogModule]
})
export class MyDialogComponent {
  showError = false;
  errorMessage = '';
}
```

```html
<!-- Template -->
<mat-dialog-content>
  <app-info-strip 
    *ngIf="showError"
    [text]="errorMessage"
    type="alert">
  </app-info-strip>
  
  <!-- Other dialog content -->
</mat-dialog-content>
```

### In Forms
```html
<form>
  <app-info-strip 
    icon="info"
    text="All fields marked with * are required"
    type="primary">
  </app-info-strip>
  
  <!-- Form fields -->
</form>
```

### Conditional Display
```typescript
// Component
export class ProductListComponent {
  products: Product[] = [];
  isLoading = false;
  hasError = false;
  
  get showNoProductsMessage(): boolean {
    return !this.isLoading && this.products.length === 0 && !this.hasError;
  }
}
```

```html
<!-- Template -->
<div>
  <app-info-strip 
    *ngIf="hasError"
    icon="error"
    text="Unable to load products. Please refresh the page."
    type="alert">
  </app-info-strip>
  
  <app-info-strip 
    *ngIf="showNoProductsMessage"
    icon="inbox"
    text="No products available at the moment"
    type="primary">
  </app-info-strip>
  
  <!-- Product list -->
</div>
```

## Real-world Use Cases

### Registration Email Feature
```html
<app-info-strip 
  *ngIf="!hasActiveProducts"
  text="You don't have any active packages to send activation instructions email">
</app-info-strip>
```

### Data Validation
```html
<app-info-strip 
  *ngIf="form.invalid && form.touched"
  icon="warning"
  text="Please correct the errors before submitting"
  type="warning">
</app-info-strip>
```

### Loading States
```html
<app-info-strip 
  *ngIf="isProcessing"
  icon="hourglass_empty"
  text="Processing your request..."
  type="primary">
</app-info-strip>
```

### Maintenance Notice
```html
<app-info-strip 
  icon="build"
  text="System maintenance scheduled for <strong>tonight at 2:00 AM</strong>. Service may be temporarily unavailable."
  type="warning">
</app-info-strip>
```

## Component Integration Pattern

```typescript
import { Component } from '@angular/core';
import { InfoStripComponent } from '../shared';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [InfoStripComponent],
  template: `
    <div class="container">
      <app-info-strip 
        [text]="infoMessage"
        [type]="infoType"
        [icon]="infoIcon">
      </app-info-strip>
      <!-- Other content -->
    </div>
  `
})
export class ExampleComponent {
  infoMessage = 'Default message';
  infoType: 'primary' | 'warning' | 'alert' = 'primary';
  infoIcon = 'info';
  
  showSuccess() {
    this.infoMessage = 'Operation completed successfully';
    this.infoType = 'primary';
    this.infoIcon = 'check_circle';
  }
  
  showWarning() {
    this.infoMessage = 'Please review your input';
    this.infoType = 'warning';
    this.infoIcon = 'warning';
  }
  
  showError() {
    this.infoMessage = 'An error occurred';
    this.infoType = 'alert';
    this.infoIcon = 'error';
  }
}
``` 