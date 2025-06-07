# Implementation Examples

## Component Code Changes

### TypeScript Component
```typescript
export class SendRegistrationEmailComponent implements OnInit {
  formConfig: FormConfig;
  form: FormGroup;
  isFormValid: boolean = false;
  hasActiveProducts: boolean = false;
  isLoadingProducts: boolean = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    public dialogRef: MatDialogRef<SendRegistrationEmailComponent>,
    private snackBar: MatSnackBar,
    private subscriberDataService: SubscriberDataService,
    private purchasedProductsDataService: PurchasedProductsDataService
  ) {}

  ngOnInit(): void {
    this.checkActiveProducts();
  }

  private checkActiveProducts(): void {
    this.purchasedProductsDataService.getPurchasedProducts({ subscriberId: this.data.id, isActive: true }).subscribe({
      next: (products) => {
        this.hasActiveProducts = products && products.length > 0;
        this.isLoadingProducts = false;
        
        if (this.hasActiveProducts) {
          this.formConfig = this.getFormConfig();
        }
      },
      error: () => {
        this.hasActiveProducts = false;
        this.isLoadingProducts = false;
      }
    });
  }
}
```

### HTML Template
```html
<mat-dialog-content class="mat-typography dialog-content">
    <div *ngIf="isLoadingProducts" class="loading-container">
        <p>Loading...</p>
    </div>

    <app-info-strip *ngIf="!isLoadingProducts && !hasActiveProducts"
                    [text]="'send-registration-email.noActivePackages' | translate">
    </app-info-strip>

    <app-form-generator *ngIf="!isLoadingProducts && hasActiveProducts" 
                        [config]="formConfig"
                        (formChanges)="handleFormChanges($event)"></app-form-generator>
</mat-dialog-content>

<mat-dialog-actions class="dialog-footer" align="end">
    <button mat-button (click)="close()">{{ 'common.cancel' | translate }}</button>
    <button *ngIf="hasActiveProducts" 
            mat-button
            color="primary"
            [disabled]="!isFormValid"
            (click)="submit()">{{ 'send-registration-email.submit' | translate }}
    </button>
</mat-dialog-actions>
```

### SCSS Styles
```scss
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #666;
}
```

### Component Dependencies
```typescript
import { InfoStripComponent } from '../../../../shared';

@Component({
  imports: [FormGeneratorModule, MatDialogModule, TranslateModule, ReactiveFormsModule, MatButtonModule, InfoStripComponent, CommonModule]
})
```

## API Service Usage

The feature uses `PurchasedProductsDataService.getPurchasedProducts()` method:

```typescript
getPurchasedProducts(params: { subscriberId: string; isActive?: boolean }): Observable<ProductPurchase[]> {
  return this.http.get<ProductPurchase[]>(`/api/v1/product-purchases/query/all`, { params }).pipe(
    catchError(() => {
      console.warn('Error occurred, presenting mocked data');
      return of(null);
    })
  );
}
```

## State Management

The component manages three key states:
- `isLoadingProducts` - Shows loading indicator while API call is in progress
- `hasActiveProducts` - Boolean indicating if subscriber has active products
- `isFormValid` - Controls submit button state when form is shown

## User Experience Scenarios

### Scenario 1: No Active Products
1. Dialog opens
2. Loading indicator appears
3. API returns empty array or error
4. Info strip message displays
5. Only Cancel button is available

### Scenario 2: Active Products Found
1. Dialog opens
2. Loading indicator appears
3. API returns products array with items
4. Form generator displays
5. Both Cancel and Submit buttons available 