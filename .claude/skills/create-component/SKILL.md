---
name: create-component
description: Creates a new Angular component following project standards. Use when asked to create a component, new component, add component, or generate component.
allowed-tools: Write, Read, Glob, Grep, Edit
---

# Create Angular Component

Create a new Angular component following One-Sim-Portal project standards.

> **Rules Reference:** All component rules are defined in `constitution.md` Section II.
> This skill provides the **procedure** and **templates** for creating components.

## Procedure

1. **Ask for component name and location** if not provided
2. **Determine the feature area** (shared, views/{feature}, layout)
3. **Create files** using templates below:
   - `{name}.component.ts`
   - `{name}.component.html`
   - `{name}.component.scss`
4. **Follow constitution.md Section II** for member ordering
5. **Add to exports** if component is in shared module

## File Templates

### TypeScript Template

```typescript
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  output,
  DestroyRef
} from '@angular/core';

/**
 * [Component Description]
 *
 * @example
 * ```html
 * <os-{name}></os-{name}>
 * ```
 */
@Component({
  selector: 'os-{name}',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './{name}.component.html',
  styleUrl: './{name}.component.scss'
})
export class {PascalName}Component {
  // Follow constitution.md Section II "Code Organization Order":
  // 1. Static members
  // 2. Injected dependencies
  // 3. Inputs & Outputs
  // 4. View/Content children
  // 5. State signals
  // 6. Computed signals
  // 7. Private variables
  // 8. Constructor (effects only)
  // 9. Lifecycle hooks
  // 10. Public methods
  // 11. Event handlers
  // 12. Private methods
  // 13. Interface implementations

  private readonly destroyRef = inject(DestroyRef);

  readonly data = input<DataType>();
  readonly disabled = input<boolean>(false);

  readonly dataChange = output<DataType>();

  readonly isLoading = signal(false);

  readonly isEmpty = computed(() => !this.data());

  handleAction(): void {
    this.dataChange.emit(this.data());
  }
}
```

### SCSS Template

```scss
@use "sass:map";
@use "variables" as vars;
@use "mixins" as mixins;

:host {
  display: block;
}

.{name} {
  color: var(--os-color-text-primary);
  background: var(--os-color-background);

  &__header {
    padding: map.get(vars.$os-spacing, '4');
  }

  &__content {
    padding: map.get(vars.$os-spacing, '6');
  }
}
```

> **Note:** `@use "sass:map"` is required when using `map.get()` for spacing/border-radius variables.

### HTML Template

```html
<div class="{name}">
  <div class="{name}__header">
    <!-- Header content -->
  </div>
  <div class="{name}__content">
    <!-- Main content -->
  </div>
</div>
```

## Common Locations

| Type | Path |
|------|------|
| Shared components | `src/app/shared/components/` |
| View components | `src/app/views/{feature}/components/` |
| Feature components | `src/app/features/{feature}/` |
| Layout components | `src/app/containers/default-layout/components/` |

## Quick Checklist

Before finishing, verify against `constitution.md`:
- [ ] `os-` selector prefix (Section II)
- [ ] `standalone: true` + OnPush (Section II)
- [ ] `inject()` for dependencies (Section II)
- [ ] Signal APIs for inputs/outputs (Section II)
- [ ] Member ordering follows Section II
- [ ] `:host { display: block }` for block-level (Section II)
- [ ] `@use "variables"` syntax (Section VII)
- [ ] CSS variables for colors (Section VII)
