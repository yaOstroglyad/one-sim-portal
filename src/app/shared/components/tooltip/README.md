# Tooltip Component

A flexible and customizable standalone Angular tooltip component with directive support for easy integration throughout the application.

## Features

- **Standalone Component**: Can be imported directly without additional modules
- **OnPush Change Detection**: Optimized performance with `ChangeDetectionStrategy.OnPush`
- **Directive Support**: Easy integration with `osTooltip` directive
- **Multiple Positions**: Top, bottom, left, right positioning
- **Multiple Variants**: Default, error, warning, info, success styles
- **Customizable Delay**: Configurable show/hide delays
- **Responsive Design**: Adapts to mobile and desktop viewports
- **Accessibility**: Proper ARIA attributes and keyboard support
- **Animation**: Smooth fade-in/out with scale animation

## Usage

### Using the Directive (Recommended)

```html
<!-- Basic tooltip -->
<button osTooltip="Click me to save">Save</button>

<!-- Tooltip with custom position and variant -->
<button 
  osTooltip="This action cannot be undone"
  tooltipPosition="top"
  tooltipVariant="error"
  tooltipDelay="200">
  Delete
</button>

<!-- Tooltip with custom content template -->
<button 
  [osTooltip]="''"
  [tooltipContent]="customTooltipTemplate"
  tooltipVariant="info"
  tooltipPosition="top">
  Rich Tooltip
</button>

<ng-template #customTooltipTemplate>
  <div>
    <strong>🚀 Advanced Feature</strong>
    <p>This feature includes:</p>
    <ul>
      <li>Real-time updates</li>
      <li>Custom analytics</li>
      <li>Export options</li>
    </ul>
    <button class="btn btn-sm btn-primary">Learn More</button>
  </div>
</ng-template>

<!-- Tooltip with all options -->
<div 
  osTooltip="This is a detailed explanation of what this element does"
  tooltipPosition="right"
  tooltipVariant="info"
  tooltipDelay="500"
  tooltipMaxWidth="250"
  [tooltipDisabled]="isTooltipDisabled">
  Hover me
</div>
```

### Using the Component Directly

```html
<!-- With text input -->
<div class="my-element">
  <span>Hover me</span>
  <os-tooltip 
    text="Tooltip content here"
    position="top"
    variant="default"
    [delay]="500"
    [maxWidth]="300">
  </os-tooltip>
</div>

<!-- With ng-content (recommended for rich content) -->
<div class="my-element">
  <button>Hover me</button>
  <os-tooltip position="top" variant="info" [delay]="300">
    <div>
      <strong>Rich Content Tooltip</strong>
      <p>This is much easier than templates!</p>
      <ul>
        <li>Direct HTML content</li>
        <li>No template references needed</li>
        <li>Clean and simple</li>
      </ul>
      <button class="btn btn-sm">Action</button>
    </div>
  </os-tooltip>
</div>
```

## API Reference

### TooltipDirective Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `osTooltip` | `string` | `''` | Tooltip text content (ignored if tooltipContent is provided) |
| `tooltipPosition` | `TooltipPosition` | `'top'` | Position: `'top'` \| `'bottom'` \| `'left'` \| `'right'` |
| `tooltipVariant` | `TooltipVariant` | `'default'` | Style variant: `'default'` \| `'error'` \| `'warning'` \| `'info'` \| `'success'` |
| `tooltipDelay` | `number` | `500` | Delay before showing tooltip (ms) |
| `tooltipMaxWidth` | `number` | `300` | Maximum width of tooltip in pixels |
| `tooltipDisabled` | `boolean` | `false` | Whether tooltip is disabled |
| `tooltipContent` | `TemplateRef<any>` | `undefined` | Custom content template (overrides text) |

### TooltipComponent Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` | `string` | `''` | Tooltip text content |
| `position` | `TooltipPosition` | `'top'` | Position relative to parent |
| `variant` | `TooltipVariant` | `'default'` | Visual style variant |
| `delay` | `number` | `500` | Delay before showing (ms) |
| `maxWidth` | `number` | `300` | Maximum width in pixels |
| `disabled` | `boolean` | `false` | Whether tooltip is disabled |

### Types

```typescript
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type TooltipVariant = 'default' | 'error' | 'warning' | 'info' | 'success';
```

## Styling

### Variant Styles

- **Default**: Dark background with white text
- **Error**: Red background for errors and warnings
- **Warning**: Yellow background with dark text
- **Info**: Blue background for informational messages
- **Success**: Green background for success messages

### Position Behavior

- **Top**: Tooltip appears above the element (default)
- **Bottom**: Tooltip appears below the element
- **Left**: Tooltip appears to the left of the element
- **Right**: Tooltip appears to the right of the element

## Examples

### Basic Usage

```html
<!-- Simple tooltip -->
<span osTooltip="Save your changes">💾</span>

<!-- Error tooltip for disabled button -->
<button 
  [disabled]="!isValid"
  osTooltip="Please fill all required fields"
  tooltipVariant="error">
  Submit
</button>
```

### Advanced Usage

```html
<!-- Dynamic tooltip content -->
<div 
  [osTooltip]="getTooltipText()"
  [tooltipVariant]="hasError ? 'error' : 'info'"
  [tooltipPosition]="isMobile ? 'top' : 'right'">
  Status: {{ status }}
</div>

<!-- Conditional tooltip -->
<button 
  [osTooltip]="showHelp ? 'Click to toggle view' : ''"
  [tooltipDisabled]="!showHelp">
  Toggle
</button>
```

### In Forms

```html
<!-- Field with help tooltip -->
<div class="form-group">
  <label 
    osTooltip="Enter your full legal name as it appears on ID"
    tooltipPosition="right"
    tooltipVariant="info">
    Full Name *
  </label>
  <input type="text" class="form-control">
</div>

<!-- Validation error tooltip -->
<input 
  type="email"
  [class.is-invalid]="emailError"
  [osTooltip]="emailError"
  [tooltipVariant]="emailError ? 'error' : 'default'"
  [tooltipDisabled]="!emailError">
```

### Integration with Tabs

The tooltip component is automatically integrated with the tabs component:

```html
<os-tabs>
  <os-tab label="Overview" tooltip="General information and statistics">
    <!-- content -->
  </os-tab>
  
  <os-tab 
    label="Settings" 
    [disabled]="true" 
    disabledReason="Settings are locked during maintenance">
    <!-- content -->
  </os-tab>
</os-tabs>
```

## Best Practices

1. **Keep text concise**: Tooltips should be brief and informative
2. **Use appropriate variants**: Error for problems, info for help, etc.
3. **Consider mobile**: Use appropriate delays and positions for touch devices
4. **Test positioning**: Ensure tooltips don't go off-screen
5. **Accessibility**: Tooltips should supplement, not replace, accessible labels
6. **Performance**: Use reasonable delays to avoid overwhelming users

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 16+
- Project's SCSS variables and theme system
- No external dependencies required