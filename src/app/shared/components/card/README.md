# Card Component

A reusable standalone Angular component for creating consistent card layouts throughout the application.

## Features

- **Standalone Component**: Can be imported directly without additional modules
- **Multiple Variants**: Default, elevated, outlined, interactive, and notification styles  
- **Flexible Sizing**: Small, medium, and large size options
- **Content Projection**: Support for header actions and footer actions
- **Theming Integration**: Uses project's CSS custom properties and theme system
- **Responsive Design**: Adapts to mobile and desktop viewports
- **Accessibility**: Proper semantic structure and keyboard navigation support

## Usage

### Basic Example

```html
<os-card title="Basic Card" subtitle="Simple card example">
  <p>Card content goes here</p>
</os-card>
```

### Interactive Card

```html
<os-card 
  title="Interactive Card"
  subtitle="Click me!"
  variant="interactive"
  [interactive]="true"
  (click)="handleCardClick()">
  <p>This card responds to user interactions</p>
</os-card>
```

### Card with Actions

```html
<os-card 
  title="Card with Actions"
  [showActions]="true">
  
  <!-- Header actions -->
  <div slot="header-actions">
    <button class="btn btn-sm btn-outline-primary">Settings</button>
  </div>
  
  <!-- Main content -->
  <p>Card content here</p>
  
  <!-- Footer actions -->
  <div slot="actions">
    <button class="btn btn-sm btn-outline-secondary me-2">Cancel</button>
    <button class="btn btn-sm btn-primary">Save</button>
  </div>
</os-card>
```

## API Reference

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `undefined` | Card title displayed in header |
| `subtitle` | `string` | `undefined` | Card subtitle displayed below title |
| `variant` | `CardVariant` | `'default'` | Visual variant: `'default'` \| `'elevated'` \| `'outlined'` \| `'interactive'` \| `'notification'` |
| `size` | `CardSize` | `'medium'` | Card size: `'small'` \| `'medium'` \| `'large'` |
| `interactive` | `boolean` | `false` | Enables hover effects and cursor pointer |
| `selected` | `boolean` | `false` | Applies selected state styling |
| `disabled` | `boolean` | `false` | Disables interactions and applies disabled styling |
| `showHeader` | `boolean` | `true` | Controls header visibility |
| `showActions` | `boolean` | `false` | Enables actions section |
| `customClass` | `string` | `undefined` | Additional CSS classes to apply |

### Content Projection Slots

- **Default slot**: Main card content
- **`[slot="header-actions"]`**: Actions displayed in the header area
- **`[slot="actions"]`**: Actions displayed in the footer area

### CSS Classes

The component generates CSS classes based on the configuration:

```scss
.os-card                    // Base card class
.os-card--{variant}         // Variant-specific styling
.os-card--{size}           // Size-specific styling
.os-card--interactive      // Interactive state
.os-card--selected         // Selected state
.os-card--disabled         // Disabled state
```

## Styling

### Size Variants

- **Small**: Compact padding, smaller fonts - ideal for dense layouts
- **Medium**: Balanced padding and fonts - default choice for most use cases
- **Large**: Generous padding, larger fonts - for prominent content areas

### Visual Variants

- **Default**: Standard card with subtle shadow
- **Elevated**: Enhanced shadow for prominence
- **Outlined**: Border-focused design without shadow
- **Interactive**: Hover effects and transition animations
- **Notification**: Left accent border with gradient background

### Custom Styling

You can extend the component's styling by:

1. **Using utility classes**:
```html
<app-card customClass="os-card-shadow--lg os-card-bg--primary">
```

2. **CSS custom properties** (available globally):
```scss
:root {
  --os-color-primary: #f9a743;
  --os-color-success: #2dd36f;
  --os-color-warning: #ffc409;
  --os-color-danger: #eb445a;
  // ... more variables
}
```

3. **Global utility classes**:
```scss
.os-card-margin--lg      // Large margin
.os-card-padding--sm     // Small padding
.os-card-shadow--xl      // Extra large shadow
.os-card-border--primary // Primary color border
.os-card-bg--success     // Success color background
```

## Examples

### Dashboard Metrics Card

```html
<os-card 
  title="Total Users"
  subtitle="Active in last 30 days"
  variant="elevated"
  size="medium">
  <div class="d-flex align-items-center">
    <h2 class="mb-0 me-3">1,247</h2>
    <span class="badge bg-success">+12%</span>
  </div>
</os-card>
```

### Settings Section Card

```html
<os-card 
  title="Account Settings"
  subtitle="Manage your account preferences"
  [showActions]="true"
  variant="outlined">
  
  <div slot="header-actions">
    <button class="btn btn-sm btn-link">Reset</button>
  </div>
  
  <!-- Form content here -->
  <form>
    <!-- form fields -->
  </form>
  
  <div slot="actions">
    <button type="button" class="btn btn-outline-secondary me-2">Cancel</button>
    <button type="submit" class="btn btn-primary">Save Changes</button>
  </div>
</os-card>
```

### Notification Card

```html
<os-card 
  title="System Update"
  variant="notification"
  size="small">
  <p class="mb-2">A new system update is available.</p>
  <a href="#" class="btn btn-sm btn-primary">Update Now</a>
</os-card>
```

## Integration

### In Components

```typescript
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  standalone: true,
  imports: [CardComponent, /*other imports*/],
  // ...
})
export class MyComponent { }
```

### In Modules

```typescript
import { CardComponent } from '../../../shared/components/card/card.component';

@NgModule({
  imports: [
    CardComponent,
    // other imports
  ],
  // ...
})
export class MyModule { }
```

## Best Practices

1. **Use appropriate variants**: Choose variants that match the content's importance and context
2. **Keep titles concise**: Use clear, descriptive titles that fit within the design constraints
3. **Consistent sizing**: Use the same size within related card groups
4. **Accessible actions**: Ensure action buttons have proper labels and keyboard navigation
5. **Mobile considerations**: Test card layouts on mobile devices and adjust as needed
6. **Performance**: For large lists of cards, consider virtual scrolling or pagination

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 16+
- Project's SCSS variables and theme system
- No external dependencies required