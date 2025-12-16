# Data Model: Zoneless Angular Migration

**Feature**: 014-zoneless
**Date**: 2025-12-16

## Overview

This feature involves configuration changes only - no new data models, entities, or API contracts are required.

---

## Configuration Changes

### 1. Bootstrap Configuration (main.ts)

**Current State:**
```typescript
bootstrapApplication(AppComponent, {
  providers: [
    // existing providers
  ]
});
```

**Target State:**
```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // existing providers
  ]
});
```

---

### 2. Angular CLI Configuration (angular.json)

**Current State:**
```json
{
  "projects": {
    "one-sim-portal": {
      "architect": {
        "build": {
          "options": {
            "polyfills": [
              "zone.js"
            ]
          }
        }
      }
    }
  }
}
```

**Target State:**
```json
{
  "projects": {
    "one-sim-portal": {
      "architect": {
        "build": {
          "options": {
            "polyfills": [
              // zone.js removed
            ]
          }
        }
      }
    }
  }
}
```

---

### 3. Polyfills File (src/polyfills.ts)

**Action**: Remove any direct `import 'zone.js';` if present

---

## Change Detection Patterns

### Patterns That Work in Zoneless Mode

| Pattern | Example | Works? |
|---------|---------|--------|
| Signal in template | `{{ mySignal() }}` | ✅ Yes |
| Async pipe | `{{ data$ \| async }}` | ✅ Yes |
| Input signals | `readonly data = input<T>()` | ✅ Yes |
| Computed signals | `readonly derived = computed(() => ...)` | ✅ Yes |
| Effect | `effect(() => { ... })` | ✅ Yes |
| OnPush + markForCheck | `this.cdr.markForCheck()` | ✅ Yes |

### Patterns That May Need Fixes

| Pattern | Issue | Fix |
|---------|-------|-----|
| Plain properties with setTimeout | No auto-detection | Use signal or markForCheck |
| Manual subscriptions without CD | Stale UI | Add markForCheck or use async pipe |
| Mutable array/object updates | No detection | Use immutable patterns |

---

## No API Changes

This migration does not affect:
- HTTP API endpoints
- Request/response formats
- Authentication flows
- Data persistence

---

## No New Entities

This migration does not introduce:
- New models or interfaces
- New services
- New components
- New utilities

---

## Verification Checklist

After migration, verify:
- [ ] Application bootstraps without Zone.js
- [ ] All routes navigate correctly
- [ ] All forms submit and validate
- [ ] All tables load and filter
- [ ] All dialogs open and close
- [ ] All HTTP requests update UI
- [ ] No console errors about change detection
