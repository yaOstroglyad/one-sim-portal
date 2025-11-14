# Documentation System Version History

> **Purpose:** Track all significant changes to the documentation system
> **Maintenance:** Update when rules change, structure changes, or new files added

## 2025-11-14 - Updated Critical Rules: Signal APIs & Control Flow

**Type:** Rule Update

**Summary:**
- Added CRITICAL RULE #5: Signal Inputs and Outputs (Angular 19+)
- Added CRITICAL RULE #6: Control Flow Syntax (@if, @for, @switch)
- Updated all subsequent rule numbers (#7-10)
- Updated component template examples
- Updated checklist for new components

**Files Modified:**
- `.claude/rules/01-CRITICAL.md` - Added comprehensive signal APIs and control flow rules

**New Rules:**

1. **Signal Inputs and Outputs (Rule #5):**
   - Use `input()` instead of `@Input()` decorator
   - Use `output()` instead of `@Output()` decorator
   - Use `effect()` for input synchronization
   - Access signal inputs as functions in templates: `placeholder()`

2. **Control Flow Syntax (Rule #6):**
   - Use `@if` instead of `*ngIf`
   - Use `@for` instead of `*ngFor` (with track expression)
   - Use `@switch/@case/@default` instead of `*ngSwitch/*ngSwitchCase/*ngSwitchDefault`

**Updated Examples:**
- Complete component template now shows signal inputs/outputs
- Template example demonstrates @if/@for syntax
- Checklist includes signal APIs and control flow checks

**Renumbered Rules:**
- Rule #5 (was Template Separation) → Rule #7
- Rule #6 (was Component Selector Prefix) → Rule #8
- Rule #7 (was No Automatic Dark Mode) → Rule #9
- Rule #8 (was Documentation Language) → Rule #10

**Benefits:**
- ✅ Enforces modern Angular 19+ patterns
- ✅ Better performance with signals
- ✅ Improved type safety
- ✅ Cleaner template syntax
- ✅ Future-proof codebase

**Breaking Changes:** None
- Only applies to new components
- Existing components can remain with @Input/@Output and *ngIf/*ngFor

---

## 2025-11-14 - Custom DatePicker Component

**Type:** Feature Addition

**Summary:**
- Created custom datepicker component without Material Design dependencies
- Replaced native HTML date input with modern calendar popup
- Fully standalone implementation with signal-based state management

**Components Created:**
1. **DatePicker Component** (`src/app/shared/components/datepicker/`)
   - Created `datepicker.component.ts` - Component logic with signals, calendar generation, date validation
   - Created `datepicker.component.html` - Template with calendar popup, month/year navigation
   - Created `datepicker.component.scss` - Modern styling following project SCSS rules
   - Created `README.md` - Comprehensive documentation with examples and API reference

**Components Modified:**
1. **Period Selector Component** (`src/app/shared/components/period-selector/`)
   - Updated `period-selector.component.ts` - Added DatepickerComponent import
   - Updated `period-selector.component.html` - Replaced native `<input type="date">` with `<app-datepicker>`

**Key Features:**
- ✅ Calendar popup with month/year navigation (arrows)
- ✅ Min/max date restrictions (respects minDate="2025-08-01")
- ✅ Modern design matching CoreUI theme
- ✅ Click outside to close
- ✅ Keyboard support (ESC to close)
- ✅ Today indicator (blue dot)
- ✅ Selected date highlighting
- ✅ Disabled dates (outside min/max range)
- ✅ Dark theme support
- ✅ Responsive mobile design
- ✅ Signal-based state management
- ✅ OnPush change detection
- ✅ No external dependencies (no Material Design)

**Files Created:**
```
src/app/shared/components/datepicker/
  ├── datepicker.component.ts
  ├── datepicker.component.html
  ├── datepicker.component.scss
  └── README.md
```

**Files Modified:**
```
src/app/shared/components/period-selector/
  ├── period-selector.component.ts
  └── period-selector.component.html
```

**Breaking Changes:** None
- Backward compatible - same API as native input
- Date format remains ISO 8601 (YYYY-MM-DD)
- Period selector maintains same functionality

**Benefits:**
- 🎨 Modern, customizable design (no Material Design styling conflicts)
- 📦 No external dependencies (smaller bundle size)
- 🎯 Better UX with calendar popup vs. native browser picker
- 🌍 Consistent cross-browser experience
- 🔧 Full control over styling and behavior
- ⚡ Signal-based reactivity for performance
- 🎭 Seamless dark theme support

**Technical Implementation:**
- **Standalone component** with no module dependencies
- **Signal inputs**: Using Angular 19+ `input()` for all inputs (value, minDate, maxDate, placeholder, disabled)
- **Signal outputs**: Using Angular 19+ `output()` for event emissions
- **Signal-based state**: `isOpen`, `selectedDate`, `displayValue`, `currentMonth`, `currentYear`
- **Computed values**: `displayMonth`, `displayYear`, `calendarDays`
- **Effect**: Syncs value input with internal state using `effect()`
- **Calendar generation**: 6×7 grid (42 days) with previous/next month overflow
- **Date validation**: Automatic disable for dates outside min/max range
- **Event handling**: `@HostListener` for click outside and keyboard events
- **Template syntax**: Using new `@if` and `@for` control flow instead of `*ngIf/*ngFor`
- **SCSS architecture**: `@use` imports, CSS custom properties, no hardcoded values

---

## 2025-11-14 - Reports Footer Aggregations & Period Selector Enhancements

**Type:** Feature Enhancement

**Summary:**
- Implemented footer aggregations for Bundle Purchases and Bundle Leftovers reports
- Refactored Generic Table component with helper classes and generic types
- Added date range restrictions to Period Selector component
- Fixed TypeScript errors in tariff-offer-list component

**Components Modified:**
1. **Generic Table Component** (`src/app/shared/components/generic-table/`)
   - Created `helpers/table-footer-aggregation.helper.ts` - Footer calculation logic
   - Created `helpers/table.utils.ts` - Utility functions (trackBy, sorting, row styling)
   - Created `models/table-row.interface.ts` - Type definitions (TableRow, PageChangeEvent, SortChangeEvent)
   - Refactored `generic-table.component.ts` - Generic type support `<T extends TableRow>`
   - Updated documentation in `.context/components/generic-table/`

2. **Reports Feature** (`src/app/views/analytics/reports/`)
   - Updated `reports.component.ts` - Conditional footer visibility based on role and account selection
   - Updated `strategies/bundle-purchases.strategy.ts` - Calculate totals in original currency, exclude REFUNDED
   - Updated `strategies/bundle-leftovers.strategy.ts` - Calculate totals in original currency, exclude REFUNDED
   - Removed currency conversion logic (no longer converting to EUR)

3. **Period Selector Component** (`src/app/shared/components/period-selector/`)
   - Added `@Input() minDate?: string` - Minimum selectable date for custom picker
   - Added `@Input() maxDate?: string` - Maximum selectable date for custom picker
   - Updated template with `[min]` and `[max]` attributes on date inputs
   - Applied `minDate="2025-08-01"` in Reports and Dashboard

**Key Changes:**
- ✅ Footer shows totals only when single account selected (admin) or always (non-admin)
- ✅ Footer displays amounts in original currency (USD, EUR, GBP, etc.) without conversion
- ✅ REFUNDED transactions excluded from footer calculations
- ✅ Custom date picker in Reports/Dashboard cannot select dates before 2025-08-01
- ✅ Generic Table now fully type-safe with generic parameter
- ✅ Improved code organization and maintainability

**Files Modified:**
```
src/app/shared/components/generic-table/
  ├── generic-table.component.ts (refactored)
  ├── helpers/table-footer-aggregation.helper.ts (created)
  ├── helpers/table.utils.ts (created)
  └── models/table-row.interface.ts (created)

src/app/shared/components/period-selector/
  ├── period-selector.component.ts (enhanced)
  └── period-selector.component.html (updated)

src/app/views/analytics/reports/
  ├── reports.component.ts (updated footer logic)
  ├── reports.component.html (added minDate)
  ├── strategies/bundle-purchases.strategy.ts (simplified)
  └── strategies/bundle-leftovers.strategy.ts (simplified)

src/app/views/analytics/dashboard/
  └── dashboard.component.html (added minDate)

src/app/views/product-constructor/components/tariff-offers/
  └── tariff-offer-list/tariff-offer-list.component.ts (fixed type error)

.context/components/generic-table/
  ├── README.md (updated)
  └── technical-details.md (updated)
```

**Breaking Changes:** None
- All changes are backward compatible
- Generic Table maintains same API
- Period Selector's minDate/maxDate are optional parameters

**Benefits:**
- 📊 Accurate financial reporting with original currency display
- 🔒 Date restrictions prevent invalid report periods
- 🎯 Type-safe table component with improved developer experience
- 📈 Better code organization and maintainability
- ⚡ Simplified footer logic (no currency conversion overhead)

---

## 2025-11-15 - Major Restructuring: Modular Documentation System

**Type:** Structure Change (Breaking)

**Changes:**
- ✅ Created `.claude/` directory structure
- ✅ Split monolithic CLAUDE.md (2624 lines → ~450 lines)
- ✅ Created meta-documentation system
- ✅ Implemented context tags navigation
- ✅ Organized rules into modular files

**Files Created:**
- `.claude/meta/CONTRIBUTING.md` - How to maintain documentation
- `.claude/meta/file-structure.md` - Directory organization guide
- `.claude/meta/context-tags-guide.md` - Context tags system guide
- `.claude/meta/version-history.md` - This file

**New Directory Structure:**
```
/.claude/
  ├── meta/          # Documentation about documentation
  ├── rules/         # Detailed rules (to be extracted)
  ├── context/       # Project inventory (to be created)
  ├── guides/        # Step-by-step workflows (to be created)
  └── templates/     # Code templates (to be created)
```

**Reason:**
- CLAUDE.md exceeded token limit (26,865 tokens > 25,000 limit)
- Need for scalable documentation system
- Optimize token usage (goal: 55% savings)

**Breaking Changes:** Yes
- CLAUDE.md structure will change completely
- Old direct references to sections may break

**Migration Required:** Yes
- Extract rules from CLAUDE.md to modular files
- Update CLAUDE.md with navigation system
- Create context inventory files

**Benefits:**
- 📉 Reduced token usage (from ~27k to ~8-15k per task)
- 📚 Better organization and discoverability
- 🔄 Easier maintenance and updates
- 📈 Scalable for future growth

---

## 2025-11-15 - Updated Angular Version References

**Type:** Rule Update

**Files Modified:**
- `CLAUDE.md` - Updated Angular 16 → Angular 19
- `.context/dashboard/README.md` - Updated version
- `.context/PRODUCT_CONSTRUCTOR_HLD.md` - Updated version
- `.context/data-cache/future-signals.md` - Updated version
- All component README files - Updated version

**Reason:** Project upgraded to Angular 19.2.15

**Breaking Changes:** No

**Migration Required:** No

---

## 2025-11-08 - Added Global Gray Scale and Semantic Color Variables

**Type:** Rule Addition

**Files Modified:**
- `CLAUDE.md` - Added SCSS color system section

**Changes:**
- Added global CSS variables documentation
- Gray scale variables (--os-color-gray-50 through gray-900)
- Semantic aliases (text-primary, text-secondary, border, etc.)
- Usage examples and patterns

**Reason:** Standardize color usage across application

**Breaking Changes:** No (additive only)

---

## 2025-11-04 - Added DOM Utilities Category

**Type:** Rule Update

**Files Modified:**
- `CLAUDE.md` - Utility Functions Organization Rules

**Changes:**
- Added DOM utilities category to shared utils structure
- Updated search checklist

**Reason:** New category for DOM manipulation, printing, window operations

---

## 2025-11-02 - Models & Interfaces Organization Rules

**Type:** Rule Addition

**Files Modified:**
- `CLAUDE.md` - Added comprehensive models organization section (554 lines)

**Changes:**
- Created detailed models organization rules
- Added 9 model categories (auth, business, communication, core, feature, payment, product, subscriber, ui)
- Defined kebab-case.model.ts naming standard
- Added search checklists and decision trees

**Reason:** Standardize model/interface organization across project

**Breaking Changes:** Yes - enforces kebab-case file naming

---

## 2025-11-01 - HTTP Error Handling & Service Organization

**Type:** Rule Addition

**Files Modified:**
- `CLAUDE.md` - Added HTTP Error Handling Rules (505 lines)
- `CLAUDE.md` - Added Service Organization Rules (524 lines)
- `CLAUDE.md` - Added Utility Functions Organization Rules (257 lines)

**Changes:**
- Unified HTTP error handling utilities
- Created handleArrayError, handleObjectError, handleWithDefault
- Added forkJoin pattern documentation
- Service organization by category (data/, ui/, core/)
- Utility organization by domain (color/, data/, currency/, dom/, http/, testing/)

**Reason:**
- Consolidate error handling patterns
- Prevent duplicate service/utility creation
- Standardize file organization

**Breaking Changes:** No (additive, but encourages refactoring)

---

## 2025-10-24 - Critical Inline SVG Rule

**Type:** Rule Addition

**Files Modified:**
- `CLAUDE.md` - Icon Strategy section

**Changes:**
- Added CRITICAL rule: NEVER use inline SVG in HTML
- Enforce app-icon component usage
- Document icon creation process

**Reason:** Prevent template bloat, enforce reusability

**Breaking Changes:** Yes - existing inline SVGs should be refactored

---

## 2025-10-16 - Initial Documentation System

**Type:** Creation

**Files Created:**
- `CLAUDE.md` - Monolithic rules file (initial version)

**Sections Created:**
- Rule Addition Protocol
- File Path Rules (absolute paths)
- Component Architecture Rules
- SCSS Architecture Rules
- HTTP Error Handling
- Models Organization
- Services Organization
- Utilities Organization
- Icon Strategy
- Development Commands
- Common Patterns

**Reason:** Provide comprehensive guidance for Claude Code

---

## Template for Future Entries

```markdown
## YYYY-MM-DD - [Change Title]

**Type:** [Rule Addition | Rule Update | Structure Change | Bug Fix]

**Files Modified:**
- `file1.md` - [What changed]
- `file2.md` - [What changed]

**Changes:**
- Change 1
- Change 2

**Reason:** [Why this change was needed]

**Breaking Changes:** [Yes/No - if yes, describe]

**Migration Required:** [Yes/No - if yes, describe steps]
```

---

## Maintenance Notes

**Update this file when:**
- New rule files created
- Existing rules significantly modified
- Documentation structure changes
- Breaking changes introduced

**Version format:**
- Date-based (YYYY-MM-DD)
- Chronological order (newest first)

**Entry requirements:**
- Type classification
- Files modified
- Clear reason
- Breaking change indication
- Migration steps (if needed)
