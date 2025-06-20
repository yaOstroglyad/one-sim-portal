# Common Errors and Solutions - One Sim Portal

## Overview

This document serves as a knowledge base for common errors encountered in the One Sim Portal project. Each error includes the symptoms, root cause, solution, and prevention strategies to help developers avoid similar issues in the future.

## Table of Contents

- [Angular Template Errors](#angular-template-errors)
- [Form-Related Errors](#form-related-errors)
- [Change Detection Issues](#change-detection-issues)
- [Component Lifecycle Errors](#component-lifecycle-errors)
- [Best Practices for Error Prevention](#best-practices-for-error-prevention)

---

## Angular Template Errors

### 1. Cannot read properties of undefined (reading 'pristine')

#### **Error Symptoms**
```
TypeError: Cannot read properties of undefined (reading 'pristine')
at EmailLogsComponent_Template (email-logs.component.html:19:17)
```

**Infinite error loop in console with GlobalErrorHandler**

#### **Root Cause**
- **OnPush Change Detection**: Component uses `ChangeDetectionStrategy.OnPush`
- **Initialization Order**: Template tries to access `filterForm.pristine` before `ngOnInit()` completes
- **Undefined Property Access**: `filterForm` is undefined when template renders

#### **Code Example (Wrong)**
```typescript
export class EmailLogsComponent implements OnInit {
  public filterForm: FormGroup; // ❌ Undefined initially

  ngOnInit(): void {
    this.initFormControls(); // ❌ Too late for OnPush
  }

  private initFormControls(): void {
    this.filterForm = new FormGroup({
      iccid: new FormControl(null),
    });
  }
}
```

```html
<!-- ❌ Error: filterForm is undefined -->
<button [disabled]="filterForm.pristine" (click)="resetForm()">
```

#### **Solution**
```typescript
export class EmailLogsComponent implements OnInit {
  // ✅ Initialize immediately at declaration
  public filterForm: FormGroup = new FormGroup({
    iccid: new FormControl(null),
  });

  ngOnInit(): void {
    // ✅ No form initialization needed
    this.setupFilters();
  }
}
```

```html
<!-- ✅ Safe navigation operator -->
<button [disabled]="filterForm?.pristine" (click)="resetForm()">
```

#### **Prevention Strategies**
1. **Early Initialization**: Initialize forms at property declaration level
2. **Safe Navigation**: Always use `?.` for potentially undefined objects
3. **OnPush Awareness**: Be extra careful with initialization order in OnPush components
4. **Template Safety**: Add null checks in templates for all dynamic properties

---

## Form-Related Errors

### 2. FormGroup undefined in OnPush Components

#### **Common Patterns**
- **Symptom**: Form controls not accessible in template
- **Cause**: Late initialization in OnPush components
- **Solution**: Immediate initialization at declaration

#### **Best Practice Pattern**
```typescript
export class MyComponent {
  // ✅ Always initialize forms immediately
  public filterForm = new FormGroup({
    field1: new FormControl(null),
    field2: new FormControl(null)
  });

  // ✅ Safe methods
  public resetForm(): void {
    this.filterForm?.reset();
  }

  public applyFilter(): void {
    const values = this.filterForm?.getRawValue();
    if (values) {
      // Process values
    }
  }
}
```

---

## Change Detection Issues

### 3. OnPush Components Not Updating

#### **Common Scenarios**
- Manual change detection required after async operations
- Observable streams not triggering updates
- Form state changes not reflected in UI

#### **Solution Pattern**
```typescript
constructor(private cdr: ChangeDetectorRef) {}

private loadData(): void {
  this.dataService.getData()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (data) => {
        this.processData(data);
        this.cdr.detectChanges(); // ✅ Manual trigger
      },
      error: (error) => {
        this.handleError(error);
        this.cdr.detectChanges(); // ✅ Manual trigger
      }
    });
}
```

---

## Component Lifecycle Errors

### 4. Memory Leaks from Unsubscribed Observables

#### **Standard Pattern for All Components**
```typescript
export class MyComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.someObservable$
      .pipe(takeUntil(this.unsubscribe$)) // ✅ Always add this
      .subscribe(/* ... */);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
```

### 5. Using Services Before Injection

#### **Wrong Pattern**
```typescript
export class MyComponent {
  constructor(private authService: AuthService) {
    // ❌ Service might not be fully initialized
    this.checkPermissions();
  }
}
```

#### **Correct Pattern**
```typescript
export class MyComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ✅ Services are fully initialized
    this.checkPermissions();
  }
}
```

---

## Best Practices for Error Prevention

### Development Workflow Rules

#### **Before Starting Any Component Development:**

1. **Study This Document**: Review common errors and solutions
2. **Check Existing Examples**: Find similar components in codebase
3. **Follow Standard Patterns**: Use established patterns from `.context` documentation
4. **Verify Component Requirements**: Check if component needs special handling

#### **Component Development Checklist:**

##### **Forms (Reactive Forms)**
- [ ] Initialize FormGroup at property declaration level
- [ ] Use safe navigation (`?.`) in templates
- [ ] Add proper null checks
- [ ] Follow debounce patterns (700ms for filters)

##### **OnPush Components**
- [ ] Be extra careful with initialization order
- [ ] Use manual change detection when needed
- [ ] Initialize all properties that templates use
- [ ] Test component before async data arrives

##### **Memory Management**
- [ ] Implement OnDestroy interface
- [ ] Use `takeUntil(unsubscribe$)` pattern
- [ ] Properly complete subjects
- [ ] Avoid direct subscriptions without cleanup

##### **Service Integration**
- [ ] Initialize service calls in `ngOnInit()`
- [ ] Handle loading states properly
- [ ] Add error handling with user feedback
- [ ] Use proper TypeScript types

### Template Safety Rules

```html
<!-- ✅ Always use safe navigation for dynamic properties -->
<button [disabled]="form?.pristine">

<!-- ✅ Check for null/undefined before array operations -->
<div *ngFor="let item of items || []">

<!-- ✅ Use async pipe for observables -->
<div *ngIf="data$ | async as data">

<!-- ✅ Provide fallbacks for optional data -->
{{ user?.name || 'Anonymous' }}
```

### Error Handling Patterns

```typescript
// ✅ Standard error handling pattern
private loadData(): void {
  this.loading = true;
  
  this.dataService.getData()
    .pipe(
      takeUntil(this.unsubscribe$),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (data) => {
        this.processData(data);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.showErrorMessage('Failed to load data');
        this.cdr.detectChanges();
      }
    });
}
```

### TypeScript Safety

```typescript
// ✅ Use proper typing to catch errors at compile time
interface ComponentState {
  loading: boolean;
  data: MyData[];
  error: string | null;
}

// ✅ Use strict null checks
public processData(data: MyData[] | null | undefined): void {
  if (!data || data.length === 0) {
    this.handleEmptyData();
    return;
  }
  // Process data safely
}
```

---

## Testing for Common Errors

### Unit Test Patterns

```typescript
describe('MyComponent', () => {
  it('should handle undefined form gracefully', () => {
    // Test component before ngOnInit
    const fixture = TestBed.createComponent(MyComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should initialize form properly', () => {
    const component = fixture.componentInstance;
    expect(component.filterForm).toBeDefined();
    expect(component.filterForm.get('field')).toBeDefined();
  });
});
```

---

## When You Encounter a New Error

### Documentation Process

1. **Record the Error**: Full stack trace and symptoms
2. **Identify Root Cause**: What caused the error?
3. **Document Solution**: Step-by-step fix
4. **Add Prevention**: How to avoid in future
5. **Update This Document**: Add to appropriate section
6. **Share with Team**: Ensure knowledge transfer

### Error Analysis Template

```markdown
### X. [Error Title]

#### **Error Symptoms**
[Full error message and stack trace]

#### **Root Cause**
[What caused the error]

#### **Code Example (Wrong)**
[Problematic code]

#### **Solution**
[Fixed code]

#### **Prevention Strategies**
[How to avoid this error]
```

---

## Quick Reference

### Emergency Fixes for OnPush Components

```typescript
// ✅ Quick fixes for OnPush component errors
constructor(private cdr: ChangeDetectorRef) {}

// Fix template binding errors
public safeFormAccess = {
  get pristine() { return this.filterForm?.pristine ?? true; },
  get dirty() { return this.filterForm?.dirty ?? false; },
  get valid() { return this.filterForm?.valid ?? false; }
};

// Force update when needed
private forceUpdate(): void {
  this.cdr.detectChanges();
}
```

### Safe Template Patterns

```html
<!-- Use these patterns to avoid errors -->
<div *ngIf="data$ | async as data; else loading">
  <div *ngFor="let item of data || []">
    {{ item?.name || 'N/A' }}
  </div>
</div>

<ng-template #loading>
  <div>Loading...</div>
</ng-template>
```

---

**Remember**: When in doubt, follow the existing patterns in the codebase and refer to this document. Prevention is always better than debugging! 🚀 