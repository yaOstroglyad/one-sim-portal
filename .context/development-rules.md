# Development Rules and Guidelines

This document outlines the mandatory rules and best practices for developing components and styles in this project.

## 🚫 Mandatory Rules

### 1. **No Hardcoded Colors**
**Rule**: Never use hardcoded color values in SCSS/CSS files.

**❌ Wrong:**
```scss
.my-component {
  background: #ffffff;
  color: #000000;
  border: 1px solid #cccccc;
}
```

**✅ Correct:**
```scss
.my-component {
  background: var(--os-color-white);
  color: var(--os-color-black);
  border: 1px solid var(--os-color-light-shade);
}
```

**Available CSS Variables:**
- **Primary Colors**: `--os-color-primary`, `--os-color-primary-shade`, `--os-color-primary-tint`
- **Semantic Colors**: `--os-color-success`, `--os-color-warning`, `--os-color-danger`
- **Neutral Colors**: `--os-color-white`, `--os-color-black`, `--os-color-light`, `--os-color-medium`, `--os-color-dark`
- **Special**: `--os-color-transparent`
- **RGB Variants**: `--os-color-white-rgb`, `--os-color-black-rgb`, etc. (for rgba() usage)

**For RGBA usage:**
```scss
.my-component {
  background: rgba(var(--os-color-white-rgb), 0.8);
  box-shadow: 0 2px 4px rgba(var(--os-color-black-rgb), 0.1);
}
```

### 2. **Component Selector Prefix**
**Rule**: All custom components must use `os-` prefix instead of `app-`.

**❌ Wrong:**
```typescript
@Component({
  selector: 'app-my-component',
  // ...
})
```

**✅ Correct:**
```typescript
@Component({
  selector: 'os-my-component',
  // ...
})
```

**Usage in templates:**
```html
<!-- Wrong -->
<app-card title="Example">Content</app-card>

<!-- Correct -->
<os-card title="Example">Content</os-card>
```

**Rationale**: The `os-` prefix prevents naming conflicts with Angular's default `app-` prefix and provides clear identification of our custom components.

## 📋 Best Practices

### 3. **CSS Class Naming Convention**
- Use `os-` prefix for all utility classes
- Follow BEM methodology for component-specific classes
- Use semantic naming

**Examples:**
```scss
// Utility classes
.os-card-shadow--lg
.os-spacing--md
.os-text--primary

// Component classes (BEM)
.os-card
.os-card__header
.os-card__header--compact
.os-card--interactive
```

### 4. **SCSS Structure**
- Import variables at the top of component SCSS files
- Use mixins for repeated patterns
- Group related styles together

```scss
@import "../../../../scss/variables";

.os-my-component {
  background: var(--os-color-white);
  
  // States
  &--active {
    background: var(--os-color-primary-opacity-05);
  }
  
  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  // Elements
  &__header {
    padding: 16px;
    border-bottom: 1px solid var(--os-color-light-shade);
  }
  
  &__content {
    padding: 16px;
  }
}
```

### 5. **Responsive Design**
- Use CSS Grid and Flexbox for layouts
- Implement mobile-first approach
- Use consistent breakpoints

```scss
.os-component {
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
}
```

### 6. **Accessibility**
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation
- Maintain proper color contrast

```html
<os-card 
  role="article"
  [attr.aria-label]="cardTitle"
  tabindex="0">
  <h3>{{ cardTitle }}</h3>
  <p>{{ cardContent }}</p>
</os-card>
```

### 7. **TypeScript Standards**
- Use strict typing
- Define interfaces for component inputs
- Use enums for predefined values

```typescript
export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardSize = 'small' | 'medium' | 'large';

export interface CardConfig {
  variant?: CardVariant;
  size?: CardSize;
  interactive?: boolean;
}
```

## 🔧 Development Workflow

### Before Creating New Components:
1. **Check existing components** for similar functionality
2. **Review design system** variables and utilities
3. **Plan reusability** - make components flexible and configurable
4. **Follow naming conventions** with `os-` prefix
5. **Use CSS variables** exclusively for colors

### Code Review Checklist:
- [ ] No hardcoded colors used
- [ ] Component uses `os-` prefix
- [ ] Proper TypeScript typing
- [ ] Responsive design implemented
- [ ] Accessibility considerations included
- [ ] Documentation updated
- [ ] Tests written and passing

### Adding New Colors:
If you need a new color that doesn't exist in the design system:

1. **Add to `_variables.scss`**:
```scss
:root {
  --os-color-info: #17a2b8;
  --os-color-info-rgb: 23, 162, 184;
}
```

2. **Add SCSS variable**:
```scss
$color-info: #{var(--os-color-info)};
```

3. **Update documentation** with the new color

## 🚨 Common Mistakes to Avoid

1. **Using hardcoded colors**: Always use CSS variables
2. **Wrong component prefix**: Use `os-` not `app-`
3. **Inconsistent naming**: Follow BEM methodology
4. **Missing responsive design**: Always consider mobile
5. **Poor accessibility**: Include ARIA labels and semantic HTML
6. **Duplicate code**: Create reusable utilities instead

## 📚 Resources

- **CSS Variables Location**: `src/scss/_variables.scss`
- **Utility Classes**: `src/scss/_card-utilities.scss`
- **Component Examples**: `src/app/shared/components/card/`
- **Design System**: See CoreUI and project-specific variables

## 🔄 Review Process

All code changes must:
1. Follow these rules and best practices
2. Pass automated linting and testing
3. Be reviewed by at least one team member
4. Include updated documentation if applicable

**Remember**: These rules ensure consistency, maintainability, and future compatibility of our codebase.