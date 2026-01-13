# Quickstart: Searchable Select CDK + Signals

**Date**: 2026-01-13
**Feature**: 022-searchable-select-cdk

## Overview

This document provides implementation guidance for refactoring `app-searchable-select` to use CDK Overlay and Angular Signals.

## Prerequisites

- Angular CDK installed: `@angular/cdk@^21.0.3` ✅ (already present)
- Familiarity with Angular Signals API
- Understanding of CDK Overlay concepts

## Implementation Order

### Phase 1: Signal Migration (Foundation)

1. **Convert inputs to signal-based**
   ```typescript
   // Before
   @Input() options: SearchableSelectOption[] = [];

   // After
   options = input<SearchableSelectOption[]>([]);
   ```

2. **Convert internal state to signals**
   ```typescript
   // Before
   isOpen = false;
   highlightedIndex = -1;

   // After
   readonly isOpen = signal(false);
   readonly highlightedIndex = signal(-1);
   ```

3. **Replace getters with computed**
   ```typescript
   // Before
   get displayText(): string { ... }

   // After
   readonly displayText = computed(() => { ... });
   ```

4. **Remove ChangeDetectorRef usage**
   - Delete all `this.cdr.markForCheck()` calls
   - Remove `private cdr` injection

### Phase 2: CDK Overlay Integration

1. **Add CDK imports**
   ```typescript
   import { CdkOverlayOrigin, CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
   import { Overlay } from '@angular/cdk/overlay';
   ```

2. **Update template with overlay directives**
   ```html
   <!-- Trigger with overlay origin -->
   <div class="select-trigger"
        cdkOverlayOrigin
        #trigger="cdkOverlayOrigin">
     ...
   </div>

   <!-- Dropdown via CDK Overlay -->
   <ng-template
     cdkConnectedOverlay
     [cdkConnectedOverlayOrigin]="trigger"
     [cdkConnectedOverlayOpen]="isOpen()"
     [cdkConnectedOverlayPositions]="positions"
     [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
     [cdkConnectedOverlayWidth]="triggerWidth()"
     (overlayOutsideClick)="close()"
     (detach)="close()">
     <div class="select-panel">
       <!-- search + options -->
     </div>
   </ng-template>
   ```

3. **Define positions and scroll strategy**
   ```typescript
   private readonly overlay = inject(Overlay);

   readonly positions: ConnectedPosition[] = [
     { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
     { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
   ];

   readonly scrollStrategy = this.overlay.scrollStrategies.reposition();
   ```

### Phase 3: Search Input Migration

1. **Replace FormControl with signal**
   ```typescript
   // Before
   searchControl = new FormControl('');
   this.searchControl.valueChanges.pipe(debounceTime(300))...

   // After
   readonly searchTerm = signal('');

   // In template
   (input)="onSearchInput($event)"

   // In component
   private searchTimeout: any;
   onSearchInput(event: Event): void {
     const value = (event.target as HTMLInputElement).value;
     clearTimeout(this.searchTimeout);
     this.searchTimeout = setTimeout(() => {
       this.searchTerm.set(value);
       this.searchChange.emit(value);
     }, 300);
   }
   ```

### Phase 4: Cleanup

1. **Remove RxJS subscriptions**
   - Delete `destroy$` subject
   - Delete `ngOnDestroy` cleanup
   - Delete `takeUntil(this.destroy$)` pipes

2. **Remove optionStates cache**
   - Delete `optionStates` property
   - Delete `updateOptionStates()` method
   - Computed signals handle reactivity automatically

3. **Simplify ControlValueAccessor**
   ```typescript
   writeValue(val: any): void {
     this.value.set(val);
   }
   ```

## Key Patterns

### Signal Updates
```typescript
// Toggle
this.isOpen.update(v => !v);

// Set
this.searchTerm.set('');

// Read in template
{{ displayText() }}
@if (isOpen()) { ... }
```

### Computed Dependencies
```typescript
// Auto-tracks options() and searchTerm()
readonly filteredOptions = computed(() => {
  const term = this.searchTerm().toLowerCase();
  const opts = this.options();
  if (!term) return opts;
  return opts.filter(o => o.label.toLowerCase().includes(term));
});
```

### Width Tracking for Overlay
```typescript
@ViewChild('trigger', { read: ElementRef }) triggerElement!: ElementRef;

readonly triggerWidth = signal(0);

open(): void {
  this.triggerWidth.set(this.triggerElement.nativeElement.offsetWidth);
  this.isOpen.set(true);
}
```

## Testing Checklist

- [ ] Single selection works as before
- [ ] Multiple selection works as before
- [ ] Search filtering works with debounce
- [ ] Keyboard navigation (Arrow up/down, Enter, Escape)
- [ ] Click outside closes dropdown
- [ ] Dropdown positions below (or above if no space)
- [ ] Scroll repositions dropdown
- [ ] Form integration (formControlName) works
- [ ] Disabled state works
- [ ] Loading state shows spinner
- [ ] All existing usages compile and work
