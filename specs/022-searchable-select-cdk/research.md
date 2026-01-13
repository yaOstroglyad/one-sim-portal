# Research: Searchable Select CDK + Signals Refactor

**Date**: 2026-01-13
**Feature**: 022-searchable-select-cdk

## 1. CDK Overlay Pattern for Select Components

### Decision: Use CdkConnectedOverlay directive (declarative approach)

**Rationale**:
- Declarative approach aligns with Angular template philosophy
- Less boilerplate than programmatic Overlay service
- Built-in position fallback handling
- Automatic cleanup on component destroy
- Same pattern used by Angular Material's MatSelect

**Alternatives Considered**:
| Approach | Pros | Cons |
|----------|------|------|
| CdkConnectedOverlay directive | Declarative, less code, auto-cleanup | Slightly less flexible |
| Overlay service (programmatic) | Full control, dynamic creation | More boilerplate, manual cleanup |
| Keep CSS absolute positioning | No changes needed | Viewport overflow issues, no fallback |

### Implementation Pattern

```typescript
// Template
<div cdkOverlayOrigin #trigger="cdkOverlayOrigin">
  <!-- trigger content -->
</div>

<ng-template
  cdkConnectedOverlay
  [cdkConnectedOverlayOrigin]="trigger"
  [cdkConnectedOverlayOpen]="isOpen()"
  [cdkConnectedOverlayPositions]="positions"
  [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
  [cdkConnectedOverlayWidth]="triggerWidth()"
  (overlayOutsideClick)="close()"
  (detach)="close()">
  <!-- dropdown panel -->
</ng-template>

// Component
positions: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
];

scrollStrategy = inject(Overlay).scrollStrategies.reposition();
```

## 2. CDK A11y for Keyboard Navigation

### Decision: Use ActiveDescendantKeyManager

**Rationale**:
- Standard pattern for listbox/combobox components
- Handles aria-activedescendant automatically
- Built-in wrap, typeahead, skip disabled
- Used by MatSelect, MatAutocomplete

**Alternatives Considered**:
| Approach | Pros | Cons |
|----------|------|------|
| ActiveDescendantKeyManager | ARIA compliant, standard pattern | Requires option components |
| FocusKeyManager | Actual focus movement | Less suitable for select pattern |
| Manual highlightedIndex | Simple, current approach | No ARIA, no typeahead |

### Implementation Pattern

```typescript
// Option needs to implement Highlightable interface
interface Highlightable {
  setActiveStyles(): void;
  setInactiveStyles(): void;
}

// Or use simpler approach with signal-based active state
keyManager = new ActiveDescendantKeyManager(this.options)
  .withWrap()
  .withHomeAndEnd();
```

**Note**: For simplicity with signals, we can keep the current `highlightedIndex` approach but ensure proper `aria-activedescendant` attribute is set. Full ActiveDescendantKeyManager integration would require creating separate option components.

### Simplified Decision: Keep signal-based highlighting with proper ARIA

For this refactor, we'll maintain the signal-based `highlightedIndex` approach with these enhancements:
- Add `aria-activedescendant` pointing to highlighted option's ID
- Each option gets unique ID: `${componentId}-option-${index}`
- Keyboard handling remains in component

## 3. Angular Signals Migration

### Decision: Full migration to signal-based state

**Rationale**:
- Constitution requires signals for component state (Section II)
- Eliminates need for manual `markForCheck()` calls
- Computed values auto-update, removing `optionStates` cache
- Cleaner code with less boilerplate

### State Migration Map

| Current | Signal Version | Type |
|---------|----------------|------|
| `isOpen = false` | `isOpen = signal(false)` | WritableSignal |
| `searchControl = new FormControl('')` | `searchTerm = signal('')` | WritableSignal |
| `filteredOptions: T[] = []` | `filteredOptions = computed(...)` | Computed |
| `selectedOption` | `selectedOption = computed(...)` | Computed |
| `highlightedIndex = -1` | `highlightedIndex = signal(-1)` | WritableSignal |
| `optionStates` cache | REMOVED | Not needed |
| `get displayText()` | `displayText = computed(...)` | Computed |
| `get showClearButton()` | `showClearButton = computed(...)` | Computed |

### Input/Output Migration

| Current | Signal Version |
|---------|----------------|
| `@Input() options` | `options = input<SearchableSelectOption[]>([])` |
| `@Input() config` | `config = input<SearchableSelectConfig>({})` |
| `@Input() label` | `label = input<string>()` |
| `@Input() required` | `required = input(false)` |
| `@Input() error` | `error = input<string>()` |
| `@Input() className` | `className = input<string>()` |
| `@Output() selectionChange` | `selectionChange = output<SearchableSelectChangeEvent>()` |
| `@Output() searchChange` | `searchChange = output<string>()` |

### ControlValueAccessor with Signals

```typescript
// Internal value signal
private readonly value = signal<any>(null);

// CVA writeValue updates signal
writeValue(val: any): void {
  this.value.set(val);
}

// Selection computed from value + options
selectedOption = computed(() => {
  const v = this.value();
  const opts = this.options();
  if (this.mergedConfig().multiple) {
    return Array.isArray(v) ? opts.filter(o => v.includes(o.value)) : [];
  }
  return opts.find(o => o.value === v) ?? null;
});
```

## 4. Scroll Strategy

### Decision: Use reposition strategy

**Rationale**:
- Matches current behavior (US5: "dropdown repositions to stay attached")
- Best UX for form selects
- Standard for select components

**Alternatives**:
| Strategy | Behavior | Use Case |
|----------|----------|----------|
| reposition | Follows trigger on scroll | ✅ Best for selects |
| close | Closes on any scroll | Modals, dialogs |
| block | Prevents page scroll | Full-screen overlays |
| noop | Does nothing | Special cases |

## 5. Removed Boilerplate

After migration, these will be removed:
- `private destroy$ = new Subject<void>()` and `ngOnDestroy` cleanup
- `private cdr = inject(ChangeDetectorRef)` and all `markForCheck()` calls
- `optionStates` cache and `updateOptionStates()` method
- `searchControl = new FormControl('')` (replaced with signal)
- RxJS subscription management for search

## Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Overlay approach | CdkConnectedOverlay directive | Declarative, less code |
| Keyboard navigation | Signal-based highlightedIndex + ARIA | Simpler than full KeyManager |
| State management | Full signals migration | Constitution compliance |
| Scroll strategy | Reposition | Matches expected behavior |
| Position fallback | Below-first, above-fallback | Standard select UX |
