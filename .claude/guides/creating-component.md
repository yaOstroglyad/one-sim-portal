# Creating a Component - Step by Step

> **Context Tags:** `@creating-new` `@component`
> **Read when:** Creating a new component from scratch

## 📋 Checklist

Before creating a component:
- [ ] Check if similar component exists in `/shared/components/`
- [ ] Check reusable components inventory
- [ ] Decide: reusable (in `/shared/`) or feature-specific?

## 🚀 Steps

### 1. Check What Exists
```bash
# Search for similar components
grep -r "similar-functionality" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components
```

See: [.claude/context/reusable-components.md](../context/reusable-components.md)

### 2. Choose Location
- **Reusable (3+ uses):** `/src/app/shared/components/my-component/`
- **Feature-specific:** `/src/app/views/feature-name/components/my-component/`

### 3. Create Component Files
```bash
cd /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components
ng generate component my-component --standalone --change-detection OnPush
```

Or copy template: `.claude/templates/component.template.ts`

### 4. Apply Critical Rules
- ✅ `standalone: true`
- ✅ `changeDetection: ChangeDetectionStrategy.OnPush`
- ✅ Use `inject()` for dependencies
- ✅ External template if complex
- ✅ SCSS with `@use` (not `@import`)

See: [.claude/rules/01-CRITICAL.md](../rules/01-CRITICAL.md)

### 5. Add Styling
```scss
// my-component.component.scss
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;

:host {
  display: block;
}

.my-component {
  color: var(--os-color-text-primary);

  &:hover {
    background-color: var(--os-color-bg-hover);
  }
}
```

See: [.claude/rules/06-scss.md](../rules/06-scss.md)

### 6. Update Barrel Exports (if reusable)
```typescript
// /shared/components/index.ts
export * from './my-component/my-component.component';
```

### 7. Document (if reusable)
Update [.claude/context/reusable-components.md](../context/reusable-components.md)

## 📚 Related
- [Critical Rules](../rules/01-CRITICAL.md)
- [SCSS Rules](../rules/06-scss.md)
- [Component Template](../templates/component.template.ts)
