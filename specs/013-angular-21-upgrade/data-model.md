# Data Model: Angular 21 Upgrade

**Feature**: 013-angular-21-upgrade
**Date**: 2025-12-16

## Overview

This upgrade does not introduce new business entities. The "data model" for this feature represents the package dependency structure that must be updated.

---

## Package Dependencies Model

### Core Angular Packages

| Package | Current | Target | Type |
|---------|---------|--------|------|
| @angular/core | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/common | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/compiler | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/forms | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/router | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/animations | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/platform-browser | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/platform-browser-dynamic | ^19.2.15 | ^21.0.4 | dependencies |
| @angular/language-service | ^19.2.15 | ^21.0.4 | dependencies |

### Angular Material & CDK

| Package | Current | Target | Type |
|---------|---------|--------|------|
| @angular/cdk | ^19.2.19 | ^21.0.x | dependencies |
| @angular/material | ^19.2.19 | ^21.0.x | dependencies |

### Angular Dev Tools

| Package | Current | Target | Type |
|---------|---------|--------|------|
| @angular-devkit/build-angular | ^19.2.17 | ^21.0.x | devDependencies |
| @angular/cli | ^19.2.17 | ^21.0.x | devDependencies |
| @angular/compiler-cli | ^19.2.15 | ^21.0.4 | devDependencies |
| @angular/localize | ^19.2.15 | ^21.0.4 | devDependencies |

### CoreUI Packages

| Package | Current | Target | Type |
|---------|---------|--------|------|
| @coreui/angular | ~5.1.11 | ^5.6.2 | dependencies |
| @coreui/angular-chartjs | ~5.1.11 | ^5.6.x | dependencies |
| @coreui/icons-angular | ~5.1.11 | ^5.6.x | dependencies |
| @coreui/coreui | ^5.1.0 | ^5.2.x | dependencies |
| @coreui/icons | ^3.0.1 | latest | dependencies |
| @coreui/utils | ^2.0.2 | latest | dependencies |
| @coreui/chartjs | ^4.0.0 | latest | dependencies |

### Translation Packages

| Package | Current | Target | Type |
|---------|---------|--------|------|
| @ngx-translate/core | ^16.0.4 | ^17.0.0 | dependencies |
| @ngx-translate/http-loader | ^8.0.0 | ^17.0.0 | dependencies |

### Utility Packages

| Package | Current | Target | Type |
|---------|---------|--------|------|
| ngx-scrollbar | ^12.0.0 | latest | dependencies |
| ngx-webstorage | ^12.0.0 | latest | dependencies |
| ngx-cookie-service | ^17.1.0 | latest | dependencies |

### Packages to Remove

| Package | Reason |
|---------|--------|
| @angular/flex-layout | Deprecated, archived Jan 2025 |

### Build Tools

| Package | Current | Target | Type |
|---------|---------|--------|------|
| typescript | ~5.8.3 | ~5.9.0 | devDependencies |
| zone.js | ~0.15.1 | ~0.15.x | dependencies |

### Stable Packages (No Changes Expected)

| Package | Version | Notes |
|---------|---------|-------|
| rxjs | ~7.8.1 | Compatible with Angular 21 |
| chart.js | ^4.4.2 | Framework-agnostic |
| jwt-decode | ^3.1.2 | Framework-agnostic |
| lodash | ^4.17.21 | Framework-agnostic |
| qrcode | ^1.5.4 | Framework-agnostic |
| xlsx | ^0.18.5 | Framework-agnostic |
| tslib | ^2.3.0 | Compatible |

---

## Dependency Graph

```
@angular/core@21
├── @angular/common@21
├── @angular/compiler@21
├── @angular/forms@21
├── @angular/router@21
├── @angular/animations@21
├── @angular/platform-browser@21
├── @angular/platform-browser-dynamic@21
├── @angular/cdk@21
│   └── @angular/material@21
└── zone.js@0.15.x

@coreui/angular@5.6.x
├── @coreui/coreui@5.x
├── @coreui/icons@3.x
└── @angular/cdk@21 (peer)

@ngx-translate/core@17
└── @ngx-translate/http-loader@17
```

---

## Upgrade Order (Dependency-Safe)

1. **Node.js** → 20.19+ (if not already)
2. **@angular/core** + related → 20.x (intermediate)
3. **@angular/material** + **@angular/cdk** → 20.x
4. **@angular/core** + related → 21.x
5. **@angular/material** + **@angular/cdk** → 21.x
6. **@coreui/*** → 5.6.x
7. **@ngx-translate/*** → 17.x
8. **typescript** → 5.9.x
9. **ngx-*** utilities → latest
10. **Remove** @angular/flex-layout

---

## Validation Checkpoints

After each upgrade step, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run build` succeeds
- [ ] `npm start` launches dev server
- [ ] No console errors in browser
