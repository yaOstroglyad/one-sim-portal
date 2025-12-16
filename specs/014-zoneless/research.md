# Research: Zoneless Angular Migration

**Feature**: 014-zoneless
**Date**: 2025-12-16

## Overview

Research findings for migrating One-Sim-Portal to Angular zoneless change detection.

---

## 1. Zoneless Change Detection API

### Decision
Use `provideExperimentalZonelessChangeDetection()` from `@angular/core`

### Rationale
- Official Angular API for zoneless mode (introduced in Angular 18, stable in Angular 21)
- Automatically handles change detection scheduling via signals
- Works with existing OnPush components
- No additional dependencies required

### Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Manual Zone.js patching | Too complex, not officially supported |
| Third-party zoneless libraries | Unnecessary when official API exists |
| Partial zoneless (per-component) | Full application zoneless is simpler and more performant |

---

## 2. Configuration Changes Required

### Decision
Three configuration points need modification:
1. `main.ts` - Add zoneless provider
2. `angular.json` - Remove zone.js from polyfills
3. `polyfills.ts` - Remove zone.js import (if present)

### Rationale
- Minimal changes for maximum impact
- Angular CLI handles most configuration automatically
- Zone.js exclusion from bundle is automatic when provider is used

### Configuration Details

**main.ts changes:**
```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    // ... existing providers
  ]
});
```

**angular.json changes:**
```json
{
  "polyfills": [
    // Remove: "zone.js"
  ]
}
```

---

## 3. Third-Party Library Compatibility

### Decision
Angular Material and CoreUI are compatible with zoneless mode

### Rationale
- Angular Material 18+ is designed to work with zoneless
- CoreUI uses standard Angular patterns
- Both libraries use proper change detection triggers

### Risk Mitigation
- Test all Material components after migration
- Monitor console for change detection warnings
- Have rollback plan ready (re-add zone.js)

---

## 4. RxJS and Observable Handling

### Decision
Continue using `async` pipe in templates for Observable subscriptions

### Rationale
- `async` pipe automatically triggers change detection in zoneless mode
- Already used throughout the application per constitution
- No code changes required for existing async pipe usage

### Patterns to Verify
| Pattern | Zoneless Compatible | Action |
|---------|---------------------|--------|
| `async` pipe in template | ✅ Yes | No change needed |
| `subscribe()` with `cdr.markForCheck()` | ✅ Yes | No change needed |
| `subscribe()` without change detection | ⚠️ Maybe | Audit and fix |
| Signal-based data | ✅ Yes | No change needed |

---

## 5. Component Audit Strategy

### Decision
Progressive testing approach: Enable zoneless, test systematically, fix issues

### Rationale
- Project already uses OnPush + Signals (from Angular 21 upgrade)
- Most components should work without modification
- Issues will manifest as "stale UI" - easy to identify

### Audit Priority
1. **High Priority**: Forms, dialogs, tables (complex interactions)
2. **Medium Priority**: Navigation, sidebars, headers
3. **Low Priority**: Static display components

---

## 6. Rollback Strategy

### Decision
Keep zone.js available but not loaded; quick rollback if needed

### Rationale
- Zone.js remains in node_modules
- Re-adding to polyfills takes < 1 minute
- No code changes needed for rollback

### Rollback Steps
1. Add `"zone.js"` back to angular.json polyfills
2. Remove `provideExperimentalZonelessChangeDetection()` from main.ts
3. Rebuild and deploy

---

## 7. Performance Measurement

### Decision
Measure before/after: bundle size, TTI, FID

### Metrics to Capture
| Metric | How to Measure | Target |
|--------|----------------|--------|
| Bundle size (gzipped) | `ng build --stats-json` | -30KB+ |
| Time to Interactive | Lighthouse | -500ms |
| First Input Delay | Chrome DevTools | <100ms |
| Change detection cycles | Angular DevTools | Reduced |

---

## Summary

The migration is low-risk due to:
1. Project already uses OnPush change detection
2. Signals are extensively used (Angular 21 upgrade)
3. Official Angular API is mature
4. Easy rollback if issues arise

**Recommended approach**: Enable zoneless, test all features, fix any stale UI issues.
