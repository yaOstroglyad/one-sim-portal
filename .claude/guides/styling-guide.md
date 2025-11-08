# Styling Guide

> **Context Tags:** `@styling` `@learn-patterns`
> **Read when:** Styling components

## 🎨 Quick Rules

### 1. Use @use (not @import)
```scss
@use "../../../../scss/variables" as vars;
@use "../../../../scss/mixins" as mixins;
```

### 2. Use CSS Variables for Colors
```scss
// ✅ Correct
color: var(--os-color-text-primary);
border: 1px solid var(--os-color-border);

// ❌ Wrong
color: #2c2c2c;
border: 1px solid #e0e0e0;
```

### 3. Check Existing Mixins
```scss
// Dashboard components
@include mixins.dashboard-card-header();
@include mixins.dashboard-chart-container(400px);

// Utilities
@include mixins.interactive-states();
@include mixins.elevation(2);
```

### 4. Responsive Design
```scss
.component {
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## 📚 Related
- [SCSS Rules](../rules/06-scss.md)
- [Reusable Mixins](../context/reusable-components.md#available-scss-mixins)
