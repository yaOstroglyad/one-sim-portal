# Company Retail Tariff Feature - Pricing Schedule Management

> **Last Updated:** 2025-11-20
> **Status:** ✅ Completed (Ready for Testing)
> **Architecture:** Signal-based, OnPush Change Detection

---

## 📋 Overview

Complete pricing schedule management system for Company Products. Allows creating, editing, and viewing multiple tariffs with different valid-from dates, replacing the legacy single-price model with a flexible timeline-based pricing system.

---

## 🏗️ Architecture

### Core Components

1. **CompanyRetailTariffTableComponent** - Displays pricing schedule table
2. **ModifyPriceDialogComponent** - Modal for creating/editing prices
3. **CompanyRetailTariffService** - API communication layer
4. **Models** - Type-safe data structures

### Signal-Based Reactive Programming

- ✅ Pure Angular signals (no Observables in components)
- ✅ `toSignal()` for form changes with debouncing (300ms)
- ✅ `computed()` for derived state (price calculations, previews)
- ✅ Exchange rates cached as signal for performance
- ✅ OnPush change detection strategy

---

## 📁 File Structure

```
src/app/views/product-constructor/
├── models/
│   └── company-retail-tariff.model.ts          # Core data models
├── services/
│   └── company-retail-tariff.service.ts        # API service
└── components/company-products/
    ├── company-retail-tariff-table/
    │   ├── company-retail-tariff-table.component.ts
    │   ├── company-retail-tariff-table.component.html
    │   ├── company-retail-tariff-table.component.scss
    │   └── utils/
    │       └── tariff-validation.utils.ts      # Date & validation logic
    └── modify-price-dialog/
        ├── modify-price-dialog.component.ts
        ├── modify-price-dialog.component.html
        ├── modify-price-dialog.component.scss
        ├── models/
        │   └── modify-price-dialog.model.ts    # Dialog-specific types
        ├── services/
        │   └── modify-price-dialog.presenter.ts # Business logic (signals)
        └── utils/
            ├── form.utils.ts                    # Form helpers
            ├── modify-price-form-config.utils.ts # FormGenerator config
            └── price-calculation.utils.ts       # Currency calculations
```

---

## 🔧 Key Features

### 1. Pricing Schedule Table

**File:** `company-retail-tariff-table.component.ts`

**Features:**
- ✅ Displays all tariffs sorted by validFrom date (newest first)
- ✅ Shows status badges: Active, Scheduled, Expired
- ✅ Edit/Delete actions for future tariffs only
- ✅ Protection: Cannot edit past or today's tariffs
- ✅ Empty state with "Add Price" call-to-action
- ✅ Loading spinner during API calls

**Inputs:**
```typescript
@Input() tariffs: Signal<CompanyRetailTariff[]> = signal([]);
@Input() loading: Signal<boolean> = signal(false);
@Input() editable: boolean = true;
```

**Outputs:**
```typescript
@Output() editTariff = new EventEmitter<CompanyRetailTariff>();
@Output() deleteTariff = new EventEmitter<CompanyRetailTariff>();
@Output() addTariff = new EventEmitter<void>();
```

**Status Logic:**
- **Active:** `validFrom <= today && (next tariff validFrom > today || no next tariff)`
- **Scheduled:** `validFrom > today`
- **Expired:** `validFrom < today && next tariff exists`

---

### 2. Modify Price Dialog (Signal-Based)

**File:** `modify-price-dialog.component.ts`

**Modes:**
1. **Legacy Mode** (`mode: undefined`) - Simple price update, no validFrom
2. **Create Mode** (`mode: 'create'`) - Add new tariff with validFrom
3. **Edit Mode** (`mode: 'edit'`) - Modify existing future tariff

**Signal Architecture:**

```typescript
// Component signals
readonly loading = signal(false);
readonly error = signal<string | null>(null);
viewModel: Signal<ModifyPriceDialogViewModel> | null = null;

// Presenter creates reactive view model
this.viewModel = this.presenter.createViewModel(
  this.modifyForm,
  this.data,
  this.uiConfig
);
```

**View Model Structure:**
```typescript
interface ModifyPriceDialogViewModel {
  priceInfo: PriceInfoViewModel;           // Current vs base price
  pricePreview: PricePreviewViewModel;     // Old vs new price comparison
  isFormValid: boolean;
  showServiceProvider: boolean;
  serviceProviderName: string | null;
}
```

**Key Signal Patterns:**

1. **Form to Signal Conversion:**
```typescript
const formValue = toSignal(
  form.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged((prev, curr) =>
      prev.price === curr.price && prev.currency === curr.currency
    )
  ),
  { initialValue: form.value, injector: this.injector }
);
```

2. **Computed Price Data:**
```typescript
const priceData = computed(() => {
  const baseData = PriceCalculationUtils.extractPriceData(data.tariffOffer);
  const value = formValue();

  if (!value) {
    return { ...baseData, newPrice: null, newCurrency: null };
  }

  return {
    ...baseData,
    newPrice: value.price,
    newCurrency: value.currency
  };
});
```

3. **Cached Exchange Rates:**
```typescript
private readonly exchangeRates = toSignal(
  this.productsDataService.getExchangeRates(),
  { initialValue: {}, injector: this.injector }
);
```

**Template (New Angular Control Flow):**
```html
@if (viewModel; as vm) {
  @let vmValue = vm();

  @if (uiConfig.showCurrentTariffInfo && vmValue.priceInfo) {
    <!-- Price info display -->
  }

  @if (vmValue.pricePreview.isVisible) {
    <!-- Price preview: €5.90 → €5.91 (+0.2%) -->
  }
}
```

---

### 3. API Service

**File:** `company-retail-tariff.service.ts`

**Base URL:** `/api-product/api/v1/esim-product/company-products/tariffs`

**Methods:**

```typescript
// Get all tariffs for a company product
getTariffs(companyProductId: string): Observable<CompanyRetailTariff[]>

// Create new tariff
createTariff(
  companyProductId: string,
  request: CreateCompanyRetailTariffRequest
): Observable<CompanyRetailTariff>

// Update existing tariff
updateTariff(
  tariffId: string,
  request: UpdateCompanyRetailTariffRequest
): Observable<CompanyRetailTariff>
```

**Error Handling:**
```typescript
.pipe(
  tap({
    next: response => console.log('✅ Success:', response),
    error: error => console.error('❌ Error:', error)
  }),
  catchError(handleObjectError<CompanyRetailTariff>('context'))
)
```

⚠️ **Important:** Always use `catchError()` with `handleObjectError`/`handleArrayError`, not just `.pipe(handleObjectError())`

---

### 4. Data Models

**File:** `company-retail-tariff.model.ts`

```typescript
export interface CompanyRetailTariff {
  id: string;                    // UUID
  companyProductId: string;      // UUID
  tariffOfferId: string;         // UUID of base tariff offer
  price: number;
  currency: Currency;            // 'USD' | 'EUR' | 'GBP'
  validFrom: string;             // ISO date: '2025-11-19'
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyRetailTariffRequest {
  tariffOfferId: string;
  price: number;
  currency: Currency;
  validFrom: string;
}

export interface UpdateCompanyRetailTariffRequest {
  price: number;
  currency: Currency;
  validFrom: string;
}
```

---

## 🔄 Integration Points

### 1. Company Product Form

**File:** `company-product-form.component.ts`

**Changes:**
- Added tariff table in edit mode
- Removed single price fields when tariffs exist
- MinValidFromDate calculation logic

```typescript
readonly minValidFromDate = computed(() => {
  const tariffs = this.tariffs();
  if (!tariffs || tariffs.length === 0) {
    return TariffValidationUtils.getTomorrowISOString();
  }

  const latestTariff = tariffs[0]; // Already sorted by validFrom DESC
  const latestDate = new Date(latestTariff.validFrom);
  const tomorrow = new Date(latestDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});
```

### 2. Company Product Details

**File:** `company-product-details.component.ts`

**Changes:**
- Shows tariff table instead of single price
- Loads tariffs from API on init
- Displays current active price prominently

---

## 🎨 UI/UX Features

### Price Preview

Shows real-time comparison when user changes price:

```
Price Preview:
€5.90 → €5.91 (+0.2%)
```

- Green arrow for increase
- Red arrow for decrease
- Percentage calculated using exchange rates if currencies differ

### Price Information

Shows relationship between base price and current price:

```
Base Price: $5.00
Customer Price: €5.90 (+18.0%)
```

### Form Generator Integration

Uses project's `FormGeneratorComponent` for consistent forms:

```typescript
const formConfig: FormConfig = {
  fields: [
    {
      type: FieldType.number,
      name: 'price',
      label: 'Price',
      validators: [Validators.required, Validators.min(0.01)]
    },
    {
      type: FieldType.select,
      name: 'currency',
      label: 'Currency',
      options: of([
        { value: 'USD', displayValue: 'USD' },
        { value: 'EUR', displayValue: 'EUR' },
        { value: 'GBP', displayValue: 'GBP' }
      ])
    },
    {
      type: FieldType.datepicker,
      name: 'validFrom',
      label: 'Valid From',
      validators: [
        Validators.required,
        minDateValidator(minDate),
        uniqueValidFromValidator(existingTariffs, excludeTariffId)
      ]
    }
  ]
};
```

**Note:** `tariffOfferId` control is added manually via `FormControl` since `FieldType.hidden` doesn't exist:

```typescript
if (!this.modifyForm.contains('tariffOfferId')) {
  this.modifyForm.addControl('tariffOfferId', new FormControl(this.data.tariffOffer.id));
}
```

---

## ✅ Validation Rules

### Date Validation

**File:** `tariff-validation.utils.ts`

1. **Minimum Date Validator:**
   - New tariffs: `validFrom >= tomorrow`
   - Edited tariffs: `validFrom >= latestTariff.validFrom + 1 day`

2. **Unique Date Validator:**
   - Prevents duplicate `validFrom` dates
   - Excludes current tariff when editing

3. **Today Check:**
   ```typescript
   static getTodayISOString(): string {
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     return today.toISOString().split('T')[0];
   }
   ```

### Edit Protection

- ❌ Cannot edit tariffs with `validFrom <= today`
- ✅ Can edit future tariffs
- ❌ Cannot delete tariffs with `validFrom <= today`
- ✅ Can delete future tariffs

---

## 🧪 Testing Checklist

### Create Tariff Flow

- [ ] Open company product in edit mode
- [ ] Click "Add Price" button
- [ ] Dialog shows with:
  - [ ] Price field (default: 0)
  - [ ] Currency dropdown (default: USD)
  - [ ] Valid From datepicker (default: tomorrow)
  - [ ] Price Preview section (hidden initially)
- [ ] Enter price (e.g., 5.91)
- [ ] Select currency (e.g., EUR)
- [ ] Select future date
- [ ] Price Preview appears: `€5.90 → €5.91 (+0.2%)`
- [ ] Click "Add Price"
- [ ] Console shows:
  ```
  Adding tariffOfferId control: <uuid>
  Sending request: CREATE
  CompanyRetailTariffService.createTariff called:
  ✅ Create tariff SUCCESS: {...}
  ```
- [ ] Dialog closes
- [ ] New tariff appears in table with "Scheduled" badge
- [ ] Table sorted by validFrom DESC

### Edit Tariff Flow

- [ ] Click edit icon on future tariff
- [ ] Dialog opens with pre-filled values
- [ ] Change price/currency/date
- [ ] Price Preview updates
- [ ] Click "Update Price"
- [ ] Table refreshes with updated values

### Validation Tests

- [ ] Try to create tariff with past date → Error
- [ ] Try to create tariff with today's date → Error
- [ ] Try to create tariff with duplicate validFrom → Error
- [ ] Try to edit past tariff → Edit button disabled
- [ ] Try to edit today's tariff → Edit button disabled

### Edge Cases

- [ ] Create tariff without selecting tariff offer first → Should show error
- [ ] Create tariff with invalid price (0, negative) → Validation error
- [ ] Network error during create → Error message displayed
- [ ] Server returns null → "Server returned an invalid response"

---

## 🐛 Known Issues & Solutions

### Issue 1: `tariffOfferId` was `undefined`

**Cause:** Form didn't have `tariffOfferId` control, and `FieldType.hidden` doesn't exist.

**Solution:** Manually add control in `onFormChanges()`:
```typescript
if (!this.modifyForm.contains('tariffOfferId')) {
  this.modifyForm.addControl('tariffOfferId', new FormControl(this.data.tariffOffer.id));
}
```

### Issue 2: `handleObjectError` used incorrectly

**Cause:** Used `.pipe(handleObjectError())` instead of `.pipe(catchError(handleObjectError()))`.

**Solution:** Always wrap in `catchError`:
```typescript
.pipe(
  tap(...),
  catchError(handleObjectError<T>('context'))
)
```

### Issue 3: `formValue()` returns null before first emit

**Cause:** `toSignal()` with `debounceTime(300)` doesn't emit immediately.

**Solution:** Add null check in computed:
```typescript
const priceData = computed(() => {
  const value = formValue();
  if (!value) {
    return { ...baseData, newPrice: null, newCurrency: null };
  }
  return { ...baseData, newPrice: value.price, newCurrency: value.currency };
});
```

### Issue 4: toSignal() outside injection context

**Cause:** Calling `toSignal()` in non-constructor method without passing `Injector`.

**Solution:** Inject and pass:
```typescript
private readonly injector = inject(Injector);

const formValue = toSignal(observable, {
  initialValue: value,
  injector: this.injector
});
```

---

## 🎯 Performance Optimizations

1. **Debouncing:** Form changes debounced 300ms to reduce recalculations
2. **Exchange Rate Caching:** Fetched once and cached as signal
3. **DistinctUntilChanged:** Only recalculate when price/currency actually changes
4. **OnPush Strategy:** All components use OnPush change detection
5. **Computed Signals:** Derived state auto-updates only when dependencies change

---

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project setup and conventions
- [01-CRITICAL.md](../rules/01-CRITICAL.md) - Component architecture rules
- [02-http-errors.md](../rules/02-http-errors.md) - Error handling patterns
- [creating-component.md](../guides/creating-component.md) - Component creation guide
- [creating-service.md](../guides/creating-service.md) - Service creation guide

---

## 🔮 Future Enhancements

- [ ] Add delete confirmation dialog
- [ ] Add bulk price update feature
- [ ] Add price history timeline visualization
- [ ] Add import/export pricing schedule (CSV/Excel)
- [ ] Add price comparison across multiple products
- [ ] Add notifications for upcoming price changes
- [ ] Add audit log for price changes

---

## 📝 Notes

### Signal vs Observable Trade-offs

**Pros:**
- ✅ Simpler mental model (no subscription management)
- ✅ Automatic cleanup (no `takeUntil` needed)
- ✅ Fine-grained reactivity
- ✅ Better TypeScript inference

**Cons:**
- ⚠️ Need `toSignal()` for RxJS interop
- ⚠️ Must pass `Injector` for calls outside constructor
- ⚠️ Debouncing still requires RxJS operators

### Migration from Observables

Before (Observable):
```typescript
this.viewModel$ = form.valueChanges.pipe(
  debounceTime(300),
  switchMap(value => this.calculatePricePreview(value)),
  takeUntil(this.destroy$)
);
```

After (Signal):
```typescript
const formValue = toSignal(
  form.valueChanges.pipe(debounceTime(300)),
  { initialValue: form.value, injector: this.injector }
);

this.viewModel = computed(() =>
  this.calculatePricePreview(formValue())
);
```

---

**End of Document**
