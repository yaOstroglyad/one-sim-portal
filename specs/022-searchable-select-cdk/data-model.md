# Data Model: Searchable Select CDK + Signals

**Date**: 2026-01-13
**Feature**: 022-searchable-select-cdk

## Overview

This is a UI component refactor - no backend data model changes required. This document describes the component's internal state model and type definitions.

## Existing Types (No Changes)

Located in `searchable-select.types.ts`:

### SearchableSelectOption

```typescript
interface SearchableSelectOption {
  value: any;           // Unique identifier for the option
  label: string;        // Display text
  disabled?: boolean;   // Whether option is selectable
  data?: any;           // Additional custom data
}
```

### SearchableSelectConfig

```typescript
interface SearchableSelectConfig {
  placeholder?: string;        // Text when nothing selected
  searchPlaceholder?: string;  // Search input placeholder
  noResultsText?: string;      // Text when filter returns empty
  clearable?: boolean;         // Show "None" option for single select
  clearOptionLabel?: string;   // Label for clear option
  disabled?: boolean;          // Disable entire component
  multiple?: boolean;          // Allow multiple selections
  maxHeight?: string;          // Dropdown max height (CSS value)
  searchable?: boolean;        // Show search input
  loading?: boolean;           // Show loading state
  loadingText?: string;        // Loading indicator text
  entityKey?: string;          // i18n key for entity name interpolation
}
```

### SearchableSelectChangeEvent

```typescript
interface SearchableSelectChangeEvent {
  value: any;                                              // Selected value(s)
  option: SearchableSelectOption | SearchableSelectOption[] | null;  // Full option object(s)
}
```

## Component State Model (New - Signals)

### Inputs (signal-based)

| Signal | Type | Default | Description |
|--------|------|---------|-------------|
| `options` | `InputSignal<SearchableSelectOption[]>` | `[]` | Available options |
| `config` | `InputSignal<SearchableSelectConfig>` | `{}` | Configuration |
| `label` | `InputSignal<string \| undefined>` | `undefined` | Field label |
| `required` | `InputSignal<boolean>` | `false` | Show required indicator |
| `error` | `InputSignal<string \| undefined>` | `undefined` | Error message i18n key |
| `className` | `InputSignal<string \| undefined>` | `undefined` | Additional CSS class |

### Internal State (WritableSignals)

| Signal | Type | Initial | Description |
|--------|------|---------|-------------|
| `isOpen` | `WritableSignal<boolean>` | `false` | Dropdown visibility |
| `searchTerm` | `WritableSignal<string>` | `''` | Current search filter |
| `highlightedIndex` | `WritableSignal<number>` | `-1` | Keyboard-highlighted option |
| `value` | `WritableSignal<any>` | `null` | Selected value (CVA) |
| `triggerWidth` | `WritableSignal<number>` | `0` | Trigger element width for overlay |

### Computed State

| Computed | Type | Derivation |
|----------|------|------------|
| `mergedConfig` | `Signal<SearchableSelectConfig>` | `{ ...defaults, ...config() }` |
| `filteredOptions` | `Signal<SearchableSelectOption[]>` | Filter `options()` by `searchTerm()` |
| `selectedOption` | `Signal<SearchableSelectOption \| SearchableSelectOption[] \| null>` | Find in `options()` by `value()` |
| `displayText` | `Signal<string>` | Label from `selectedOption()` or placeholder |
| `showClearButton` | `Signal<boolean>` | `clearable && hasSelection` |
| `hasPlaceholder` | `Signal<boolean>` | No selection made |
| `hasSelectedChips` | `Signal<boolean>` | Multiple mode with selections |
| `showLoadingState` | `Signal<boolean>` | `config().loading` |
| `showNoResults` | `Signal<boolean>` | Not loading and empty filtered |
| `showSearchInput` | `Signal<boolean>` | `config().searchable` |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `selectionChange` | `OutputEmitterRef<SearchableSelectChangeEvent>` | Emits on selection |
| `searchChange` | `OutputEmitterRef<string>` | Emits on search input |

## State Transitions

```
┌─────────┐    click/Enter/Space/ArrowDown    ┌─────────┐
│ CLOSED  │ ────────────────────────────────► │  OPEN   │
└─────────┘                                   └─────────┘
     ▲                                             │
     │         click outside/Escape/select        │
     └─────────────────────────────────────────────┘

Within OPEN state:
- ArrowDown: highlightedIndex++
- ArrowUp: highlightedIndex--
- Enter: select highlighted option
- Typing: updates searchTerm → filteredOptions recomputes
- Click option: select and close (single) or toggle (multiple)
```

## ARIA Attributes

| Attribute | Element | Value |
|-----------|---------|-------|
| `role="combobox"` | Trigger | Identifies as combobox |
| `aria-expanded` | Trigger | `isOpen()` |
| `aria-haspopup="listbox"` | Trigger | Has popup listbox |
| `aria-activedescendant` | Trigger | ID of highlighted option |
| `aria-disabled` | Trigger | `config().disabled` |
| `role="listbox"` | Options container | Identifies as listbox |
| `role="option"` | Each option | Identifies as option |
| `aria-selected` | Each option | Whether selected |
| `aria-disabled` | Each option | Whether disabled |
| `id` | Each option | `{componentId}-option-{index}` |
