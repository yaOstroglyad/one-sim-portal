# Implementation Plan: Angular 21 Upgrade

**Branch**: `013-angular-21-upgrade` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-angular-21-upgrade/spec.md`

## Summary

Upgrade One-Sim-Portal from Angular 19.2.15 to Angular 21.0.4, including all Angular packages, CoreUI, ngx-translate, and removal of deprecated @angular/flex-layout. Sequential upgrade path: 19 → 20 → 21.

## Technical Context

**Language/Version**: TypeScript 5.8.3 → 5.9.x
**Primary Dependencies**: Angular 21, CoreUI 5.6.x, Angular Material 21, RxJS 7.8, Chart.js 4.x
**Storage**: N/A (no database changes)
**Testing**: Manual testing (verify build, routes, functionality)
**Target Platform**: Web (browser), Node.js ^20.19.0+
**Project Type**: Web application (Angular SPA)
**Performance Goals**: Bundle size within 15% of current, startup within 20% of current
**Constraints**: Fix-forward approach (no rollback), Zone.js retained
**Scale/Scope**: ~50 components, ~20 services, 4 lazy-loaded modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Status | Notes |
|------|--------|-------|
| I. Absolute Paths Only | ✅ PASS | All file operations will use absolute paths |
| II. Component Architecture | ✅ PASS | No new components; existing follow OnPush, standalone, inject() |
| III. HTTP Error Handling | ✅ PASS | No HTTP changes; existing handlers remain |
| IV. Models Organization | ✅ PASS | No new models |
| V. Services Organization | ✅ PASS | No new services |
| VI. Utility Functions | ✅ PASS | No new utilities |
| VII. SCSS Architecture | ✅ PASS | No SCSS changes (except flex-layout CSS replacement) |
| VIII. Icons & SVG | ✅ PASS | No icon changes |
| IX. Documentation Language | ✅ PASS | English only |
| X. Search Before Creating | ✅ PASS | No new code creation |

**Gate Result**: PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/013-angular-21-upgrade/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - compatibility research
├── data-model.md        # Phase 1 output - package dependency model
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/
├── src/app/
│   ├── shared/           # Shared components, services, models
│   ├── views/            # Feature modules (lazy-loaded)
│   └── layout/           # Main layout
├── package.json          # PRIMARY TARGET - dependency updates
├── package-lock.json     # Will be regenerated
├── angular.json          # May need builder updates
├── tsconfig.json         # TypeScript version compatibility
└── tsconfig.app.json     # App-specific TS config
```

**Structure Decision**: Existing Angular SPA structure. Changes limited to:
- `package.json` - version updates
- Template files - flex-layout directive removal
- SCSS/CSS files - flex-layout replacement styles

## Upgrade Phases

### Phase 1: Preparation

1. Record baseline metrics (bundle size, startup time)
2. Verify Node.js version ≥ 20.19.0
3. Clean npm cache and node_modules
4. Create checkpoint (git commit if needed)

### Phase 2: Angular 19 → 20

```bash
ng update @angular/core@20 @angular/cli@20
ng update @angular/material@20 @angular/cdk@20
```

- Run migrations automatically applied by ng update
- Resolve any compilation errors
- Verify build and dev server

### Phase 3: Angular 20 → 21

```bash
ng update @angular/core@21 @angular/cli@21
ng update @angular/material@21 @angular/cdk@21
```

- Update TypeScript to 5.9.x
- Run migrations
- Resolve compilation errors
- Verify build and dev server

### Phase 4: Angular Code Migrations (Optional but Recommended)

Run official Angular schematics to modernize code:

#### 4.1 CommonModule to Standalone Imports

Replaces bulk `CommonModule` import with specific directives/pipes used in template.

```bash
ng generate @angular/core:common-to-standalone
```

**Before:**
```typescript
import { CommonModule } from '@angular/common';
@Component({ imports: [CommonModule] })
```

**After:**
```typescript
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
@Component({ imports: [AsyncPipe, JsonPipe, NgIf] })
```

#### 4.2 NgStyle to Native Style Binding

Converts `[ngStyle]` to native `[style]` binding.

```bash
ng generate @angular/core:ngstyle-to-style
```

**Before:** `<div [ngStyle]="{'background-color': 'red'}">`
**After:** `<div [style]="{'background-color': 'red'}">`

#### 4.3 NgClass to Native Class Binding

Converts `[ngClass]` to native `[class]` binding.

```bash
ng generate @angular/core:ngclass-to-class
```

**Before:** `<div [ngClass]="{active: isActive}">`
**After:** `<div [class]="{active: isActive}">`

> **Note:** These migrations are safe and improve bundle size by removing directive overhead.

### Phase 5: CoreUI Update

```bash
npm install @coreui/angular@^5.6.2 @coreui/angular-chartjs@^5.6 @coreui/icons-angular@^5.6
```

- Verify CoreUI components render correctly
- Check navigation, cards, buttons, modals

### Phase 6: Third-party Updates

```bash
npm install @ngx-translate/core@^17 @ngx-translate/http-loader@^17
npm update ngx-scrollbar ngx-webstorage ngx-cookie-service
```

- Verify translations work
- Verify scrollbar, storage, cookies

### Phase 7: flex-layout Removal

1. Search for flex-layout usage:
   ```bash
   grep -r "fxLayout\|fxFlex\|fxLayoutAlign\|fxLayoutGap" src/
   ```

2. For each occurrence:
   - Replace with CSS flexbox classes
   - Or use Angular CDK BreakpointObserver for responsive

3. Remove package:
   ```bash
   npm uninstall @angular/flex-layout
   ```

### Phase 8: Verification

1. Production build: `npm run build-prod`
2. Development server: `npm start`
3. Test all routes manually
4. Compare bundle size to baseline
5. Check for console errors

## flex-layout Migration Reference

| Directive | CSS Replacement |
|-----------|-----------------|
| `fxLayout="row"` | `display: flex; flex-direction: row;` |
| `fxLayout="column"` | `display: flex; flex-direction: column;` |
| `fxFlex="50"` | `flex: 1 1 50%;` |
| `fxLayoutAlign="center center"` | `justify-content: center; align-items: center;` |
| `fxLayoutGap="10px"` | `gap: 10px;` |
| `fxHide.lt-md` | `@media (max-width: 959px) { display: none; }` |

For responsive breakpoints, use Angular CDK:
```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Build failure after ng update | Run updates sequentially, fix errors before proceeding |
| CoreUI visual regression | Compare screenshots before/after |
| flex-layout removal breaks layout | Test each component after CSS migration |
| Third-party package incompatibility | Check npm for Angular 21 compatible versions first |

## Complexity Tracking

> No constitution violations requiring justification.

| Item | Decision | Rationale |
|------|----------|-----------|
| Sequential upgrade | 19→20→21 | Angular recommended approach |
| Keep Zone.js | Yes | Zoneless migration is separate future task |
| Native CSS for flex-layout | Yes | Official Angular recommendation |

## Artifacts Generated

- [x] research.md - Compatibility research complete
- [x] data-model.md - Package dependency model complete
- [ ] tasks.md - To be generated by `/speckit.tasks`
