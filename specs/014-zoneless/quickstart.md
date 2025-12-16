# Quickstart: Zoneless Angular Migration

**Feature**: 014-zoneless
**Date**: 2025-12-16

## TL;DR

Enable Angular zoneless mode in 3 steps:

1. Add provider to `main.ts`
2. Remove `zone.js` from `angular.json`
3. Test and fix any stale UI issues

---

## Step 1: Enable Zoneless Provider

**File**: `src/main.ts`

```typescript
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(), // ADD THIS
    // ... rest of providers
  ]
});
```

---

## Step 2: Remove Zone.js from Build

**File**: `angular.json`

Find and remove `"zone.js"` from the polyfills array:

```json
"polyfills": [
  // "zone.js"  <-- REMOVE THIS LINE
]
```

---

## Step 3: Test Application

```bash
npm start
```

Navigate through all major features and verify:
- ✅ Pages load correctly
- ✅ Forms work
- ✅ Tables update
- ✅ Dialogs open/close
- ✅ No console errors

---

## Common Issues & Fixes

### Issue: Component doesn't update after HTTP response

**Cause**: Using `subscribe()` without change detection trigger

**Fix**: Use async pipe instead
```html
<!-- Before -->
<div>{{ data.name }}</div>

<!-- After -->
<div>{{ (data$ | async)?.name }}</div>
```

### Issue: UI stale after setTimeout/setInterval

**Cause**: Zone.js no longer patches these APIs

**Fix**: Use signal or markForCheck
```typescript
// Before
setTimeout(() => {
  this.value = newValue; // Won't trigger update
}, 1000);

// After
setTimeout(() => {
  this.value.set(newValue); // Signal triggers update
}, 1000);
```

---

## Rollback (if needed)

1. Add `"zone.js"` back to angular.json polyfills
2. Remove `provideExperimentalZonelessChangeDetection()` from main.ts
3. Rebuild: `npm run build-prod`

---

## Verification Commands

```bash
# Build and check bundle size
npm run build-prod

# Start dev server
npm start

# Check for zone.js in bundle (should be absent)
grep -r "zone.js" dist/
```

---

## Success Criteria

- [ ] Bundle size reduced by 30KB+ (gzipped)
- [ ] All features work without Zone.js
- [ ] No console errors
- [ ] No UI update regressions
