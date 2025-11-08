# Feature Toggle Service

## Overview

Feature Toggle Service provides a centralized mechanism for managing feature flags in the application. The service allows dynamic enabling/disabling of functionality without requiring application restart.

## Architecture

### Core Components

1. **FeatureToggleService** (`src/app/shared/services/feature-toggle/feature-toggle.service.ts`)
   - Main service for working with feature toggles
   - Loads and caches toggle states
   - Automatically refreshes toggles every 5 minutes
   - Provides synchronous and asynchronous API

2. **Configuration** (`src/app/shared/services/feature-toggle/feature-toggle.config.ts`)
   - `FEATURE_TOGGLE_CONFIG` - centralized toggle configuration
   - `getDefaultTogglesMap()` - converts config to Map
   - `FEATURE_TOGGLES_API_URL` - API endpoint configuration

3. **Static Store** (`src/app/shared/services/feature-toggle/feature-toggle-store.ts`)
   - `FeatureToggleStore` - static storage for global access
   - `isToggleActive()` - global function to check toggle without DI
   - `isToggleActive$()` - reactive version
   - `getFeatureToggleKeys()` - get list of all toggle keys

4. **Token & DI** (`src/app/shared/services/feature-toggle/feature-toggle.token.ts`)
   - `FEATURE_TOGGLES_SERVICE` - injection token for DI
   - Legacy helper functions (not recommended)

5. **Interfaces** (`src/app/shared/model/feature-toggle.interface.ts`)
   - `FeatureToggle` - toggle model
   - `FeatureToggleResponse` - API response model

6. **Directive** (`src/app/shared/directives/feature-toggle.directive.ts`)
   - `*featureToggle` - structural directive for templates

7. **Index File** (`src/app/shared/services/feature-toggle/index.ts`)
   - Exports all feature toggle related functionality
   - Simplifies imports: `import { isToggleActive } from '@shared/services/feature-toggle'`

## Usage

### Method 1: Using Global Helper Functions (Recommended)

```typescript
import { Component } from '@angular/core';
import { isToggleActive } from '@shared/services/feature-toggle';

@Component({
  selector: 'app-example',
  template: `
    <div *ngIf="isToggleActive('new-ui')">
      <!-- New UI -->
    </div>
  `
})
export class ExampleComponent {
  // Make global function available in template
  isToggleActive = isToggleActive;

  onAction() {
    if (isToggleActive('advanced-search')) {
      // Execute advanced search
    }
  }
}
```

### Method 2: Using Dependency Injection

```typescript
import { Component } from '@angular/core';
import { FeatureToggleService } from '@shared/services/feature-toggle';

@Component({
  selector: 'app-example',
  template: `...`
})
export class ExampleComponent {
  constructor(private featureToggleService: FeatureToggleService) {}

  ngOnInit() {
    const isEnabled = this.featureToggleService.isToggleActive('new-ui');
    
    // Subscribe to changes
    this.featureToggleService.isToggleActive$('new-ui').subscribe(enabled => {
      console.log('New UI enabled:', enabled);
    });
  }
}
```

### Method 3: Using Directive in Templates

```html
<!-- Use directive in template -->
<button *featureToggle="'bulk-operations'">
  Bulk Delete
</button>

<!-- Or use with ngIf -->
<button *ngIf="isToggleActive('bulk-operations')">
  Bulk Delete  
</button>
```

## Configuration

Feature toggles are configured in `feature-toggle.config.ts`. Current toggles:

- `new-ui` - New UI design (default: false)
- `advanced-search` - Advanced search functionality (default: false)
- `bulk-operations` - Bulk operations support (default: false)
- `email-notifications` - Email notifications (default: false)
- `test` - Test feature toggle (default: false)
- `addSubscriberButtonToggle` - Add subscriber button visibility (default: true)

### Changing Toggle Values for Testing

```typescript
// Only available in mock mode!
constructor(private featureToggleService: FeatureToggleService) {
  // Enable toggle
  this.featureToggleService.setToggle('my-feature', true);
  
  // Disable toggle
  this.featureToggleService.setToggle('my-feature', false);
}
```

## Backend Integration

To switch from mock data to real API:

1. In `feature-toggle.service.ts`, set `useMockData = false`:
   ```typescript
   private useMockData = false; // Switch to real API
   ```

2. Ensure backend returns data in this format:
   ```json
   {
     "toggles": [
       {
         "key": "feature-key",
         "enabled": true,
         "description": "Feature description",
         "createdAt": "2023-01-01T00:00:00Z",
         "updatedAt": "2023-01-01T00:00:00Z"
       }
     ],
     "timestamp": "2023-01-01T00:00:00Z"
   }
   ```

3. API endpoint is configured in `feature-toggle.config.ts`:
   ```typescript
   export const FEATURE_TOGGLES_API_URL = '/api/v1/feature-toggles';
   ```

## Performance

- Feature toggles are cached in memory via `BehaviorSubject`
- Automatic refresh every 5 minutes
- Synchronous access to cached data
- Global static store for instant access without DI
- Default values loaded immediately on app start

## Best Practices

1. **Naming**: Use kebab-case (e.g., `new-payment-flow`)
2. **Grouping**: Use prefixes for related toggles (`payment-new-ui`, `payment-advanced-options`)
3. **Documentation**: Always add description in `feature-toggle.config.ts` when adding new toggle
4. **Default Values**: Always use safe defaults (usually `false`) in configuration
5. **Cleanup**: Remove unused toggles from both code and configuration

## Template Usage Examples

### Conditional Display

```html
<!-- Using directive -->
<div *featureToggle="'new-ui'">
  New Interface
</div>

<!-- Using ngIf with global function -->
<div *ngIf="isToggleActive('new-ui')">
  New Interface
</div>
```

### Conditional Classes

```html
<div [class.new-design]="isToggleActive('new-ui')"
     [class.advanced]="isToggleActive('advanced-mode')">
  Content
</div>
```

### Disabling Elements

```html
<button [disabled]="!isToggleActive('bulk-operations')">
  Bulk Operation
</button>
```

## Real-World Example

### Managing "Add Subscriber" Button Visibility

In `PrivateCustomerDetailsComponent`, feature toggle is used to control the visibility of the add subscriber button:

```typescript
// private-customer-details.component.ts
import { isToggleActive } from '../../../shared/services/feature-toggle';

export class PrivateCustomerDetailsComponent {
  // Make global function available in template
  isToggleActive = isToggleActive;
  
  // Existing permission checks
  isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
  isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
}
```

```html
<!-- private-customer-details.component.html -->
<!-- Button is shown only if:
     1. User has admin or special permissions
     2. Feature toggle 'addSubscriberButtonToggle' is enabled -->
<button *ngIf="(isAdmin || isSpecial) && isToggleActive('addSubscriberButtonToggle')"
        mat-menu-item
        (click)="addSubscriber()">
    <mat-icon>person_add</mat-icon>
    <span>{{ 'customer.private-customer-details.add-subscriber' | translate }}</span>
</button>
```

The button visibility is controlled by both user permissions AND the feature toggle.

## Testing

When writing tests, you can mock the service:

```typescript
const mockFeatureToggleService = {
  isToggleActive: (key: string) => key === 'test-feature',
  isToggleActive$: (key: string) => of(key === 'test-feature'),
  featureToggles: new Set(['test-feature'])
};

TestBed.configureTestingModule({
  providers: [
    {
      provide: FEATURE_TOGGLES_SERVICE,
      useValue: mockFeatureToggleService
    }
  ]
});
```