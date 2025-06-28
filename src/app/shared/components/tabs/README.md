# Tabs Component

A powerful and flexible standalone Angular tabs component for creating organized tabbed interfaces throughout the application.

## Features

- **Standalone Component**: Can be imported directly without additional modules
- **OnPush Change Detection**: Optimized performance with `ChangeDetectionStrategy.OnPush`
- **Multiple Usage Patterns**: Template-based and data-driven approaches
- **Flexible Positioning**: Top, bottom, left, and right tab positions
- **Multiple Variants**: Default, pills, underline, and card styles
- **Keyboard Navigation**: Full ARIA support with arrow keys, Home, and End
- **Closable Tabs**: Optional close buttons with events
- **Badge Support**: Show notifications or counts on tabs
- **Icon Support**: Add icons to tab labels
- **Lazy Loading**: Optional lazy loading of tab content
- **Responsive Design**: Adapts to mobile and desktop viewports
- **Theming Integration**: Uses project's CSS custom properties

## Usage

### Template-Based Tabs (Simple)

```html
<os-tabs [(activeTabIndex)]="selectedTab" (tabChange)="onTabChange($event)">
  <os-tab label="Overview">
    <h3>Overview Content</h3>
    <p>This is the overview tab content.</p>
  </os-tab>
  
  <os-tab label="Details" badge="3">
    <h3>Details Content</h3>
    <p>This tab has a badge showing 3 items.</p>
  </os-tab>
  
  <os-tab label="Settings" [disabled]="true">
    <h3>Settings Content</h3>
    <p>This tab is disabled.</p>
  </os-tab>
</os-tabs>
```

### Data-Driven Tabs (Advanced)

```html
<os-tabs 
  [tabs]="tabsData" 
  [activeTabIndex]="currentTab"
  variant="pills"
  size="large"
  (tabChange)="handleTabChange($event)"
  (tabClose)="handleTabClose($event)">
  
  <!-- Content for each tab using slots -->
  <div slot="tab-0">
    <h3>Dynamic Tab 1</h3>
    <p>Content for the first dynamic tab.</p>
  </div>
  
  <div slot="tab-1">
    <h3>Dynamic Tab 2</h3>
    <p>Content for the second dynamic tab.</p>
  </div>
</os-tabs>
```

### Tabs with Icons and Close Buttons

```html
<os-tabs variant="underline" size="medium">
  <os-tab label="Dashboard" icon="📊" tooltip="View your main dashboard">
    <app-dashboard-content></app-dashboard-content>
  </os-tab>
  
  <os-tab label="Messages" icon="💬" badge="12" [closable]="true" tooltip="Read your messages">
    <app-messages-content></app-messages-content>
  </os-tab>
  
  <os-tab label="Profile" icon="👤" tooltip="Manage your profile settings">
    <app-profile-content></app-profile-content>
  </os-tab>
</os-tabs>
```

### Tabs with Tooltips and Disabled Reasons

```html
<os-tabs variant="pills" size="medium">
  <os-tab label="Analytics" tooltip="View detailed analytics and reports">
    <app-analytics-content></app-analytics-content>
  </os-tab>
  
  <os-tab label="Settings" [disabled]="true" disabledReason="Settings are locked during maintenance mode">
    <app-settings-content></app-settings-content>
  </os-tab>
  
  <os-tab label="Billing" [disabled]="!hasPermission" disabledReason="You don't have permission to view billing information">
    <app-billing-content></app-billing-content>
  </os-tab>
</os-tabs>
```

### Vertical Tabs

```html
<os-tabs position="left" variant="card" size="large">
  <os-tab label="Account Settings">
    <app-account-settings></app-account-settings>
  </os-tab>
  
  <os-tab label="Privacy Settings">
    <app-privacy-settings></app-privacy-settings>
  </os-tab>
  
  <os-tab label="Notification Settings">
    <app-notification-settings></app-notification-settings>
  </os-tab>
</os-tabs>
```

## API Reference

### TabsComponent Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activeTabIndex` | `number` | `0` | Index of the currently active tab |
| `position` | `TabPosition` | `'top'` | Tab position: `'top'` \| `'bottom'` \| `'left'` \| `'right'` |
| `size` | `TabSize` | `'medium'` | Tab size: `'small'` \| `'medium'` \| `'large'` |
| `variant` | `TabVariant` | `'default'` | Visual variant: `'default'` \| `'pills'` \| `'underline'` \| `'card'` |
| `customClass` | `string` | `undefined` | Additional CSS classes to apply |
| `tabs` | `TabConfig[]` | `undefined` | Array of tab configurations for data-driven mode |
| `lazy` | `boolean` | `false` | Enable lazy loading of tab content |
| `animationDuration` | `number` | `300` | Animation duration in milliseconds |

### TabsComponent Outputs

| Event | Type | Description |
|-------|------|-------------|
| `tabChange` | `EventEmitter<TabChangeEvent>` | Fired when a tab is selected |
| `tabClose` | `EventEmitter<TabCloseEvent>` | Fired when a closable tab is closed |

### TabComponent Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | `undefined` | Unique identifier for the tab |
| `label` | `string` | **required** | Tab label text |
| `disabled` | `boolean` | `false` | Whether the tab is disabled |
| `badge` | `string \| number` | `undefined` | Badge text or number to display |
| `icon` | `string` | `undefined` | Icon to display (emoji or icon class) |
| `closable` | `boolean` | `false` | Whether the tab can be closed |
| `tooltip` | `string` | `undefined` | Tooltip text to show on hover |
| `disabledReason` | `string` | `undefined` | Reason why tab is disabled (shown on hover when disabled) |

### TypeScript Interfaces

```typescript
interface TabConfig {
  id: string;
  label: string;
  disabled?: boolean;
  badge?: string | number;
  icon?: string;
  closable?: boolean;
  tooltip?: string;
  disabledReason?: string;
}

interface TabChangeEvent {
  index: number;
  tab: TabConfig;
  previousIndex: number;
}

interface TabCloseEvent {
  index: number;
  tab: TabConfig;
}

type TabPosition = 'top' | 'bottom' | 'left' | 'right';
type TabSize = 'small' | 'medium' | 'large';
type TabVariant = 'default' | 'pills' | 'underline' | 'card';
```

## Styling

### Size Variants

- **Small**: Compact tabs for dense layouts
- **Medium**: Balanced size for most use cases (default)
- **Large**: Prominent tabs for primary navigation

### Visual Variants

- **Default**: Clean underline style on active tab
- **Pills**: Rounded button-style tabs
- **Underline**: Minimalist with bottom border indicator
- **Card**: Card-style tabs that connect to content area

### Position Options

- **Top**: Traditional horizontal tabs at the top (default)
- **Bottom**: Horizontal tabs at the bottom
- **Left**: Vertical tabs on the left side
- **Right**: Vertical tabs on the right side

### Custom Styling

Use utility classes for additional customization:

```html
<os-tabs customClass="os-tab-spacing--lg os-tab-animation--smooth">
  <!-- tabs content -->
</os-tabs>
```

Available utility classes:
- **Spacing**: `os-tab-spacing--xs/sm/md/lg/xl`
- **Padding**: `os-tab-padding--xs/sm/md/lg/xl`
- **Animation**: `os-tab-animation--smooth/fast/slow`
- **Badge**: `os-tab-badge--primary/success/warning/danger`

## Component Architecture

### File Structure
```
tabs/
├── tabs.component.ts          # Main tabs container component
├── tabs.component.html        # Template with accessibility features
├── tabs.component.scss        # Component-specific styles
├── tab.component.ts           # Individual tab component
├── tabs.types.ts             # TypeScript interfaces and types
├── tabs.component.spec.ts    # Unit tests for tabs
├── tab.component.spec.ts     # Unit tests for tab
├── README.md                 # This documentation
└── index.ts                  # Public API exports
```

### Key Features

1. **Content Projection**: Uses `<ng-content>` for flexible tab content
2. **QueryList**: Automatically detects child `os-tab` components
3. **Keyboard Navigation**: Full arrow key support with proper focus management
4. **Accessibility**: ARIA roles, states, and properties for screen readers
5. **Performance**: OnPush change detection and optional lazy loading

## Accessibility

The tabs component follows ARIA guidelines:

- **Roles**: `tablist`, `tab`, `tabpanel`
- **States**: `aria-selected`, `aria-disabled`, `aria-hidden`
- **Keyboard Navigation**: Arrow keys, Home, End
- **Focus Management**: Proper focus indicators and management

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Left/Right` | Navigate between tabs (horizontal) |
| `Arrow Up/Down` | Navigate between tabs (vertical) |
| `Home` | Go to first tab |
| `End` | Go to last tab |
| `Space/Enter` | Activate focused tab |

## Examples

### Dashboard with Lazy Loading

```typescript
@Component({
  template: `
    <os-tabs [lazy]="true" variant="underline">
      <os-tab label="Analytics" badge="new">
        <app-analytics-dashboard></app-analytics-dashboard>
      </os-tab>
      
      <os-tab label="Reports">
        <app-reports-dashboard></app-reports-dashboard>
      </os-tab>
    </os-tabs>
  `
})
export class DashboardComponent {
  // Component logic
}
```

### Dynamic Tabs with Close

```typescript
@Component({
  template: `
    <os-tabs 
      [tabs]="openTabs" 
      [activeTabIndex]="currentTab"
      (tabClose)="closeTab($event)">
    </os-tabs>
  `
})
export class EditorComponent {
  openTabs: TabConfig[] = [
    { id: 'file1', label: 'index.html', closable: true },
    { id: 'file2', label: 'styles.css', closable: true },
    { id: 'file3', label: 'script.js', closable: true, badge: '*' }
  ];
  
  currentTab = 0;
  
  closeTab(event: TabCloseEvent) {
    this.openTabs = this.openTabs.filter((_, index) => index !== event.index);
    if (this.currentTab >= this.openTabs.length) {
      this.currentTab = Math.max(0, this.openTabs.length - 1);
    }
  }
}
```

### Settings with Icons

```typescript
@Component({
  template: `
    <os-tabs position="left" variant="card" size="large">
      <os-tab label="General" icon="⚙️">
        <app-general-settings></app-general-settings>
      </os-tab>
      
      <os-tab label="Security" icon="🔒">
        <app-security-settings></app-security-settings>
      </os-tab>
      
      <os-tab label="Notifications" icon="🔔" badge="3">
        <app-notification-settings></app-notification-settings>
      </os-tab>
    </os-tabs>
  `
})
export class SettingsComponent {
  // Component logic
}
```

## Integration

### In Standalone Components

```typescript
import { TabsComponent, TabComponent } from '../../../shared/components/tabs';

@Component({
  standalone: true,
  imports: [TabsComponent, TabComponent, /*other imports*/],
  // ...
})
export class MyComponent { }
```

### In Modules

```typescript
import { TabsComponent, TabComponent } from '../../../shared/components/tabs';

@NgModule({
  imports: [
    TabsComponent,
    TabComponent,
    // other imports
  ],
  // ...
})
export class MyModule { }
```

## Best Practices

1. **Use descriptive labels**: Keep tab labels clear and concise
2. **Limit tab count**: Consider alternative navigation for more than 7-8 tabs
3. **Consistent sizing**: Use the same size within a tab group
4. **Icon consistency**: Use similar icon styles throughout the application
5. **Badge usage**: Use badges sparingly for important notifications
6. **Keyboard testing**: Always test keyboard navigation
7. **Mobile consideration**: Test tab behavior on mobile devices

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 16+
- Project's SCSS variables and theme system
- No external dependencies required