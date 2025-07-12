# Sidebar Component - Quick Reference

## 🚀 Basic Usage
```typescript
import { SidebarComponent } from './shared/components/sidebar';

// Component
@Component({
  standalone: true,
  imports: [SidebarComponent],
  template: `<os-sidebar [config]="config" [data]="data"></os-sidebar>`
})

// Config
config = { theme: 'auto', position: 'left', responsive: true };

// Data
data = {
  sections: [{
    id: 'nav',
    items: [
      { id: 'home', label: 'Home', routerLink: '/' },
      { id: 'dashboard', label: 'Dashboard', routerLink: '/dashboard' }
    ]
  }]
};
```

## ⚙️ Key Config Options
```typescript
interface SidebarConfig {
  theme?: 'light' | 'dark' | 'auto';     // Theme control
  position?: 'left' | 'right';           // Position
  rtl?: boolean;                         // RTL support
  responsive?: boolean;                  // Mobile support
  initialState?: 'open' | 'closed';     // Initial state
}
```

## 📱 Common Patterns

### Theme Switching
```typescript
config = { theme: 'auto' };              // Auto (system)
config = { theme: 'dark' };              // Force dark
config = { theme: 'light' };             // Force light
```

### RTL Support
```typescript
const isRTL = document.dir === 'rtl';
config = { rtl: isRTL };
```

### Mobile Optimization
```typescript
config = {
  responsive: true,
  showBackdrop: true,
  backdropCloseable: true
};
```

### Advanced Navigation
```typescript
data = {
  header: { title: 'App', logoUrl: '/logo.png' },
  sections: [{
    id: 'main',
    title: 'Navigation',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        routerLink: '/dashboard',
        icon: 'dashboard',
        badge: { text: '5', variant: 'primary' }
      },
      {
        id: 'users',
        label: 'Users',
        children: [
          { id: 'list', label: 'List', routerLink: '/users' },
          { id: 'add', label: 'Add', routerLink: '/users/new' }
        ]
      }
    ]
  }],
  footer: {
    actions: [
      { id: 'logout', label: 'Logout', onClick: () => this.logout() }
    ]
  }
};
```

## 🎛️ Methods & Events
```typescript
@ViewChild(SidebarComponent) sidebar!: SidebarComponent;

// Methods
sidebar.open();
sidebar.close();
sidebar.toggle();

// Events
<os-sidebar 
  (stateChanged)="onStateChange($event)"
  (itemClicked)="onItemClick($event)">
</os-sidebar>
```

## ✅ Status: Production Ready
- Standalone component ✅
- Dark/light themes ✅ 
- RTL support ✅
- Mobile responsive ✅
- Accessibility ✅
- TypeScript ✅