# HLD — Global FAB & Flyout Layout (Angular Standalone + Signals)

> **Status:** Implemented
> **Last Updated:** 2025-11-08 (Added auto-hide behavior with edge detection)

Global FAB (Floating Action Button) + universal flyout panel for the application. Standalone components + Signals + CDK Overlay.

---

## Overview

**Goal:** Single global floating button (FAB) visible on all application pages. Click opens a universal panel (flyout) over the current UI. Panel dynamically loads different features (first implementation - Support Chat).

**Key Features:**
- Global availability regardless of route
- **Auto-hide behavior with edge detection** (macOS Dock-style)
- **Visual indicator** when FAB is hidden
- Panel via CDK Overlay on top of any screen
- Dynamic feature loading via lazy `import()`
- Role-based visibility management through AuthService
- Route-specific buttons with automatic cleanup
- Standalone components + Signals architecture

---

## Architecture

### Key Components

```
┌─────────────────────────────────────┐
│        AppComponent                 │
│  ┌────────────────────────────┐    │
│  │   GlobalFabComponent       │    │  ← FAB button
│  │   (always visible)         │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
           ↓ (click)
┌─────────────────────────────────────┐
│    CDK Overlay (z-index: 1000)      │
│  ┌────────────────────────────┐    │
│  │  FlyoutLayoutComponent     │    │  ← Overlay panel
│  │  ┌──────────────────────┐  │    │
│  │  │  Dynamic Content     │  │    │  ← Lazy-loaded feature
│  │  │  (Portal)            │  │    │
│  │  └──────────────────────┘  │    │
│  └────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Services

**1. GlobalFlyoutService**
- Panel state management (open/closed)
- CDK Overlay lifecycle
- Signal-based state: `isOpen`, `activeFeatureKey`

**2. FeatureRegistryService**
- Registry of available features
- Lazy loading of components
- Component resolution by key

**3. FabConfigService**
- FAB button configuration
- Dynamic button addition/removal
- Route-specific buttons

**4. AuthService** (existing)
- User role verification
- Filter available features/buttons

---

## Auto-Hide Behavior (macOS Dock-style)

### Edge Detection

FAB automatically hides and shows based on mouse position relative to screen edges.

**Trigger Zones:**
- **Show Zone**: 50px from bottom edge of screen
- **Hide Zone**: >50px from bottom edge

**Timing:**
- **Show Delay**: 400ms (prevents accidental triggers)
- **Hide Delay**: 800ms (smooth miss-hover forgiveness)

### Visual Indicator

When FAB is hidden, a subtle pill-shaped indicator is shown at the bottom of the screen.

**Indicator Design:**
- **Size**: 60px × 5px
- **Style**: macOS-style pill with blur and shadows
- **Color**: Primary color (`var(--os-color-primary)`)
- **Effects**:
  - `backdrop-filter: blur(8px) saturate(180%)`
  - Box shadows: soft glow + depth shadow
  - Opacity: 0.85
- **Position**: Bottom center, `border-radius: 3px 3px 0 0`

**Visual appearance:**
```
┌────────────────────────────┐
│      Page Content          │
└────────────────────────────┘
       ▂▂▂▂▂▂▂▂              ← Indicator (60px pill with blur)
    (with soft glow)
```

### State Management

**isVisible Signal:**
```typescript
readonly isVisible = signal(false);
```

**States:**
1. **Hidden** - FAB slides down, indicator shows
2. **Visible** - FAB slides up, indicator hides
3. **Menu Open** - FAB stays visible regardless of mouse position

**Lifecycle:**
- On init: Show FAB for 3 seconds, then auto-hide
- Mouse near bottom edge (50px) for 400ms → Show FAB
- Mouse moves away (>50px) for 800ms → Hide FAB
- Menu opens → Keep FAB visible
- Menu closes → Schedule hide

---

## Feature and Button Registration

### DI Tokens Approach

Using modern Angular approach with injection tokens and `provideAppInitializer`.

```typescript
// main.ts - Global features/buttons
bootstrapApplication(AppComponent, {
  providers: [
    provideFabLayout(),  // System initialization

    // Global button - visible everywhere
    provideFabButton({
      id: 'support-chat',
      label: 'Chat',
      icon: 'chat',
      order: 10,
      // roles not specified = visible to all
      hasMenu: false,
      action: 'component',
      target: 'support-chat'
    }),

    // Global feature
    provideFeature({
      meta: {
        key: 'support-chat',
        title: 'Support Chat',
        icon: '💬',
        order: 10
        // roles not specified = available to all
      },
      load: () => import('./app/features/support-chat/support-chat.shell.component')
        .then(m => m.SupportChatShellComponent)
    })
  ]
});
```

### Route-Specific Buttons

```typescript
// customers.routes.ts - Buttons for specific route
export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    component: CustomersComponent,
    providers: [
      // Button visible ONLY on /customers
      provideFabButton({
        id: 'create-customer',
        label: 'Create',
        icon: 'plus',
        order: 20,
        roles: ['admin'],  // Only admins
        action: 'route',
        target: '/customers/create'
      })
    ]
  }
];
```

**Automatic cleanup:** When leaving the route, buttons are automatically removed via `DestroyRef`.

---

## Permission Checking

### AuthService Integration

Using existing role system through `AuthService`:

```typescript
// feature-provider.ts
const authService = inject(AuthService);
const requiredRoles = button.roles;
const allowed = !requiredRoles || requiredRoles.length === 0
  || requiredRoles.some(role => authService.hasPermission(role));
```

**Logic:**
- If `roles` not specified or empty array → available to all
- If roles specified → check for at least one via `AuthService.hasPermission()`
- Synchronous check (roles already loaded in memory)

**Examples:**
```typescript
// Visible to all
provideFabButton({ id: 'chat', ... })  // roles not specified

// Only admins
provideFabButton({ id: 'admin-panel', roles: ['admin'], ... })

// Admins and support
provideFabButton({ id: 'tickets', roles: ['admin', 'support'], ... })
```

---

## Models

### FabButtonConfig

```typescript
interface FabButtonConfig {
  id: string;              // Unique ID
  label: string;           // Button label
  icon: string;            // Icon (CoreUI name or SVG path)
  order: number;           // Sort order
  roles?: string[];        // Access roles (undefined = all)
  hasMenu: boolean;        // Has submenu
  menuItems?: FabMenuItem[];  // Submenu items
  action: 'route' | 'component' | 'callback' | 'external';
  target?: string;         // Action target
}
```

### FeatureEntry

```typescript
interface FeatureMeta {
  key: string;             // Unique feature key
  title: string;           // Title
  icon?: string;           // Icon
  roles?: string[];        // Access roles
  order?: number;          // Sort order
}

interface FeatureEntry {
  meta: FeatureMeta;
  load: () => Promise<Type<unknown>>;  // Lazy loader
}
```

---

## Components

### GlobalFabComponent

**Location:** `src/app/shared/components/fab-layout/components/global-fab/`

**Purpose:** Global FAB button with auto-hide behavior, positioned at bottom center.

**Features:**
- Standalone component
- OnPush change detection
- Signals for state management
- Dynamic buttons from `FabConfigService`
- Menu support (optional)
- Auto-hide with edge detection
- Visual indicator when hidden

**Auto-hide implementation:**
```typescript
// State management
readonly isVisible = signal(false);
private showTimeout?: number;
private mouseLeaveTimeout?: number;

// Configuration
private readonly EDGE_THRESHOLD = 50;  // px from bottom to show
private readonly HIDE_THRESHOLD = 50;  // px from bottom to hide
private readonly SHOW_DELAY = 400;     // ms before showing
private readonly HIDE_DELAY = 800;     // ms before hiding

// Edge detection
@HostListener('document:mousemove', ['$event'])
onMouseMove(event: MouseEvent): void {
  const windowHeight = window.innerHeight;
  const distanceFromBottomEdge = windowHeight - event.clientY;

  if (distanceFromBottomEdge <= this.EDGE_THRESHOLD) {
    this.scheduleFabShow();  // Show after delay
  } else if (distanceFromBottomEdge > this.HIDE_THRESHOLD) {
    this.scheduleFabHide();  // Hide after delay
  }
}
```

**Conditional rendering:**
```typescript
// Hidden if no buttons available (all filtered by permissions)
readonly hasButtons = computed(() => {
  const config = this.configuration();
  return config?.buttons && config.buttons.length > 0;
});
```

### FlyoutLayoutComponent

**Location:** `src/app/shared/components/fab-layout/components/flyout-layout/`

**Purpose:** Panel container with dynamic content loading.

**Features:**
- CDK Portal for dynamic content
- Lazy loading of features
- Focus management (FocusTrap)
- Responsive width

---

## Services - Implementation Details

### GlobalFlyoutService

```typescript
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalFlyoutService {
  readonly isOpen = signal(false);
  readonly activeFeatureKey = signal<string | null>(null);

  open(featureKey?: string): void {
    if (!this.overlayRef) {
      this.createOverlay();
      this.attachFlyout();
    }
    this.isOpen.set(true);
    if (featureKey) this.activeFeatureKey.set(featureKey);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
```

### FeatureRegistryService

```typescript
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FeatureRegistryService {
  private readonly _features = signal<FeatureEntry[]>([]);
  readonly features = this._features.asReadonly();

  register(entry: FeatureEntry): void {
    // Registration with order sorting
  }

  async resolveComponent(key: string): Promise<Type<unknown> | null> {
    const entry = this._features().find(f => f.meta.key === key);
    if (!entry) return null;
    return entry.load();  // Lazy import
  }
}
```

---

## Provider Functions (DI Tokens)

### provideFabLayout

Initializes FAB Layout system.

```typescript
export function provideFabLayout(): EnvironmentProviders {
  return makeEnvironmentProviders([
    FeatureRegistryService,
    FabConfigService
  ]);
}
```

### provideFeature

Registers feature with permission checking.

```typescript
export function provideFeature(entry: FeatureEntry): EnvironmentProviders {
  return makeEnvironmentProviders([
    // 1. Token for meta information
    { provide: FAB_FEATURES, multi: true, useValue: entry },

    // 2. Initializer with permission check
    {
      provide: FAB_FEATURE_INITIALIZER,
      multi: true,
      useFactory: () => {
        const registry = inject(FeatureRegistryService);
        const authService = inject(AuthService);
        const destroyRef = inject(DestroyRef, { optional: true });

        return () => {
          // Permission check
          const allowed = !entry.meta.roles || entry.meta.roles.length === 0
            || entry.meta.roles.some(role => authService.hasPermission(role));

          if (!allowed) return;

          // Register
          registry.register(entry);

          // Auto-cleanup for routes
          if (destroyRef) {
            destroyRef.onDestroy(() => registry.unregister(entry.meta.key));
          }
        };
      }
    },

    // 3. Run initialization
    provideAppInitializer(() => {
      const initializers = inject(FAB_FEATURE_INITIALIZER);
      initializers.forEach(init => init());
    })
  ]);
}
```

### provideFabButton

Similar logic for buttons.

---

## UI/UX

### FAB Position

- **Desktop/Tablet:** Bottom center of screen
- **Mobile:** Bottom center of screen
- **Z-index:** 1040 (above content, below overlays)

### Auto-Hide Animations

**FAB:**
- **Hide**: `transform: translateY(calc(100% + 20px))` + `opacity: 0`
- **Show**: `transform: translateY(0)` + `opacity: 1`
- **Duration**: 300ms
- **Easing**: ease-out
- **Hardware acceleration**: `will-change: transform, opacity`

**Indicator:**
- **Hide**: `transform: translateX(-50%) translateY(100%)` + `opacity: 0`
- **Show**: `transform: translateX(-50%) translateY(0)` + `opacity: 0.85`
- **Duration**: 300ms
- **Easing**: ease-out

### Responsive Design

- **Desktop:** panel width 560–640px
- **Tablet:** 80vw
- **Mobile:** 100vw (fullscreen)
- **Height:** 100vh

### Focus Management

- `cdkTrapFocus` inside panel
- `Esc` closes panel
- Backdrop click closes panel
- Focus returns to FAB on close

### Flyout Panel Animations

- Hardware acceleration (`transform: translateX`)
- Duration: 200–250ms
- Easing: ease-in-out

---

## Performance

### Lazy Loading

All features loaded on demand:
```typescript
load: () => import('./features/chat/chat.component')
  .then(m => m.ChatComponent)
```

### Lifecycle

- Overlay created lazily on first open
- Features loaded on first switch
- Feature components recreated on switch

### Bundle Optimization

- Heavy dependencies inside features (not in main bundle)
- Tree-shaking for unused features
- Preload hints for popular features (optional)

---

## Testing

### Unit Tests

```typescript
describe('GlobalFlyoutService', () => {
  it('should open and close flyout', () => {
    service.open();
    expect(service.isOpen()).toBe(true);

    service.close();
    expect(service.isOpen()).toBe(false);
  });
});

describe('FeatureRegistryService', () => {
  it('should register and resolve features', async () => {
    registry.register(mockFeature);
    const cmp = await registry.resolveComponent('test-key');
    expect(cmp).toBeDefined();
  });
});
```

### Integration Tests

- FAB visible on all routes
- Click opens panel
- Backdrop/Esc closes panel
- Lazy loading features works
- Permissions filter buttons/features
- Auto-hide triggers on mouse position
- Indicator shows when FAB hidden
- Show/hide delays work correctly
- Menu keeps FAB visible

---

## File Structure

```
src/app/shared/components/fab-layout/
├── components/
│   ├── global-fab/
│   │   ├── global-fab.component.ts
│   │   ├── global-fab.component.html
│   │   └── global-fab.component.scss
│   └── flyout-layout/
│       ├── flyout-layout.component.ts
│       ├── flyout-layout.component.html
│       └── flyout-layout.component.scss
├── services/
│   ├── global-flyout.service.ts
│   ├── feature-registry.service.ts
│   └── fab-config.service.ts
├── models/
│   └── fab-layout.model.ts
├── providers/
│   └── feature-provider.ts
└── index.ts
```

---

## Usage Example

### In AppComponent

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFabComponent, FlyoutLayoutComponent } from '@shared/components/fab-layout';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-global-fab />      <!-- Always visible -->
    <app-flyout-layout />   <!-- Overlay, managed by service -->
  `,
  standalone: true,
  imports: [RouterOutlet, GlobalFabComponent, FlyoutLayoutComponent]
})
export class AppComponent {}
```

### In main.ts

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideFabLayout(),

    provideFabButton({ id: 'chat', ... }),
    provideFeature({
      meta: { key: 'chat', ... },
      load: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
    })
  ]
});
```

### In Route

```typescript
{
  path: 'admin',
  providers: [
    provideFabButton({
      id: 'admin-tools',
      roles: ['admin'],
      ...
    })
  ]
}
```

---

## Migration and Updates

### Adding New Feature

1. Create standalone component
2. Register via `provideFeature` in main.ts or route
3. Optionally add button via `provideFabButton`

### Changing Permissions

Update `roles` array in button/feature configuration.

---

## Limitations and Future Enhancements

**Current Limitations:**
- No drag & drop for FAB
- No panel resize
- No floating mode
- No feature component caching

**Planned:**
- [ ] Draggable FAB with position persistence
- [ ] Panel resize with snap points
- [ ] Floating panel mode
- [ ] ComponentRef caching for fast switching

---

## Acceptance Criteria

### Core Functionality
✅ FAB positioned at bottom center of screen
✅ Click on FAB buttons opens panel or executes actions
✅ Esc and backdrop click close panel
✅ Panel via CDK Overlay with correct z-index
✅ Features load lazily via import()
✅ Permissions checked via AuthService
✅ Route-specific buttons automatically cleanup
✅ Focus returns to FAB on close
✅ FAB hidden if no available buttons (after permission filtering)

### Auto-Hide Behavior
✅ FAB auto-hides on page load (after 3s initial display)
✅ Visual pill indicator shows when FAB is hidden
✅ Mouse near bottom edge (50px) triggers show after 400ms delay
✅ Mouse moves away (>50px) triggers hide after 800ms delay
✅ FAB stays visible when menu is open
✅ Smooth slide animations for show/hide transitions
✅ Indicator uses primary color with blur effects
✅ No accidental triggers from quick mouse movements

### UX Polish
✅ macOS Dock-style behavior and feel
✅ Pill indicator: 60px × 5px with backdrop-filter blur
✅ Indicator opacity: 0.85 for subtle presence
✅ Smooth transitions (300ms ease-out)
✅ Hardware-accelerated animations

---

**Last Updated:** 2025-11-08
**Version:** 1.1 (Auto-hide + Visual Indicator)
**Language:** English
