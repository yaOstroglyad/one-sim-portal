---
name: fix-errors
description: Fixes build errors, lint errors, and TypeScript compilation issues. Use when asked to fix errors, fix build, fix lint, resolve compilation errors, or debug build issues.
allowed-tools: Read, Edit, Bash, Glob, Grep
---

# Fix Build/Lint Errors

Fix compilation, build, and lint errors in One-Sim-Portal.

> **Rules Reference:** All fixes must comply with `constitution.md`.
> This skill provides the **procedure** for diagnosing and fixing errors.

## Procedure

1. **Run build/lint** to get current errors (if not already provided)
2. **Categorize errors** by type
3. **Fix in priority order** (see below)
4. **Verify fix** doesn't break other rules
5. **Re-run build** to confirm resolution

## Error Categories & Solutions

### TypeScript Compilation Errors

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| `Cannot find module` | Missing import | Add import, check tsconfig paths |
| `Property does not exist` | Wrong type | Fix type, add optional chaining |
| `Type X is not assignable` | Type mismatch | Fix type or add type assertion |
| `Circular dependency` | Barrel imports | Use `@shared/constants` (constitution Section II) |

### Angular Errors

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| `NG0100: ExpressionChangedAfterItHasBeenChecked` | Change detection | Use `signal()`, avoid sync mutations |
| `NG0200: Circular dependency` | Service injection | Use `Injector` lazy loading (constitution Section II) |
| `Component is not standalone` | Missing flag | Add `standalone: true` |
| `NullInjectorError` | Missing provider | Add to providers or use `providedIn: 'root'` |

### SCSS Errors

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| `@import is deprecated` | Legacy syntax | Change to `@use "variables"` |
| `Undefined variable` | Wrong import | Use `@use "variables" as vars` |
| `Can't find stylesheet` | Wrong path | Use `@use "variables"` (no path needed) |

### Lint Errors

| Error Pattern | Likely Cause | Solution |
|---------------|--------------|----------|
| `Unexpected any` | Missing type | Add proper type annotation |
| `Prefer const` | let not reassigned | Change to const |
| `No unused vars` | Dead code | Remove or use variable |

## Common Fixes (constitution.md compliant)

### Circular Dependency in Shared

```typescript
// ❌ WRONG - in file exported by @shared
import { PERMISSION } from '@shared';

// ✅ FIX
import { PERMISSION } from '@shared/constants';
```

### HTTP Interceptor Circular

```typescript
// ❌ WRONG
constructor(private auth: AuthService) {}

// ✅ FIX
private _auth: AuthService | null = null;
constructor(private injector: Injector) {}
private get auth() {
  return this._auth ??= this.injector.get(AuthService);
}
```

### Constructor Injection

```typescript
// ❌ WRONG
constructor(private http: HttpClient) {}

// ✅ FIX
private readonly http = inject(HttpClient);
```

### Legacy SCSS

```scss
// ❌ WRONG
@import "../../../../scss/variables";
color: #2c2c2c;

// ✅ FIX
@use "variables" as vars;
color: var(--os-color-text-primary);
```

## Commands Reference

```bash
# Run build
npm run build

# Run lint
npm run lint

# Type check only
npx tsc --noEmit

# Find specific error in codebase
grep -rn "error pattern" src/
```

## Quick Checklist

After fixing, verify:
- [ ] Build passes (`npm run build`)
- [ ] Fix follows constitution.md rules
- [ ] No new errors introduced
- [ ] No `@import` in SCSS (use `@use`)
- [ ] No constructor injection (use `inject()`)
- [ ] No hardcoded colors (use CSS variables)
