# Critical Project Rules

> **Created:** 2025-10-16 | **Last Updated:** 2025-11-15 (Updated to Angular 19)
> **Context Tags:** `@creating-new` `@component` `@critical`
> **Read when:** Before creating ANY component or working with file paths

## 🎯 Overview

These are **project-breaking rules** that MUST be followed at all times. Violating these rules will cause errors, failed operations, or architectural inconsistencies.

---

## 🚨 CRITICAL RULE #1: ABSOLUTE PATHS ONLY

### The Rule

**❌ NEVER USE RELATIVE PATHS**: `../../../../andreyostroglyad/IdeaProjects/...`
**✅ ALWAYS USE ABSOLUTE PATHS**: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/...`

### Root Directory

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/
```

### Examples

```bash
# ❌ WRONG - Relative paths
../../../../andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/...
../../../scss/styles.scss
../../shared/models/user.ts

# ✅ CORRECT - Absolute paths
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/...
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/scss/styles.scss
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/models/user.ts
```

### Why This Matters

**IF YOU USE RELATIVE PATHS, THE OPERATION WILL FAIL WITH "File does not exist" ERROR!**

Claude Code's file system operations require absolute paths. Relative paths will always fail.

---

## 🚨 CRITICAL RULE #2: Standalone Components ONLY

### The Rule

**ALL new components MUST be standalone (Angular 19 standard)**

### Requirements

1. **Use `standalone: true`** in component decorator
2. **Import dependencies explicitly** in `imports` array
3. **NO module-based components**
4. **NO NgModules** for new features - use standalone components with lazy loading

### NO HttpClientModule

**❌ NEVER** import HttpClientModule in standalone components:

```typescript
// ❌ WRONG
import { HttpClientModule } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [HttpClientModule] // DON'T DO THIS!
})
```

**✅ CORRECT** - HttpClient is provided globally via `provideHttpClient()` in app configuration:

```typescript
// ✅ CORRECT - Just inject HttpClient
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, /* other imports */]
})
export class MyComponent {
  private readonly http = inject(HttpClient); // Works automatically
}
```

### NO Deprecated APIs

**Never use deprecated Angular APIs:**

| ❌ Deprecated | ✅ Use Instead |
|--------------|---------------|
| `APP_INITIALIZER` | `provideAppInitializer(() => inject(Service).init())` |
| `ENVIRONMENT_INITIALIZER` | `makeEnvironmentProviders` with custom tokens |
| `HttpClientModule` | `provideHttpClient()` |

Always check Angular documentation for current best practices.

### Modern App Initialization

Use `provideAppInitializer` for app startup logic:

```typescript
// ✅ CORRECT
provideAppInitializer(() => inject(AuthService).loadPermissions())

// Features:
// ✅ Runs in injection context
// ✅ Supports async operations
// ✅ Blocks app bootstrap until completion
```

### Provider Functions

Correct usage of provider functions:

```typescript
// ✅ CORRECT - Use directly (returns EnvironmentProviders)
providers: [
  provideFabLayout()
]

// ❌ WRONG - Don't spread EnvironmentProviders
providers: [
  ...provideFabLayout() // DON'T DO THIS!
]

// ✅ CORRECT - Only spread actual arrays
providers: [
  ...providerArray // OK if providerArray is Provider[]
]
```

---

## 🚨 CRITICAL RULE #3: OnPush Change Detection MANDATORY

### The Rule

**ALL new components MUST use OnPush change detection strategy**

### Requirements

```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // REQUIRED!
  // ...
})
export class MyComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  updateData(newData: any): void {
    // ✅ Immutable update
    this.data = { ...this.data, ...newData };

    // ✅ Trigger change detection
    this.cdr.markForCheck(); // Use markForCheck(), NOT detectChanges()
  }
}
```

### Best Practices

- **Use `markForCheck()`** instead of `detectChanges()` for better performance
- **NEVER mutate objects/arrays directly** - use immutable patterns:

```typescript
// ❌ WRONG - Direct mutation
this.items.push(newItem);
this.user.name = 'John';

// ✅ CORRECT - Immutable patterns
this.items = [...this.items, newItem];
this.user = { ...this.user, name: 'John' };
```

---

## 🚨 CRITICAL RULE #4: Dependency Injection with inject()

### The Rule

**ALL new components and services MUST use the `inject()` function**

### Requirements

- Use `inject()` function instead of constructor injection
- Declare injected dependencies as `private readonly` fields

### Example

```typescript
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '@shared/services';

@Component({
  selector: 'app-my-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.scss'
})
export class MyComponent {
  // ✅ Use inject() function
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  updateData(newData: any): void {
    this.data = { ...this.data, ...newData }; // Immutable update
    this.cdr.markForCheck(); // Trigger change detection
  }
}
```

### Why Not Constructor?

```typescript
// ❌ OLD WAY (don't use for new code)
constructor(
  private cdr: ChangeDetectorRef,
  private http: HttpClient,
  private authService: AuthService
) {}

// ✅ NEW WAY (use this)
private readonly cdr = inject(ChangeDetectorRef);
private readonly http = inject(HttpClient);
private readonly authService = inject(AuthService);
```

Modern `inject()` syntax is:
- More concise
- Easier to test
- Better TypeScript inference
- Angular's recommended approach

---

## 🚨 CRITICAL RULE #5: Template Separation

### The Rule

**If HTML template contains more than one logical block, MUST extract to separate `.html` file**

### When to Use Inline Templates

```typescript
// ✅ OK - Simple, single logical block
@Component({
  template: `<div class="simple">{{ data }}</div>`
})
```

### When to Use External Templates

```typescript
// ✅ REQUIRED - Multiple sections, complex structure
@Component({
  templateUrl: './dashboard.component.html'
})
```

Examples requiring external templates:
- Dashboard tabs
- Forms with multiple sections
- Lists with headers/footers
- Any component with 3+ logical blocks

---

## 🚨 CRITICAL RULE #6: Component Selector Prefix

### The Rule

**ALL custom components MUST use `os-` prefix instead of `app-`**

### Why This Matters

The `os-` prefix:
- Prevents naming conflicts with Angular's default `app-` prefix
- Provides clear identification of our custom components
- Maintains consistency across the codebase

### Examples

```typescript
// ❌ WRONG
@Component({
  selector: 'app-my-component',
  // ...
})

// ✅ CORRECT
@Component({
  selector: 'os-my-component',
  // ...
})
```

```html
<!-- ❌ WRONG -->
<app-card title="Example">Content</app-card>

<!-- ✅ CORRECT -->
<os-card title="Example">Content</os-card>
```

---

## 🚨 CRITICAL RULE #7: No Automatic Dark Mode

### The Rule

**NEVER use `@media (prefers-color-scheme: dark)` unless dark mode is officially implemented**

### Why This Matters

`prefers-color-scheme: dark` automatically applies when user has dark mode in OS settings, even if the application doesn't support it, causing inconsistent styling.

### Examples

```scss
// ❌ WRONG - Automatic dark mode detection
@media (prefers-color-scheme: dark) {
  .my-component {
    background: #333;
    color: #fff;
  }
}

// ✅ CORRECT - Controlled theme classes
.dark-theme .my-component {
  background: var(--os-color-gray-700);
  color: var(--os-color-white);
}
```

**Wait for official dark mode implementation before adding dark mode styles.**

---

## 🚨 CRITICAL RULE #8: Documentation Language

### The Rule

**ALL documentation, README files, code comments, and commit messages MUST be written in English.**

### What This Includes

- ✅ Inline comments
- ✅ JSDoc/TSDoc comments
- ✅ README files
- ✅ Commit messages
- ✅ Variable names, function names, code identifiers

### Exception

❌ User-facing text and translations remain in their respective languages (en, he, ru, uk)

### Examples

```typescript
// ✅ CORRECT - English comments
/**
 * Fetches customer data from the API
 * @param customerId - Unique customer identifier
 */
fetchCustomer(customerId: string): Observable<Customer> {
  // Call API and handle errors
  return this.http.get<Customer>(`/api/v1/customers/${customerId}`);
}

// ❌ WRONG - Non-English comments
/**
 * Получает данные клиента из API
 */
```

---

## 📋 Complete Component Template

Here's what a properly structured component looks like:

```typescript
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-example',
  standalone: true,                                    // ✅ Rule #2
  changeDetection: ChangeDetectionStrategy.OnPush,    // ✅ Rule #3
  imports: [CommonModule],                            // ✅ Rule #2
  templateUrl: './example.component.html',            // ✅ Rule #5 (if complex)
  styleUrl: './example.component.scss'
})
export class ExampleComponent {
  // ✅ Rule #4 - Use inject()
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);

  data: any = {};

  updateData(newData: any): void {
    // ✅ Rule #3 - Immutable update + markForCheck()
    this.data = { ...this.data, ...newData };
    this.cdr.markForCheck();
  }
}
```

---

## 🔍 Checklist Before Creating Component

Before creating any component, verify:

- [ ] Using absolute file paths (Rule #1)
- [ ] Component is standalone (Rule #2)
- [ ] OnPush change detection enabled (Rule #3)
- [ ] Using inject() for dependencies (Rule #4)
- [ ] External template if complex (Rule #5)
- [ ] Component selector uses `os-` prefix (Rule #6)
- [ ] No `@media (prefers-color-scheme: dark)` (Rule #7)
- [ ] All comments in English (Rule #8)
- [ ] No HttpClientModule import
- [ ] No deprecated Angular APIs
- [ ] No hardcoded colors (use CSS variables - see SCSS rules)
- [ ] Proper TypeScript typing (interfaces, type aliases)

---

## 📚 Related Documentation

- **SCSS Rules:** [.claude/rules/06-scss.md](./06-scss.md) - Styling guidelines
- **Component Guide:** [.claude/guides/creating-component.md](../guides/creating-component.md) - Step-by-step
- **TypeScript Config:** Angular 19 with ES2022, strictNullChecks disabled

---

## ⚠️ TypeScript Configuration Notes

**Current Settings:**
- Target: ES2022
- Strict null checks: **DISABLED** (`strictNullChecks: false`)
- **Be cautious with null/undefined handling** - TypeScript won't warn you

---

## 🎨 Design System Quick Reference

The project uses a Tailwind-inspired design system:

**Color System** (`src/scss/_variables.scss`):
- 26 global colors with variants
- CSS variables for theming
- `generate-os-colors()` mixin for components

**For full SCSS rules:** See [.claude/rules/06-scss.md](./06-scss.md)

---

**Last Updated:** 2025-11-15
**Priority:** 🔴 Critical - Project-breaking if violated
