# FAB Configuration Service

The FAB Configuration Service provides dynamic configuration for the Floating Action Button (FAB) layout system, including buttons and their associated menu items.

## Menu Items Configuration

Each FAB button can have multiple menu items with various action types. Here are the available options:

### MenuItem Properties

```typescript
interface FabMenuItem {
  id: string;                    // Unique identifier
  label: string;                 // Display text
  icon?: string;                 // Icon name or URL
  action: 'route' | 'component' | 'callback' | 'external';
  target?: string;               // Action target
  badge?: number | string;       // Optional badge
  order: number;                 // Display order
  roles?: string[];              // Role-based access control
}
```

### Action Types

#### 1. **Route Action**
Navigate to an internal route within the application.

```typescript
{
  id: 'chat-history',
  label: 'История чатов',
  icon: 'history',
  action: 'route',
  target: '/chat/history',  // Angular route path
  order: 1
}
```

#### 2. **Component Action**
Load a component dynamically (typically in a flyout/modal).

```typescript
{
  id: 'new-chat',
  label: 'Новый чат',
  icon: 'plus',
  action: 'component',
  target: 'SupportChatShellComponent',  // Component name to load
  order: 2
}
```

#### 3. **Callback Action**
Execute a custom function.

```typescript
{
  id: 'custom-action',
  label: 'Custom Action',
  icon: 'settings',
  action: 'callback',
  target: 'handleCustomAction',  // Function name to execute
  order: 3
}
```

#### 4. **External Action**
Open an external URL in a new tab.

```typescript
{
  id: 'external-help',
  label: 'Внешняя справка',
  icon: 'https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/question-mark-circle.svg',
  action: 'external',
  target: 'https://help.example.com',  // External URL
  order: 4
}
```

## Complete Configuration Example

```typescript
const fabConfig: FabConfiguration = {
  position: 'center',  // 'center' | 'left' | 'right'
  theme: 'light',      // 'light' | 'dark' | 'auto'
  buttons: [
    {
      id: 'support-chat',
      label: 'Чаты',
      icon: 'chat',
      order: 1,
      roles: ['admin', 'support', 'customer'],
      hasMenu: true,
      action: 'toggle-menu',
      menuItems: [
        {
          id: 'new-chat',
          label: 'Новый чат',
          icon: 'plus',
          action: 'component',
          target: 'SupportChatShellComponent',
          order: 1,
          badge: 'NEW'
        },
        {
          id: 'chat-history',
          label: 'История чатов',
          icon: 'history',
          action: 'route',
          target: '/chat/history',
          order: 2,
          badge: 5  // Show number badge
        },
        {
          id: 'chat-settings',
          label: 'Настройки чата',
          icon: 'settings',
          action: 'route',
          target: '/chat/settings',
          order: 3,
          roles: ['admin']  // Only visible to admins
        },
        {
          id: 'external-docs',
          label: 'Документация',
          icon: 'https://example.com/icons/docs.svg',  // External icon URL
          action: 'external',
          target: 'https://docs.example.com',
          order: 4
        }
      ]
    }
  ]
};
```

## Service Methods

### Adding Buttons Dynamically

```typescript
// Add context-specific buttons when navigating to different sections
fabConfigService.addButtons([
  {
    id: 'context-help',
    label: 'Помощь',
    icon: 'help',
    order: 2,
    hasMenu: true,
    menuItems: [
      {
        id: 'page-help',
        label: 'О этой странице',
        icon: 'info',
        action: 'component',
        target: 'HelpComponent',
        order: 1
      }
    ]
  }
]);
```

### Removing Buttons

```typescript
// Remove buttons by their IDs
fabConfigService.removeButtons(['support-chat', 'context-help']);
```

### Creating Button Configurations

```typescript
// Factory method for creating button configurations
const newButton = fabConfigService.createButtonConfig(
  'my-button',
  'My Button',
  'custom-icon',
  {
    hasMenu: true,
    menuItems: [
      // ... menu items
    ],
    roles: ['user']
  }
);
```

## Icon System

Icons can be specified in multiple ways:

1. **Local icons**: Just the icon name (e.g., `'chat'`, `'settings'`)
   - Loaded from `/assets/icons/{name}.svg`

2. **Folder-based icons**: Icon name with folder (handled by IconComponent)
   - Example: `'admin/users'` loads from `/assets/icons/admin/users.svg`

3. **External URLs**: Full URL to SVG icon
   - Example: `'https://cdn.jsdelivr.net/npm/heroicons@1.0.6/outline/plus.svg'`

## Role-Based Access Control

Both buttons and menu items support role-based visibility:

```typescript
{
  id: 'admin-panel',
  label: 'Admin Panel',
  icon: 'admin',
  action: 'route',
  target: '/admin',
  order: 1,
  roles: ['admin', 'super-admin']  // Only visible to these roles
}
```

## Badge Support

Menu items can display badges for notifications or counts:

```typescript
{
  id: 'notifications',
  label: 'Уведомления',
  icon: 'bell',
  action: 'route',
  target: '/notifications',
  order: 1,
  badge: 12  // Numeric badge
}

// Or string badge
{
  id: 'new-feature',
  label: 'Новая функция',
  icon: 'sparkle',
  action: 'route',
  target: '/features/new',
  order: 2,
  badge: 'NEW'  // Text badge
}
```

## Integration with Router

For route actions, ensure the target routes exist in your Angular routing configuration:

```typescript
// In your routing module
const routes: Routes = [
  {
    path: 'chat',
    children: [
      { path: 'history', component: ChatHistoryComponent },
      { path: 'settings', component: ChatSettingsComponent }
    ]
  }
];
```

## Dynamic Component Loading

For component actions, ensure components are registered with the feature registry:

```typescript
// In your component that uses FAB
constructor(private featureRegistry: FeatureRegistryService) {
  // Register components that can be loaded
  this.featureRegistry.register({
    key: 'support-chat',
    title: 'Support Chat',
    loader: () => import('../support-chat/support-chat-shell.component')
      .then(m => m.SupportChatShellComponent)
  });
}
```