# Research: Angular 21 Upgrade

**Feature**: 013-angular-21-upgrade
**Date**: 2025-12-16
**Status**: Complete

## Summary

Research findings for upgrading One-Sim-Portal from Angular 19.2.15 to Angular 21.0.4.

---

## 1. Angular Version Requirements

### Angular 21.0.x Requirements

| Dependency | Required Version |
|------------|------------------|
| **Node.js** | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0 |
| **TypeScript** | >=5.9.0 <6.0.0 |
| **RxJS** | ^6.5.3 \|\| ^7.4.0 |

### Angular 20.x Requirements (intermediate step)

| Dependency | Required Version |
|------------|------------------|
| **Node.js** | ^20.19.0 \|\| ^22.12.0 \|\| ^24.0.0 |
| **TypeScript** | >=5.8.0 <6.0.0 |
| **RxJS** | ^6.5.3 \|\| ^7.4.0 |

### Current Project Versions

| Dependency | Current | Target (Angular 21) | Action |
|------------|---------|---------------------|--------|
| Node.js | ^18.13.0 \|\| >=20.9.0 | ^20.19.0+ | **Upgrade required** |
| TypeScript | ~5.8.3 | >=5.9.0 | **Upgrade required** |
| RxJS | ~7.8.1 | ^7.4.0 | Compatible |
| zone.js | ~0.15.1 | TBD | Check compatibility |

**Decision**: Must upgrade Node.js to 20.19+ and TypeScript to 5.9+

---

## 2. CoreUI Angular Compatibility

### Research Finding

CoreUI has released **v5.6.x** with full Angular 21 support.

| CoreUI Version | Angular Version | Release Date |
|----------------|-----------------|--------------|
| 5.6.2 | Angular 21 | Dec 15, 2025 |
| 5.6.1 | Angular 21 | Dec 12, 2025 |
| 5.6.0 | Angular 21 | Dec 9, 2025 |
| 5.5.25 | Angular 20 | Nov 26, 2025 |

### Current vs Target

| Package | Current | Target |
|---------|---------|--------|
| @coreui/angular | ~5.1.11 | ^5.6.2 |
| @coreui/angular-chartjs | ~5.1.11 | ^5.6.x |
| @coreui/icons-angular | ~5.1.11 | ^5.6.x |

**Decision**: Upgrade CoreUI to 5.6.2 (Angular 21 compatible)
**Risk**: LOW - Official support available

---

## 3. @angular/flex-layout Replacement

### Research Finding

`@angular/flex-layout` is **deprecated and archived** (January 6, 2025).

### Alternatives Evaluated

| Alternative | Pros | Cons | Recommendation |
|-------------|------|------|----------------|
| **Native CSS Flexbox/Grid** | No dependencies, best performance | Requires code changes | **RECOMMENDED** |
| **@ngbracket/ngx-layout** | Drop-in replacement | Unofficial fork, may lag Angular versions | Backup option |
| **TailwindCSS** | Modern, utility-first | Major change, learning curve | Out of scope |

**Decision**: Remove @angular/flex-layout, use native CSS
**Rationale**:
- Native CSS is Angular team's official recommendation
- Reduces bundle size
- No dependency maintenance overhead
- Project already uses CSS variables and modern SCSS

**Migration Strategy**:
1. Identify all flex-layout directive usage in templates
2. Replace with equivalent CSS classes or inline styles
3. Use Angular CDK Layout for breakpoint detection if needed

---

## 4. ngx-translate Compatibility

### Research Finding

Latest version: **@ngx-translate/core v17.0.0**

| Feature | Status |
|---------|--------|
| Angular 20 support | Documented |
| Angular 21 support | Not explicitly documented, likely compatible |
| inject() support | Full support in v17 |
| Standalone components | Supported |

### Current vs Target

| Package | Current | Target |
|---------|---------|--------|
| @ngx-translate/core | ^16.0.4 | ^17.0.0 |
| @ngx-translate/http-loader | ^8.0.0 | ^17.0.0 |

**Decision**: Upgrade to v17, test with Angular 21
**Risk**: LOW - v17 designed for modern Angular

---

## 5. Other Dependencies Assessment

### ngx-scrollbar

| Package | Current | Action |
|---------|---------|--------|
| ngx-scrollbar | ^12.0.0 | Check npm for Angular 21 compatible version |

**Requires**: @angular/cdk (will be updated with Angular)

### ngx-webstorage

| Package | Current | Action |
|---------|---------|--------|
| ngx-webstorage | ^12.0.0 | Check npm for Angular 21 compatible version |

### ngx-cookie-service

| Package | Current | Action |
|---------|---------|--------|
| ngx-cookie-service | ^17.1.0 | Check npm for Angular 21 compatible version |

**Decision**: Check latest versions during upgrade, update as needed

---

## 6. Upgrade Strategy

### Recommended Approach: Sequential Upgrade

Angular recommends upgrading one major version at a time.

```
Angular 19.2.15 → Angular 20.x → Angular 21.x
```

### Step-by-Step Plan

#### Phase 1: Preparation
1. Record current bundle size for comparison
2. Ensure clean git state
3. Verify Node.js version (upgrade if needed)

#### Phase 2: Angular 19 → 20
```bash
ng update @angular/core@20 @angular/cli@20
ng update @angular/material@20 @angular/cdk@20
```

#### Phase 3: Angular 20 → 21
```bash
ng update @angular/core@21 @angular/cli@21
ng update @angular/material@21 @angular/cdk@21
```

#### Phase 4: Third-party Updates
```bash
npm update @coreui/angular @coreui/angular-chartjs @coreui/icons-angular
npm update @ngx-translate/core @ngx-translate/http-loader
npm update ngx-scrollbar ngx-webstorage ngx-cookie-service
```

#### Phase 5: flex-layout Removal
1. Remove @angular/flex-layout from package.json
2. Search and replace flex-layout directives with CSS
3. Test all affected components

#### Phase 6: TypeScript Update
```bash
npm install typescript@~5.9.0
```

#### Phase 7: Verification
1. Run `npm run build-prod`
2. Run `npm start`
3. Test all major routes
4. Compare bundle size

---

## 7. Angular Official Migrations (Schematics)

Angular provides official migration schematics to modernize code. These are **optional but recommended** for better performance and modern Angular patterns.

### 7.1 CommonModule to Standalone Imports

**Command:** `ng generate @angular/core:common-to-standalone`

**Purpose:** Replaces bulk `CommonModule` import with only the specific directives and pipes used in template.

| Before | After |
|--------|-------|
| `imports: [CommonModule]` | `imports: [NgIf, AsyncPipe, JsonPipe]` |

**Benefits:**
- Smaller bundle size (tree-shaking)
- Explicit dependencies
- Better code clarity

**Source:** [Angular Migration Guide](https://angular.dev/reference/migrations/common-to-standalone)

### 7.2 NgStyle to Native Style Binding

**Command:** `ng generate @angular/core:ngstyle-to-style`

**Purpose:** Converts `[ngStyle]` directive to native `[style]` binding.

| Before | After |
|--------|-------|
| `[ngStyle]="{'color': 'red'}"` | `[style]="{'color': 'red'}"` |

**Options:**
- `--best-effort-mode` - Also migrates object variable bindings (use with caution)

**Source:** [Angular Migration Guide](https://angular.dev/reference/migrations/ngstyle-to-style)

### 7.3 NgClass to Native Class Binding

**Command:** `ng generate @angular/core:ngclass-to-class`

**Purpose:** Converts `[ngClass]` directive to native `[class]` binding.

| Before | After |
|--------|-------|
| `[ngClass]="{active: isActive}"` | `[class]="{active: isActive}"` |

**Options:**
- `--migrate-space-separated-key` - Converts space-separated keys to individual bindings

**Source:** [Angular Migration Guide](https://angular.dev/reference/migrations/ngclass-to-class)

### Migration Execution Order

1. First complete Angular core upgrade (19 → 20 → 21)
2. Run `common-to-standalone` migration
3. Run `ngstyle-to-style` migration
4. Run `ngclass-to-class` migration
5. Verify build and test

---

## 8. Breaking Changes Summary

### Angular 20 Breaking Changes (from 19)
- No major breaking changes for this project
- Continued deprecation of legacy APIs

### Angular 21 Breaking Changes (from 20)
- **Zoneless as default** for new projects (existing Zone.js apps unaffected)
- **TypeScript 5.9 required**
- Esbuild is now the default builder

### Project-Specific Considerations
- All components already use OnPush → zoneless-ready
- Already using standalone components → no module migration needed
- Already using inject() → no DI changes needed
- Signal inputs/outputs already adopted → aligned with modern Angular

---

## 9. Risk Assessment Update

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CoreUI incompatibility | LOW | HIGH | v5.6.2 supports Angular 21 |
| ngx-translate issues | LOW | MEDIUM | v17 supports modern Angular |
| flex-layout removal | MEDIUM | MEDIUM | Use native CSS, tested migration |
| Build failures | MEDIUM | HIGH | Sequential upgrade, test after each step |
| Runtime regressions | LOW | HIGH | Manual testing of all routes |

---

## Sources

- [Angular Version Compatibility](https://angular.dev/reference/versions)
- [CoreUI Angular Releases](https://github.com/coreui/coreui-angular/releases)
- [ngx-translate Compatibility](https://ngx-translate.org/getting-started/angular-compatibility/)
- [flex-layout Deprecation](https://github.com/angular/flex-layout/issues/1433)
- [@ngbracket/ngx-layout](https://github.com/ngbracket/ngx-layout)
- [CommonModule to Standalone Migration](https://angular.dev/reference/migrations/common-to-standalone)
- [NgStyle to Style Migration](https://angular.dev/reference/migrations/ngstyle-to-style)
- [NgClass to Class Migration](https://angular.dev/reference/migrations/ngclass-to-class)
