# Info Strip Component

## Overview

A reusable component for displaying informational messages with configurable styling and content. The component supports different visual types and automatically handles both plain text and HTML content through innerHTML.

## Features

- **Configurable Types**: Support for `primary`, `warning`, and `alert` visual styles
- **Custom Icons**: Ability to specify custom Material Icons (default: `info`)
- **Flexible Content**: Support for both plain text and HTML content automatically
- **Responsive Design**: Adapts to container width with proper text wrapping
- **Consistent Styling**: Follows Material Design principles with brand colors

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | `string` | `'info'` | Material icon name to display |
| `text` | `string` | `''` | Text or HTML content to display |
| `type` | `InfoStripType` | `'primary'` | Visual style type |

### Types

```typescript
export type InfoStripType = 'primary' | 'warning' | 'alert';
```

## Visual Types

### Primary (Default)
- **Background**: Light blue (#e3f2fd)
- **Border**: Blue (#2196f3)
- **Text**: Dark blue (#1565c0)
- **Use Case**: General information, neutral messages

### Warning
- **Background**: Light orange (#fff3e0)
- **Border**: Orange (#ff9800)
- **Text**: Dark orange (#ef6c00)
- **Use Case**: Cautionary messages, non-critical alerts

### Alert
- **Background**: Light red (#ffebee)
- **Border**: Red (#f44336)
- **Text**: Dark red (#c62828)
- **Use Case**: Error messages, critical alerts

## Usage Examples

### Basic Usage
```html
<app-info-strip text="This is a basic information message"></app-info-strip>
```

### With Custom Icon
```html
<app-info-strip 
  icon="warning" 
  text="Please check your input"
  type="warning">
</app-info-strip>
```

### With HTML Content
```html
<app-info-strip 
  text="Visit our <a href='/help'>help center</a> for more information"
  type="primary">
</app-info-strip>
```

### Alert Type
```html
<app-info-strip 
  icon="error"
  text="Action cannot be completed"
  type="alert">
</app-info-strip>
```

## Technical Implementation

### File Structure
```
src/app/shared/components/info-strip/
├── info-strip.component.ts
├── info-strip.component.html
└── info-strip.component.scss
```

### Dependencies
- Angular Common Module
- Angular Material Icons Module

### Standalone Component
The component is implemented as a standalone component and can be imported directly or through the shared module exports.

## Integration

### Import
```typescript
import { InfoStripComponent } from './shared';
```

### In Component
```typescript
@Component({
  imports: [InfoStripComponent]
})
export class MyComponent {
  // component logic
}
```

## Accessibility & Security

- Uses semantic HTML structure
- Proper color contrast ratios for all types
- Icon provides visual context
- Text content is screen reader accessible
- Supports keyboard navigation when interactive elements are included

### Security Note
The component uses `innerHTML` to render content, which allows both plain text and HTML. When using HTML content, ensure the content is trusted and sanitized to prevent XSS attacks. For user-generated content, consider using Angular's DomSanitizer. 