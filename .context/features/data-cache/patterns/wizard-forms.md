# Multi-Step Wizard Forms

Advanced form caching patterns for complex multi-step workflows.

## Multi-Step Form Caching

### Wizard Form Service
```typescript
@Injectable()
export class WizardFormService {
  constructor(private formCache: FormCacheService) {}

  saveStepData(wizardId: string, stepIndex: number, data: any): void {
    this.formCache.saveFormData(`${wizardId}-step-${stepIndex}`, data);
  }

  getStepData<T>(wizardId: string, stepIndex: number): T | null {
    return this.formCache.getFormData<T>(`${wizardId}-step-${stepIndex}`);
  }

  getAllStepsData(wizardId: string, totalSteps: number): any[] {
    const stepsData: any[] = [];
    
    for (let i = 0; i < totalSteps; i++) {
      const stepData = this.getStepData(wizardId, i);
      stepsData.push(stepData || {});
    }
    
    return stepsData;
  }

  clearWizardData(wizardId: string, totalSteps: number): void {
    for (let i = 0; i < totalSteps; i++) {
      this.formCache.clearFormData(`${wizardId}-step-${i}`);
    }
  }

  // Validate if user can proceed to next step
  canProceedToStep(wizardId: string, targetStep: number): boolean {
    // Check if all previous steps have valid data
    for (let i = 0; i < targetStep; i++) {
      const stepData = this.getStepData(wizardId, i);
      if (!stepData || !this.isStepValid(i, stepData)) {
        return false;
      }
    }
    return true;
  }

  private isStepValid(stepIndex: number, data: any): boolean {
    // Implement step-specific validation logic
    switch (stepIndex) {
      case 0: return !!data.name && !!data.email;
      case 1: return !!data.address && !!data.countryId;
      case 2: return !!data.paymentMethod;
      default: return true;
    }
  }
}
```

### Wizard Component
```typescript
@Component({
  selector: 'app-customer-wizard',
  template: `
    <div class="wizard-container">
      <div class="wizard-steps">
        <div 
          *ngFor="let step of steps; let i = index"
          class="step"
          [class.active]="currentStep === i"
          [class.completed]="isStepCompleted(i)">
          {{ step.title }}
        </div>
      </div>

      <div class="wizard-content">
        <ng-container [ngSwitch]="currentStep">
          <app-customer-basic-info 
            *ngSwitchCase="0"
            [formGroup]="stepForms[0]"
            (stepComplete)="onStepComplete(0, $event)">
          </app-customer-basic-info>
          
          <app-customer-address 
            *ngSwitchCase="1"
            [formGroup]="stepForms[1]"
            (stepComplete)="onStepComplete(1, $event)">
          </app-customer-address>
          
          <app-customer-payment 
            *ngSwitchCase="2"
            [formGroup]="stepForms[2]"
            (stepComplete)="onStepComplete(2, $event)">
          </app-customer-payment>
        </ng-container>
      </div>

      <div class="wizard-actions">
        <button 
          *ngIf="currentStep > 0" 
          (click)="previousStep()"
          type="button">
          Previous
        </button>
        
        <button 
          *ngIf="currentStep < steps.length - 1"
          (click)="nextStep()"
          [disabled]="!canProceedToNext()"
          type="button">
          Next
        </button>
        
        <button 
          *ngIf="currentStep === steps.length - 1"
          (click)="submitWizard()"
          [disabled]="!canSubmit()"
          type="submit">
          Create Customer
        </button>
      </div>
    </div>
  `
})
export class CustomerWizardComponent implements OnInit {
  currentStep = 0;
  stepForms: FormGroup[] = [];
  
  steps = [
    { title: 'Basic Info', component: 'basic-info' },
    { title: 'Address', component: 'address' },
    { title: 'Payment', component: 'payment' }
  ];

  private wizardId = 'customer-wizard';

  constructor(
    private fb: FormBuilder,
    private wizardService: WizardFormService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildStepForms();
    this.restoreWizardData();
  }

  onStepComplete(stepIndex: number, formData: any): void {
    this.wizardService.saveStepData(this.wizardId, stepIndex, formData);
  }

  nextStep(): void {
    if (this.canProceedToNext()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitWizard(): void {
    if (!this.canSubmit()) return;

    const allData = this.wizardService.getAllStepsData(this.wizardId, this.steps.length);
    const customerData = this.combineStepsData(allData);

    this.customerService.createCustomer(customerData).subscribe({
      next: (customer) => {
        this.wizardService.clearWizardData(this.wizardId, this.steps.length);
        this.router.navigate(['/customers', customer.id]);
      },
      error: (error) => {
        console.error('Failed to create customer:', error);
      }
    });
  }

  canProceedToNext(): boolean {
    return this.wizardService.canProceedToStep(this.wizardId, this.currentStep + 1);
  }

  canSubmit(): boolean {
    return this.wizardService.canProceedToStep(this.wizardId, this.steps.length);
  }

  isStepCompleted(stepIndex: number): boolean {
    return !!this.wizardService.getStepData(this.wizardId, stepIndex);
  }

  private buildStepForms(): void {
    // Create forms for each step
    this.stepForms = this.steps.map(() => this.fb.group({}));
  }

  private restoreWizardData(): void {
    this.steps.forEach((step, index) => {
      const stepData = this.wizardService.getStepData(this.wizardId, index);
      if (stepData) {
        this.stepForms[index].patchValue(stepData);
      }
    });
  }

  private combineStepsData(stepsData: any[]): CustomerCreateRequest {
    return stepsData.reduce((combined, stepData) => ({
      ...combined,
      ...stepData
    }), {});
  }
}
```

## Best Practices for Wizard Forms

### ✅ DO

1. **Save step data immediately**
   ```typescript
   onStepComplete(stepIndex: number, formData: any): void {
     this.wizardService.saveStepData(this.wizardId, stepIndex, formData);
   }
   ```

2. **Validate step dependencies**
   ```typescript
   canProceedToStep(wizardId: string, targetStep: number): boolean {
     // Ensure all previous steps are valid
   }
   ```

3. **Clear wizard data on completion**
   ```typescript
   onWizardComplete(): void {
     this.wizardService.clearWizardData(this.wizardId, this.steps.length);
   }
   ```

### ❌ DON'T

1. **Don't lose progress on navigation**
   ```typescript
   // Wrong - no state persistence
   ngOnInit() {
     this.currentStep = 0; // Always starts from beginning
   }
   ```

2. **Don't allow invalid progression**
   ```typescript
   // Wrong - no validation
   nextStep() {
     this.currentStep++; // Allows skipping steps
   }
   ```

## Common Use Cases

- **Customer onboarding workflows**
- **Multi-page checkout processes**
- **Survey and questionnaire forms**
- **Application submission forms**

For basic form caching patterns, see: **[Forms & Validation](./forms.md)**