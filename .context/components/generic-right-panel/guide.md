# Generic Right Panel Component

## Overview
The Generic Right Panel Component provides a modern, resizable sidebar panel that slides in from the right side of the screen. It's designed to replace modal dialogs for better user experience and improved workflow.

## Features

### ✅ Core Features
- **Sticky Header**: Fixed header that stays visible during scrolling
- **Sticky Footer**: Optional footer for action buttons (shown when `hasFooter` is true)
- **Resizable**: Drag & drop resizing with configurable min/max constraints
- **Custom Actions**: Header actions with default close and expand/collapse actions
- **Content Projection**: Flexible content areas using Angular content projection
- **Responsive**: Mobile-friendly with automatic full-width on small screens
- **Dark Theme**: Full dark theme support
- **Animations**: Smooth slide-in/out animations with backdrop fade

### 🎛️ Configuration Options
- **Resizing**: Enable/disable, set min/max width, default width
- **Actions**: Custom header actions with icons and handlers
- **Overlay**: Optional backdrop overlay (can be disabled)
- **Footer**: Show/hide footer for action buttons

## Basic Usage

### 1. Import Component
```typescript
import { GenericRightPanelComponent, PanelAction } from '../path/to/generic-right-panel';

@Component({
  imports: [GenericRightPanelComponent]
})
```

### 2. Template Usage
```html
<app-generic-right-panel
  title="Panel Title"
  [isOpen]="showPanel"
  [hasFooter]="true"
  (close)="onPanelClose()">
  
  <div panel-content>
    <!-- Your content here -->
    <p>Panel content goes here</p>
  </div>
  
  <div panel-actions>
    <!-- Footer buttons -->
    <button class="btn btn-secondary" (click)="onCancel()">Cancel</button>
    <button class="btn btn-primary" (click)="onSave()">Save</button>
  </div>
  
</app-generic-right-panel>
```

## Advanced Configuration

### Panel Actions
```typescript
export class MyComponent {
  panelActions: PanelAction[] = [
    {
      id: 'edit',
      icon: 'cilPencil',
      label: 'Edit Item',
      handler: () => this.onEdit()
    },
    {
      id: 'share',
      icon: 'cilShare',
      label: 'Share',
      disabled: false,
      handler: () => this.onShare()
    }
  ];
}
```

```html
<app-generic-right-panel
  [actions]="panelActions"
  [isOpen]="showPanel">
  <!-- content -->
</app-generic-right-panel>
```

### Resizable Panel
```html
<app-generic-right-panel
  [resizable]="true"
  [minWidth]="300"
  [maxWidth]="800"
  [defaultWidth]="500"
  (widthChange)="onWidthChanged($event)">
  <!-- content -->
</app-generic-right-panel>
```

### Different Panel Types

#### Details Panel (Resizable)
```html
<app-generic-right-panel
  title="Item Details"
  [isOpen]="showDetails"
  [actions]="detailsActions"
  [resizable]="true"
  [defaultWidth]="600"
  [maxWidth]="900">
  
  <div panel-content>
    <!-- Read-only content -->
  </div>
</app-generic-right-panel>
```

#### Form Panel (Fixed Width)
```html
<app-generic-right-panel
  title="Edit Item"
  [isOpen]="showEdit"
  [hasFooter]="true"
  [resizable]="false"
  [defaultWidth]="500">
  
  <div panel-content>
    <!-- Form content -->
  </div>
  
  <div panel-actions>
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save</button>
  </div>
</app-generic-right-panel>
```

#### Confirmation Panel (Small)
```html
<app-generic-right-panel
  title="Confirm Action"
  [isOpen]="showConfirm"
  [defaultWidth]="400"
  [resizable]="false"
  [hasFooter]="true"
  [showOverlay]="true">
  
  <div panel-content>
    <!-- Confirmation message -->
  </div>
  
  <div panel-actions>
    <button class="btn btn-outline-secondary">Cancel</button>
    <button class="btn btn-danger">Delete</button>
  </div>
</app-generic-right-panel>
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `''` | Panel header title |
| `isOpen` | `boolean` | `false` | Controls panel visibility |
| `actions` | `PanelAction[]` | `[]` | Custom header actions |
| `hasFooter` | `boolean` | `false` | Show/hide footer |
| `resizable` | `boolean` | `true` | Enable drag-to-resize |
| `minWidth` | `number` | `400` | Minimum panel width (px) |
| `maxWidth` | `number` | `800` | Maximum panel width (px) |
| `defaultWidth` | `number` | `500` | Default panel width (px) |
| `showOverlay` | `boolean` | `true` | Show backdrop overlay |
| `topOffset` | `number` | `64` | Top offset from viewport (px) |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `close` | `EventEmitter<void>` | Emitted when panel should close |
| `widthChange` | `EventEmitter<number>` | Emitted when panel width changes |

### Content Projection

| Selector | Description |
|----------|-------------|
| `[panel-content]` | Main panel content area |
| `[panel-actions]` | Footer action buttons |

### PanelAction Interface

```typescript
interface PanelAction {
  id: string;           // Unique identifier
  icon: string;         // CoreUI icon name
  label: string;        // Tooltip text
  disabled?: boolean;   // Disable action
  handler: () => void;  // Click handler
}
```

## Default Actions

The panel automatically includes these default actions:

1. **Expand/Collapse**: Toggles between default and maximum width
   - Icon: `cilArrowLeft` / `cilArrowRight`
   - Only shown when `resizable` is true

2. **Close**: Closes the panel
   - Icon: `cilX`
   - Always shown

## Migration from Generic Dialog

### Before (Generic Dialog)
```html
<app-generic-dialog
  title="Edit Item"
  [isOpen]="showDialog"
  size="medium"
  (close)="onClose()">
  
  <div dialog-content>
    <!-- content -->
  </div>
  
  <div dialog-actions>
    <!-- actions -->
  </div>
</app-generic-dialog>
```

### After (Generic Right Panel)
```html
<app-generic-right-panel
  title="Edit Item"
  [isOpen]="showPanel"
  [hasFooter]="true"
  (close)="onClose()">
  
  <div panel-content>
    <!-- content -->
  </div>
  
  <div panel-actions>
    <!-- actions -->
  </div>
</app-generic-right-panel>
```

### Migration Steps
1. Replace `app-generic-dialog` with `app-generic-right-panel`
2. Change `dialog-content` to `panel-content`
3. Change `dialog-actions` to `panel-actions`
4. Replace `size` prop with `defaultWidth` and `hasFooter`
5. Add resizing configuration if needed
6. Update component imports

## Styling

### CSS Custom Properties
The component uses CSS custom properties for theming:

```scss
:root {
  --cui-body-bg: #ffffff;
  --cui-border-color: #d4d4d8;
  --cui-body-color: #374151;
  --os-color-primary: #3b82f6;
}

[data-theme="dark"] {
  --cui-body-bg: #1f2937;
  --cui-border-color: #374151;
  --cui-body-color: #f9fafb;
}
```

### Custom Styling
```scss
// Override panel styling
.right-panel {
  .panel-header {
    background: var(--custom-header-bg);
  }
  
  .panel-content {
    padding: 2rem; // Custom padding
  }
}
```

## Accessibility

- **ARIA Labels**: Proper ARIA labels for screen readers
- **Keyboard Navigation**: Support for ESC key to close
- **Focus Management**: Maintains focus within panel
- **High Contrast**: Supports high contrast mode
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Features**: CSS Grid, CSS Custom Properties, ResizeObserver

## Best Practices

### 1. Panel Width Guidelines
- **Forms**: 400-600px for most forms
- **Details**: 500-800px for read-only content
- **Confirmations**: 350-450px for simple confirmations

### 2. Content Organization
- Use clear section headings
- Group related content together
- Provide adequate spacing between sections

### 3. Action Buttons
- Place primary action on the right
- Use consistent button styling
- Provide clear labels

### 4. Responsive Design
- Panel becomes full-width on mobile
- Consider content reflow for small screens
- Test with different screen sizes

### 5. Performance
- Use `OnPush` change detection when possible
- Lazy load panel content if expensive
- Debounce resize events if needed

## Examples in Codebase

See `/src/app/views/product-constructor/components/regions/region-list/` for complete implementation examples including:
- Details panel with custom actions
- Edit form panel 
- Delete confirmation panel
- Resizable panels with different configurations