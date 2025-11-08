# Forms & Validation

Cache form data, validation states, and dependent field values for better UX.

## Problem

Forms with complex logic suffer from poor user experience:
- Lost form data on navigation or browser refresh
- Repeated API calls for dependent field validation
- Slow loading of reference data (countries, categories)
- No offline form completion capability

## Solution

Cache form states, reference data, and validation results for seamless form experience.

## Basic Form Caching

### Form State Service
```typescript
@Injectable({ providedIn: 'root' })
@CacheNamespace('forms')
export class FormCacheService {
  constructor(private hub: CacheHubService) {}

  // Save form data automatically
  saveFormData(formId: string, data: any): void {
    this.hub.set(`data-${formId}`, data, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      persistToStorage: true     // Survive browser refresh
    });
  }

  // Restore form data
  getFormData<T>(formId: string): T | null {
    return this.hub.getValue<T>(`data-${formId}`);
  }

  // Cache validation state
  saveValidationState(formId: string, validationState: FormValidationState): void {
    this.hub.set(`validation-${formId}`, validationState, {
      ttl: 60 * 60 * 1000 // 1 hour
    });
  }

  getValidationState(formId: string): FormValidationState | null {
    return this.hub.getValue<FormValidationState>(`validation-${formId}`);
  }

  // Clear form cache
  clearFormData(formId: string): void {
    this.hub.invalidate(`data-${formId}`);
    this.hub.invalidate(`validation-${formId}`);
  }

  // Auto-save with debouncing
  autoSave(formId: string, form: FormGroup): Observable<void> {
    return form.valueChanges.pipe(
      debounceTime(2000), // Save 2 seconds after last change
      tap(value => this.saveFormData(formId, value)),
      map(() => void 0)
    );
  }
}
```

### Form Component with Auto-save
```typescript
@Component({
  selector: 'app-customer-form',
  template: `
    <form [formGroup]="customerForm" (ngSubmit)="submitForm()">
      <div class="form-header">
        <h2>{{ isEdit ? 'Edit' : 'Create' }} Customer</h2>
        <div class="auto-save-indicator" *ngIf="autoSaveStatus$ | async as status">
          <span [class]="'status-' + status">{{ getStatusText(status) }}</span>
        </div>
      </div>

      <app-form-generator 
        [config]="formConfig" 
        [formGroup]="customerForm"
        (fieldChange)="onFieldChange($event)">
      </app-form-generator>

      <div class="form-actions">
        <button type="button" (click)="cancel()">Cancel</button>
        <button type="submit" [disabled]="!customerForm.valid || submitting">
          {{ submitting ? 'Saving...' : 'Save Customer' }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  customerForm: FormGroup;
  formConfig: FieldConfig[];
  
  isEdit = false;
  submitting = false;
  customerId?: string;
  
  autoSaveStatus$ = new BehaviorSubject<'saved' | 'saving' | 'error'>('saved');
  
  private formId: string;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private formCache: FormCacheService,
    private referenceDataService: ReferenceDataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    this.isEdit = !!this.customerId;
    this.formId = this.isEdit ? `customer-edit-${this.customerId}` : 'customer-create';
    
    this.buildForm();
    this.loadReferenceData();
    this.setupAutoSave();
    
    if (this.isEdit) {
      this.loadCustomer();
    } else {
      this.restoreFormData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFieldChange(event: { field: string; value: any }): void {
    // Handle dependent field updates
    this.handleDependentFields(event.field, event.value);
  }

  submitForm(): void {
    if (!this.customerForm.valid) return;

    this.submitting = true;
    const formValue = this.customerForm.value;

    const saveOperation = this.isEdit 
      ? this.customerService.updateCustomer(this.customerId!, formValue)
      : this.customerService.createCustomer(formValue);

    saveOperation.subscribe({
      next: (customer) => {
        this.submitting = false;
        
        // Clear cached form data after successful save
        this.formCache.clearFormData(this.formId);
        
        // Navigate to customer detail
        this.router.navigate(['/customers', customer.id]);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Failed to save customer:', error);
      }
    });
  }

  cancel(): void {
    // Ask user about unsaved changes
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }

    // Clear form cache and navigate
    this.formCache.clearFormData(this.formId);
    this.router.navigate(['/customers']);
  }

  private buildForm(): void {
    this.customerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      countryId: ['', [Validators.required]],
      companyName: [''],
      industry: [''],
      notes: ['']
    });

    this.buildFormConfig();
  }

  private buildFormConfig(): void {
    this.formConfig = [
      {
        type: FieldType.text,
        name: 'name',
        label: 'Customer Name',
        placeholder: 'Enter customer name',
        validators: [Validators.required]
      },
      {
        type: FieldType.email,
        name: 'email',
        label: 'Email',
        placeholder: 'customer@example.com',
        validators: [Validators.required, Validators.email]
      },
      {
        type: FieldType.tel,
        name: 'phone',
        label: 'Phone Number',
        placeholder: '+1 234 567 8900'
      },
      {
        type: FieldType.select,
        name: 'countryId',
        label: 'Country',
        placeholder: 'Select country',
        validators: [Validators.required],
        // Use cached reference data
        options: this.referenceDataService.getCountries()
      },
      {
        type: FieldType.text,
        name: 'companyName',
        label: 'Company Name',
        placeholder: 'Enter company name'
      },
      {
        type: FieldType.select,
        name: 'industry',
        label: 'Industry',
        placeholder: 'Select industry',
        // Dependent on country selection
        options: this.getIndustryOptions()
      },
      {
        type: FieldType.textarea,
        name: 'notes',
        label: 'Notes',
        placeholder: 'Additional notes about the customer'
      }
    ];
  }

  private loadReferenceData(): void {
    // All reference data is cached automatically
    this.referenceDataService.preloadFormData();
  }

  private setupAutoSave(): void {
    if (!this.isEdit) {
      // Only auto-save for new forms
      this.formCache.autoSave(this.formId, this.customerForm).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.autoSaveStatus$.next('saved');
        this.cdr.markForCheck();
      });

      // Show saving indicator
      this.customerForm.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.autoSaveStatus$.next('saving');
        this.cdr.markForCheck();
      });
    }
  }

  private loadCustomer(): void {
    if (!this.customerId) return;

    this.customerService.getCustomer(this.customerId).subscribe(customer => {
      this.customerForm.patchValue(customer);
    });
  }

  private restoreFormData(): void {
    const savedData = this.formCache.getFormData(this.formId);
    if (savedData) {
      this.customerForm.patchValue(savedData);
      console.log('Restored form data from cache');
    }
  }

  private handleDependentFields(fieldName: string, value: any): void {
    switch (fieldName) {
      case 'countryId':
        // Reset and reload dependent fields
        this.customerForm.patchValue({ industry: '' });
        this.updateIndustryOptions(value);
        break;
    }
  }

  private updateIndustryOptions(countryId: string): void {
    // Update form config with new options
    const industryField = this.formConfig.find(f => f.name === 'industry');
    if (industryField) {
      industryField.options = this.referenceDataService.getIndustriesByCountry(countryId);
    }
  }

  private getIndustryOptions(): Observable<SelectOption[]> {
    return this.customerForm.get('countryId')?.valueChanges.pipe(
      startWith(this.customerForm.get('countryId')?.value),
      switchMap(countryId => 
        countryId ? this.referenceDataService.getIndustriesByCountry(countryId) : of([])
      )
    ) || of([]);
  }

  private hasUnsavedChanges(): boolean {
    const savedData = this.formCache.getFormData(this.formId);
    const currentData = this.customerForm.value;
    
    return JSON.stringify(savedData) !== JSON.stringify(currentData);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Save failed';
      default: return '';
    }
  }
}
```

## Reference Data Service

### Cached Reference Data
```typescript
@Injectable({ providedIn: 'root' })
@CacheNamespace('reference')
export class ReferenceDataService {
  constructor(
    private hub: CacheHubService,
    private api: ApiService
  ) {}

  // Cache countries for 24 hours
  getCountries(): Observable<SelectOption[]> {
    return this.hub.getStatic('countries', 
      () => this.api.getCountries().pipe(
        map(countries => countries.map(c => ({
          value: c.id,
          label: c.name,
          data: c
        })))
      )
    );
  }

  // Cache industries by country
  getIndustriesByCountry(countryId: string): Observable<SelectOption[]> {
    const cacheKey = `industries-${countryId}`;
    
    return this.hub.getReference(cacheKey,
      () => this.api.getIndustriesByCountry(countryId).pipe(
        map(industries => industries.map(i => ({
          value: i.id,
          label: i.name
        })))
      )
    );
  }

  // Cache form validation rules
  getValidationRules(formType: string): Observable<ValidationRuleSet> {
    return this.hub.getStatic(`validation-${formType}`,
      () => this.api.getValidationRules(formType)
    );
  }

  // Preload common form data
  preloadFormData(): void {
    // Preload in background for instant form rendering
    this.getCountries().subscribe();
    this.getValidationRules('customer').subscribe();
  }

  // Cache customer templates for quick form initialization
  getCustomerTemplates(): Observable<CustomerTemplate[]> {
    return this.hub.getReference('customer-templates',
      () => this.api.getCustomerTemplates()
    );
  }
}
```

## Dynamic Form Validation

### Cached Validation Service
```typescript
@Injectable()
@CacheNamespace('validation')
export class FormValidationService {
  constructor(private hub: CacheHubService, private api: ApiService) {}

  // Cache validation results
  validateField(
    fieldName: string, 
    value: any, 
    context: ValidationContext
  ): Observable<ValidationResult> {
    const cacheKey = `${fieldName}-${this.hashValue(value)}-${this.hashContext(context)}`;
    
    return this.hub.get(cacheKey,
      () => this.api.validateField(fieldName, value, context),
      { ttl: 5 * 60 * 1000 } // 5 minutes for validation results
    );
  }

  // Validate email uniqueness (cached for better UX)
  validateEmailUniqueness(email: string, excludeId?: string): Observable<boolean> {
    const cacheKey = `email-unique-${btoa(email.toLowerCase())}-${excludeId || 'new'}`;
    
    return this.hub.get(cacheKey,
      () => this.api.checkEmailUniqueness(email, excludeId),
      { ttl: 2 * 60 * 1000 } // 2 minutes
    );
  }

  // Batch validate form (cache entire validation state)
  validateForm(formData: any, formType: string): Observable<FormValidationState> {
    const cacheKey = `form-${formType}-${this.hashFormData(formData)}`;
    
    return this.hub.get(cacheKey,
      () => this.api.validateForm(formData, formType),
      { ttl: 5 * 60 * 1000 }
    );
  }

  private hashValue(value: any): string {
    return btoa(JSON.stringify(value)).replace(/[^a-zA-Z0-9]/g, '');
  }

  private hashContext(context: ValidationContext): string {
    return btoa(JSON.stringify(context)).replace(/[^a-zA-Z0-9]/g, '');
  }

  private hashFormData(data: any): string {
    return btoa(JSON.stringify(data)).replace(/[^a-zA-Z0-9]/g, '');
  }
}
```

## Multi-Step Forms

For complex wizard forms and multi-step workflows with state persistence:

**→ [Wizard Forms Guide](./wizard-forms.md)**

Covers:
- Step-by-step data caching
- Progress validation and navigation
- State restoration across sessions
- Complex form workflows

## Best Practices

### ✅ DO

1. **Auto-save form data**
   ```typescript
   this.formCache.autoSave(formId, form).subscribe();
   ```

2. **Cache reference data with appropriate TTL**
   ```typescript
   this.hub.getStatic('countries', () => this.api.getCountries());
   ```

3. **Persist critical form data**
   ```typescript
   this.hub.set(key, data, { persistToStorage: true });
   ```

4. **Handle form navigation gracefully**
   ```typescript
   if (this.hasUnsavedChanges()) {
     const confirmed = confirm('Are you sure you want to leave?');
   }
   ```

### ❌ DON'T

1. **Don't cache sensitive data**
   ```typescript
   // Wrong - never cache passwords or payment info
   this.formCache.saveFormData('login', { password: '...' });
   ```

2. **Don't ignore validation context**
   ```typescript
   // Wrong - validation without context
   this.validateField(value);
   
   // Right - include form context
   this.validateField(value, { formType, userId });
   ```

3. **Don't auto-save too frequently**
   ```typescript
   // Wrong - saves on every keystroke
   form.valueChanges.subscribe(value => this.save(value));
   
   // Right - debounced saving
   form.valueChanges.pipe(debounceTime(2000)).subscribe(...);
   ```

## Common Use Cases

### Draft Management
- Save incomplete forms as drafts
- Restore drafts on return
- List and manage saved drafts

### Offline Forms
- Cache form structure and validation rules
- Allow offline form completion
- Sync when online

### Form Templates
- Cache common form configurations
- Quick form initialization from templates
- User-specific form preferences

## Next Steps

- **[Real-time Updates](./real-time.md)** - Sync form data across sessions
- **[Performance Tuning](../advanced/performance.md)** - Optimize form caching
- **[Offline Support](../advanced/offline.md)** - Complete offline form experience