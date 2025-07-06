# Sidebar Component

> **Production-ready standalone Angular sidebar component** with comprehensive features

## 🚀 Quick Start

```typescript
import { SidebarComponent } from './shared/components/sidebar';

@Component({
  standalone: true,
  imports: [SidebarComponent],
  template: `<os-sidebar [config]="config" [data]="data"></os-sidebar>`
})
export class MyComponent {
  config = { theme: 'auto', position: 'left', responsive: true };
  data = {
    sections: [{
      id: 'nav',
      items: [
        { id: 'home', label: 'Home', routerLink: '/' },
        { id: 'dashboard', label: 'Dashboard', routerLink: '/dashboard' }
      ]
    }]
  };
}
```

## ✨ Features

- ✅ **Standalone**: No module dependencies
- ✅ **Responsive**: Mobile/tablet/desktop optimized  
- ✅ **Dark/Light Themes**: Auto-detection + manual control
- ✅ **RTL Support**: Arabic, Hebrew, and other RTL languages
- ✅ **Touch Gestures**: Swipe to open/close
- ✅ **Accessibility**: WCAG compliant
- ✅ **Type Safety**: Full TypeScript interfaces

## 🎨 Theme Support

```typescript
// Auto theme (follows system)
config = { theme: 'auto' };

// Force dark/light
config = { theme: 'dark' };  // or 'light'

// CSS integration
<div class="dark">
  <os-sidebar [config]="config" [data]="data"></os-sidebar>
</div>
```

## 🌍 RTL Support

```typescript
// Auto RTL detection
const isRTL = document.dir === 'rtl';
config = { rtl: isRTL };

// Language service integration
translateService.onLangChange.subscribe(event => {
  const rtlLangs = ['ar', 'he', 'ur', 'fa'];
  config = { ...config, rtl: rtlLangs.includes(event.lang) };
});
```

## 📱 Responsive Usage

```typescript
config = {
  responsive: true,        // Enable mobile optimization
  showBackdrop: true,      // Mobile overlay
  backdropCloseable: true, // Close on backdrop click
  breakpoint: '768px'      // Mobile breakpoint
};
```

## 🎯 Advanced Configuration

```typescript
interface SidebarConfig {
  variant?: 'default' | 'compact' | 'minimal' | 'floating';
  position?: 'left' | 'right';
  theme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
  rtl?: boolean;
  initialState?: 'open' | 'closed' | 'collapsed';
  expandedWidth?: string;
  collapsedWidth?: string;
}

interface SidebarData {
  header?: { title?: string; logoUrl?: string; showTitle?: boolean };
  sections: SidebarSection[];
  footer?: { actions?: SidebarAction[] };
}
```

## 🔗 Navigation Structure

```typescript
const data: SidebarData = {
  header: {
    title: 'My App',
    logoUrl: '/logo.png',
    showTitle: true
  },
  sections: [
    {
      id: 'main-nav',
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
            { id: 'all-users', label: 'All Users', routerLink: '/users' },
            { id: 'add-user', label: 'Add User', routerLink: '/users/new' }
          ]
        }
      ]
    }
  ],
  footer: {
    actions: [
      { id: 'logout', label: 'Logout', onClick: () => this.logout() }
    ]
  }
};
```

## 🎛️ Events & Methods

```typescript
// Events
<os-sidebar 
  (stateChanged)="onStateChange($event)"
  (itemClicked)="onItemClick($event)"
  (opened)="onOpened()"
  (closed)="onClosed()">
</os-sidebar>

// Programmatic control
@ViewChild(SidebarComponent) sidebar!: SidebarComponent;

sidebar.open();      // Open
sidebar.close();     // Close  
sidebar.toggle();    // Toggle
sidebar.collapse();  // Collapse to narrow
sidebar.expand();    // Expand from narrow
```

## 🎨 Custom Content

```html
<os-sidebar [config]="config" [data]="data">
  <!-- Custom footer content -->
  <div slot="footer" class="user-info">
    <img [src]="user.avatar" [alt]="user.name">
    <div>{{ user.name }}</div>
    <div>{{ user.email }}</div>
  </div>
</os-sidebar>
```

## 🚀 Migration from CoreUI

### Before
```html
<c-sidebar>
  <c-sidebar-nav [navItems]="items"></c-sidebar-nav>
</c-sidebar>
```

### After  
```html
<os-sidebar [data]="{ sections: [{ items }] }"></os-sidebar>
```

## 📚 Documentation

- **Complete Guide**: `.context/SIDEBAR_DOCUMENTATION.md` - Full API reference, examples, and advanced patterns
- **Quick Reference**: `.context/SIDEBAR_QUICK_REFERENCE.md` - Essential patterns and common usage

## ✅ Status: Production Ready

- Build: ✅ SUCCESS
- TypeScript: ✅ SUCCESS  
- Tests: ✅ PASSING
- Accessibility: ✅ WCAG Compliant
- Browser Support: ✅ Modern browsers