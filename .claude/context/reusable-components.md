# Reusable Components Inventory

> **Context Tags:** `@creating-new` `@learn-project` `@component`
> **Read when:** Before creating a component - check what already exists
> **Last Updated:** 2025-11-15

## 🎯 Purpose

This file lists ALL reusable components, SCSS mixins, and UI elements available in the project. **Always check this file before creating new components** to avoid duplication.

---

## 📦 Generic Components (`/src/app/shared/components/`)

### Data Display Components

#### **GenericTableComponent**
- **Location:** `/src/app/shared/components/generic-table/`
- **Use for:** Any list view with server-side operations
- **Features:**
  - Server-side sorting, filtering, pagination
  - Row selection (single/multiple)
  - Custom column templates
  - Export to Excel
  - Configurable via `tableConfig` object
- **Similar to:** Customer list, Order list, Inventory list
- **Documentation:** Check component README

#### **CardComponent**
- **Location:** `/src/app/shared/components/card/`
- **Use for:** Content containers, dashboard cards
- **Variants:**
  - `default` - Standard card
  - `elevated` - With shadow
  - `outlined` - Border only
  - `ghost` - Transparent background
  - `gradient` - Gradient background
  - `glassmorphism` - Glass effect
- **Color support:** All 26 global colors
- **Similar to:** Dashboard KPI cards, Info cards

#### **BadgeComponent**
- **Location:** `/src/app/shared/components/badge/`
- **Use for:** Status indicators, tags, labels
- **Features:**
  - Supports all 26 colors with smart text contrast
  - Size variants: small, medium, large
  - Pill or square shape
- **Similar to:** Order status badges, User role tags

#### **TooltipComponent**
- **Location:** `/src/app/shared/components/tooltip/`
- **Use for:** Contextual help, additional information
- **Features:**
  - Position: top, bottom, left, right
  - Trigger: hover, click, focus
  - Custom content support
- **Documentation:** See component README

#### **TabsComponent**
- **Location:** `/src/app/shared/components/tabs/`
- **Use for:** Tabbed interfaces, multi-section views
- **Features:**
  - Lazy loading tab content
  - Route-based tabs
  - Custom tab templates
- **Similar to:** Dashboard tabs, Settings tabs
- **Documentation:** See component README

---

### Form Components

#### **FormGeneratorComponent**
- **Location:** `/src/app/shared/components/form-generator/`
- **Use for:** Dynamic form generation from JSON schema
- **Features:**
  - **HTTP Dependencies:** Fields can depend on API responses
  - **FormArray Support:** Nested form arrays with dynamic fields
  - **Validation:** Schema-based validation rules
  - **Field Types:** text, number, select, checkbox, radio, date, file, etc.
  - **Conditional Fields:** Show/hide fields based on other field values
- **Similar to:** Customer creation form, Product configuration form
- **Documentation:** `/src/app/shared/components/form-generator/README.md` (comprehensive)

#### **GenericDialogComponent**
- **Location:** `/src/app/shared/components/generic-dialog/`
- **Use for:** Modal dialogs, confirmations, forms in popups
- **Features:**
  - Configurable title, content, actions
  - Custom component injection
  - Data passing to/from dialog
- **Similar to:** Confirmation dialogs, Edit dialogs

---

### Layout & Navigation Components

#### **GenericRightPanelComponent**
- **Location:** `/src/app/shared/components/generic-right-panel/`
- **Use for:** Side panel overlays, detail views, filters
- **Features:**
  - Slides in from right
  - Custom header and content
  - Backdrop overlay
  - Auto-close on navigation
  - Configurable width
- **Documentation:** `.context/generic-right-panel-usage.md` (detailed guide)
- **Similar to:** Customer details panel, Filter panel

#### **HeaderComponent**
- **Location:** Documented in `.context/header-component/`
- **Use for:** Page headers with filters and actions
- **Features:**
  - Reusable filter and action toolbar
  - Consistent header styling
  - Search, filters, action buttons
- **Similar to:** List page headers, Dashboard headers

#### **InfoStripComponent**
- **Location:** Documented in `.context/info-strip-component/`
- **Use for:** Informational banners, alerts, announcements
- **Features:**
  - Dismissible notifications
  - Different severity levels
  - Icon support
- **Similar to:** System notifications, User alerts

#### **AccountSelectorComponent**
- **Location:** Documented in `.context/account-selector-component/`
- **Use for:** Switching between accounts/profiles
- **Features:**
  - Dropdown account selector
  - Multi-account support
  - User profile integration
- **Documentation:** `.context/account-selector-component/README.md`

---

### Chart Components

#### **BarChartComponent**
- **Location:** `/src/app/shared/components/bar-chart/`
- **Use for:** Horizontal/vertical bar charts
- **Features:**
  - Chart.js based
  - Responsive
  - Custom colors
  - Tooltips, legends
- **Similar to:** Dashboard analytics bars
- **Documentation:** See component README

#### **IconComponent** (app-icon)
- **Location:** `/src/app/shared/components/icon/`
- **Use for:** SVG icon display
- **Features:**
  - Loads icons from `/src/assets/icons/`
  - Built-in caching via IconService
  - Predefined sizes: `xs`, `sm`, `md` (default), `lg`, `xl`, `2xl`, `3xl`, `4xl`
  - Custom sizes: any CSS value (e.g., `'100px'`, `'5rem'`)
  - Custom colors via CSS
- **Usage:**
  ```html
  <!-- With predefined size -->
  <app-icon icon="home" size="lg"></app-icon>

  <!-- With custom size -->
  <app-icon icon="chart-empty" size="80px"></app-icon>

  <!-- Default size (md = 24px) -->
  <app-icon icon="settings"></app-icon>
  ```
- **Available Icons:** See [Available Custom Icons](#available-custom-icons) below
- **Critical Rule:** NEVER use inline SVG - always use `<app-icon>`

---

## 🎨 Available SCSS Mixins

### Dashboard Mixins (`/src/scss/_mixins.scss`)

Use these for dashboard components:

```scss
@use "../../../../scss/mixins" as mixins;

// Card headers (1.25rem title, proper spacing)
@include mixins.dashboard-card-header();

// Chart containers with proper sizing
@include mixins.dashboard-chart-container($height);

// Responsive KPI card grids
@include mixins.dashboard-kpi-grid($columns);

// Chart legends with colored dots
@include mixins.dashboard-chart-legend();

// Two-column responsive layout
@include mixins.dashboard-demographics-row();

// Metric displays (retention, churn rates)
@include mixins.dashboard-metric-summary();

// Horizontal bar charts for analysis
@include mixins.dashboard-reason-bars();

// Consistent dark theme support
@include mixins.dashboard-dark-theme();
```

### Chart Component Mixins

```scss
// Full chart styling (component name + icon)
@include mixins.chart-complete($component-name, $icon);
```

### Utility Mixins (`/src/scss/_mixins.scss`)

```scss
// Hover, active, focus states
@include mixins.interactive-states();

// Glass effect backgrounds
@include mixins.glassmorphism();

// Box shadows by level (1-5)
@include mixins.elevation($level);

// Disabled state styling
@include mixins.disabled-state();

// Loading state with animation
@include mixins.loading-state();

// Text truncation with ellipsis
@include mixins.truncate();
```

### Color Generation Mixins (`/src/scss/_variables.scss`)

```scss
@use "../../../../scss/variables" as vars;

// Generate all color variants for a component
// Creates: solid, outline, subtle variants for all 26 colors
@include vars.generate-os-colors('component-name');

// Example usage in component:
:host {
  @include vars.generate-os-colors('my-badge');
  // This creates:
  // .my-badge--primary, .my-badge--blue, etc. (solid)
  // .my-badge--outline.my-badge--primary (outline)
  // .my-badge--subtle.my-badge--primary (subtle)
}
```

---

## 🌈 Global Color System

### Available Colors (26 total)

All components have access to these colors via CSS variables or SCSS map:

**Semantic Colors:**
- `primary`, `secondary`, `success`, `danger`, `warning`, `info`

**Tailwind Colors:**
- `blue`, `indigo`, `purple`, `pink`, `red`, `orange`
- `yellow`, `green`, `teal`, `cyan`, `gray`

**Additional:**
- `light`, `dark`, `white`, `black`
- And more...

### Global Gray Scale

```scss
--os-color-gray-50: #f9fafb;    // Lightest
--os-color-gray-100: #f3f4f6;
--os-color-gray-200: #e5e7eb;
--os-color-gray-300: #d1d5db;
--os-color-gray-400: #9ca3af;   // Muted text
--os-color-gray-500: #6b7280;   // Secondary text
--os-color-gray-600: #4b5563;
--os-color-gray-700: #374151;   // Dark backgrounds
--os-color-gray-800: #1f2937;
--os-color-gray-900: #111827;   // Darkest
```

### Semantic Color Variables

```scss
// Text
--os-color-text-primary: #2c2c2c;
--os-color-text-secondary: #6b7280;
--os-color-text-muted: #9ca3af;

// Borders
--os-color-border: #e0e0e0;
--os-color-border-light: #f3f4f6;

// Backgrounds
--os-color-bg-hover: #f5f5f5;
--os-color-bg-subtle: #f9fafb;
```

**Full documentation:** See [.claude/rules/06-scss.md](../rules/06-scss.md)

---

## 🎯 Available Custom Icons

Icons located in `/src/assets/icons/`:

- `home.svg` - Home/dashboard navigation
- `chat.svg` - Chat/messaging features
- `chat-search.svg` - Chat search state
- `chat-empty.svg` - Chat empty state
- `chat-placeholder.svg` - Thread selection placeholder
- `plus.svg` - Add/create actions
- `settings.svg` - Configuration/settings
- `history.svg` - Historical data/logs
- `default.svg` - Fallback icon

**Usage:**
```html
<!-- ✅ Correct -->
<app-icon [icon]="'home'"></app-icon>

<!-- ❌ Wrong - inline SVG -->
<svg>...</svg>
```

**To add new icon:**
1. Create `.svg` file in `/src/assets/icons/`
2. Use descriptive kebab-case name
3. Use via `<app-icon>`

---

## 🔧 Reusable Services

### UI & State Services

#### **FeatureToggleService**
- **Location:** Documented in `.context/feature-toggles/`
- **Use for:** Feature flag management, A/B testing
- **Features:**
  - Enable/disable features dynamically
  - User-based feature access
  - Configuration-driven toggles
- **Documentation:** `.context/feature-toggles/README.md`

#### **NavigationSystem**
- **Location:** Documented in `.context/navigation-system/`
- **Use for:** App-wide navigation patterns
- **Features:**
  - Centralized navigation logic
  - Route management
  - Navigation guards
- **Documentation:** `.context/navigation-system/README.md`

---

## 🔍 Search Before Creating

**Before creating a component, check:**

1. **This file** - Component inventory
2. **`/src/app/shared/components/`** directory
3. **Existing views** for similar patterns

### Search Commands

```bash
# Find component by name
find /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components -name "*component-name*"

# Search for similar functionality
grep -r "functionality-keyword" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components
```

---

## 📋 Component Usage Patterns

### Dashboard Card Example

```typescript
import { CardComponent } from '@shared/components/card';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card variant="elevated" color="primary">
      <h3>Total Revenue</h3>
      <p class="amount">$12,345</p>
    </app-card>
  `
})
```

### Generic Table Example

```typescript
import { GenericTableComponent } from '@shared/components/generic-table';

@Component({
  standalone: true,
  imports: [GenericTableComponent]
})
export class CustomerListComponent {
  tableConfig = {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'email', label: 'Email', filterable: true }
    ],
    pagination: true,
    serverSide: true
  };
}
```

### Form Generator Example

```typescript
import { FormGeneratorComponent } from '@shared/components/form-generator';

// See comprehensive examples in:
// /src/app/shared/components/form-generator/README.md
```

---

## 🆕 When to Create New Component

**Create new reusable component when:**
- ✅ Same UI pattern used in 3+ places
- ✅ Complex logic that should be encapsulated
- ✅ Existing components don't cover the use case

**Don't create new component if:**
- ❌ Existing component can be extended
- ❌ Only used once (keep it local)
- ❌ Simple composition of existing components

---

## 📚 Related Documentation

- **Component Rules:** [.claude/rules/01-CRITICAL.md](../rules/01-CRITICAL.md)
- **SCSS Rules:** [.claude/rules/06-scss.md](../rules/06-scss.md)
- **Icon Rules:** [.claude/rules/07-icons.md](../rules/07-icons.md)
- **Component Guide:** [.claude/guides/creating-component.md](../guides/creating-component.md) (when created)

---

## 🔄 Maintenance

**Update this file when:**
- New reusable component created
- New SCSS mixin added
- New custom icon added
- Component features extended

**Review schedule:** Weekly

---

**Last Updated:** 2025-11-15
**Total Reusable Components:** 16+
**Total Reusable Services:** 2+
**Total SCSS Mixins:** 15+
**Total Custom Icons:** 9
