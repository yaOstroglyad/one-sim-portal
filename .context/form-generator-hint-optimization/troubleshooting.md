# Troubleshooting Guide

## 🚨 Critical Issues and Solutions

### 1. Empty containers showing `display: block`

**Symptoms:**
- Container `mat-form-field-subscript-wrapper` visible in DOM with `display: block`
- No visible content but takes up space
- Unnecessary margins under form fields

**Causes:**
```html
<!-- Angular Material creates empty elements -->
<div class="mat-mdc-form-field-subscript-wrapper">
  <div class="mat-mdc-form-field-hint-wrapper"></div> <!-- Empty but exists -->
</div>
```

**✅ Solution:**
```typescript
// Strict check for active state
const hasActiveHint = !!(field.hintMessage && field.hintMessage.trim());
const hasActiveError = !!(
  control && 
  control.errors && 
  Object.keys(control.errors).length > 0 &&
  (control.touched || control.dirty) // WITHOUT control.invalid!
);
```

### 2. Errors showing for untouched required fields

**Problem:**
```typescript
// ❌ WRONG - required fields are always invalid
if (control.invalid) {
  // This is true even for untouched fields
}
```

**✅ Solution:**
```typescript
shouldShowError(fieldName: string): boolean {
  const control = this.form?.get(fieldName);
  return !!(control && control.errors && (control.touched || control.dirty));
}
```

### 3. Dynamic updates not working with OnPush

**Problem:** Errors appear/disappear but DOM doesn't update

**✅ Solution:**
```typescript
private initHintStateTracking(): void {
  const statusChanges$ = this.config.fields.map(field => {
    const control = this.form.get(field.name);
    return control?.statusChanges.pipe(
      startWith(control.status),
      distinctUntilChanged()
    );
  });
  
  merge(...statusChanges$).pipe(
    takeUntil(this.unsubscribe$)
  ).subscribe(() => {
    this.cdr.markForCheck(); // Force update
  });
}
```

### 4. Hints getting Material styles inside mat-form-field

**Problem:** Custom hints conflict with Angular Material styles

**✅ Solution:** Move hints outside:
```html
<div [attr.class]="getFormFieldClass(field)">
  <mat-form-field>
    <input matInput>
    <mat-error>Material errors INSIDE</mat-error>
  </mat-form-field>
  <!-- Custom hints OUTSIDE -->
  <ng-container *ngTemplateOutlet="hintTemplate"></ng-container>
</div>
```

## 🔍 Debug Tools

### Field state check:
```typescript
debugFieldState(fieldName: string) {
  const control = this.form?.get(fieldName);
  const field = this.config.fields.find(f => f.name === fieldName);
  
  console.log('Field Debug:', {
    fieldName,
    hasErrors: !!(control?.errors),
    isTouched: control?.touched,
    isDirty: control?.dirty,
    hintMessage: field?.hintMessage,
    hintTrimmed: field?.hintMessage?.trim(),
    shouldShow: this.hasFieldHintOrError(field)
  });
}
```

### CSS debug (temporary):
```scss
.mat-mdc-form-field-subscript-wrapper {
  border: 1px solid red; // Visual indicator
}

.mat-mdc-form-field-subscript-wrapper:empty::after {
  content: "EMPTY"; // Debug text
  color: red;
}
```

## ✅ Quick Checks

1. **Field without content** → no subscript container in DOM
2. **Spaces in hintMessage** → should be ignored 
3. **Untouched required field** → no errors and containers
4. **Touched invalid field** → container with error appears
5. **Field with hint** → container always visible

## 🎯 Prevention

- Always use `field.hintMessage?.trim()` to check hints
- Don't rely on `control.invalid` for error checking
- Use `touched || dirty` to show errors
- Move custom hints outside `mat-form-field`
- Test with `ChangeDetectionStrategy.OnPush` 