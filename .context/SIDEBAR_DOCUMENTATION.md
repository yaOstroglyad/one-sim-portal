# Sidebar Component - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [API Reference](#api-reference)
4. [Features](#features)
5. [Theme Support](#theme-support)
6. [RTL Support](#rtl-support)
7. [Examples](#examples)
8. [Migration Guide](#migration-guide)

---

## Overview

**Production-ready standalone Angular sidebar component** based on Tailwind Catalyst design patterns with comprehensive feature set.

### ✅ Status: Production Ready
- ✅ Standalone Angular component (no module required)
- ✅ TypeScript compilation: SUCCESS
- ✅ Build status: SUCCESS
- ✅ Full feature implementation complete

### 🎯 Key Features
- **Standalone Component**: Direct import, no modules
- **Responsive Design**: Mobile/tablet/desktop optimized
- **Dark/Light Themes**: Full theme support with auto-detection
- **RTL Support**: Complete right-to-left language support
- **Touch Gestures**: Swipe to open/close on mobile
- **Accessibility**: WCAG compliant with full ARIA support
- **Router Integration**: Automatic active state management
- **Type Safety**: Full TypeScript interfaces
- **Performance**: OnPush change detection

---

## Quick Start

### Installation
```typescript
// Direct import (no module needed)
import { SidebarComponent } from './shared/components/sidebar';

@Component({
  standalone: true,
  imports: [SidebarComponent],
  template: `
    <os-sidebar 
      [config]="sidebarConfig"
      [data]="sidebarData">
    </os-sidebar>
  `
})
export class MyComponent {
  sidebarConfig: SidebarConfig = {
    theme: 'auto',
    position: 'left',
    responsive: true
  };

  sidebarData: SidebarData = {
    header: { title: 'My App', logoUrl: '/logo.png' },
    sections: [{
      id: 'nav',
      items: [{
        id: 'dashboard',
        label: 'Dashboard',
        routerLink: '/dashboard',
        badge: { text: '5', variant: 'primary' }
      }]
    }]
  };
}
```

---

## API Reference

### SidebarConfig Interface
```typescript
interface SidebarConfig {
  variant?: 'default' | 'compact' | 'minimal' | 'floating';
  position?: 'left' | 'right';
  theme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
  rtl?: boolean;
  showBackdrop?: boolean;
  backdropCloseable?: boolean;
  initialState?: 'open' | 'closed' | 'collapsed';
  expandedWidth?: string;
  collapsedWidth?: string;
  breakpoint?: string;
}
```

### SidebarData Interface
```typescript
interface SidebarData {
  header?: {
    title?: string;
    showTitle?: boolean;
    logoUrl?: string;
    logoAlt?: string;
  };
  sections: SidebarSection[];
  footer?: {
    actions?: SidebarAction[];
  };
}

interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  routerLink?: string | string[];
  badge?: SidebarBadge;
  active?: boolean;
  disabled?: boolean;
  children?: SidebarItem[];
  permissions?: string[];
  onClick?: (item: SidebarItem) => void;
}

interface SidebarBadge {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  style?: 'default' | 'outline' | 'subtle';
}
```

### Component Events
```typescript
@Output() stateChanged = new EventEmitter<SidebarState>();
@Output() itemClicked = new EventEmitter<SidebarItem>();
@Output() opened = new EventEmitter<void>();
@Output() closed = new EventEmitter<void>();
```

### Public Methods
```typescript
// Programmatic control
sidebar.open();        // Open sidebar
sidebar.close();       // Close sidebar
sidebar.toggle();      // Toggle state
sidebar.collapse();    // Collapse to narrow
sidebar.expand();      // Expand from narrow
```

---

## Features

### 1. Responsive Design
- **Mobile**: Full-screen overlay with backdrop
- **Tablet**: Collapsible with gesture support
- **Desktop**: Fixed/floating sidebar with toggle

### 2. Navigation
- **Multi-level**: Nested navigation with expand/collapse
- **Active States**: Automatic router-based active detection
- **Badges**: Color-coded notification badges
- **Icons**: SVG icon support with accessibility
- **Permissions**: Role-based navigation filtering

### 3. User Experience
- **Touch Gestures**: Swipe to open/close on mobile
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus trapping
- **Smooth Animations**: CSS transitions with reduced-motion support

### 4. Customization
- **Content Projection**: Custom footer content via `<ng-content>`
- **CSS Variables**: Full theming through design system
- **Custom Classes**: Additional styling support
- **Variants**: Multiple visual styles

---

## Theme Support

### Automatic Theme Detection
```typescript
// Follows system preference (default)
const config: SidebarConfig = { theme: 'auto' };
```

### Manual Theme Control
```typescript
// Force specific theme
const config: SidebarConfig = { theme: 'dark' }; // or 'light'
```

### CSS Class Integration
```html
<!-- Via CSS classes -->
<div class="dark">
  <os-sidebar [config]="config" [data]="data"></os-sidebar>
</div>

<!-- Via data attributes -->
<div data-theme="dark">
  <os-sidebar [config]="config" [data]="data"></os-sidebar>
</div>
```

### Theme Service Integration
```typescript
@Component({...})
export class AppComponent {
  constructor(private themeService: ThemeService) {
    this.themeService.theme$.subscribe(theme => {
      this.sidebarConfig = { ...this.sidebarConfig, theme };
    });
  }
}
```

### Dark Theme Features
- ✅ Complete visual adaptation for dark backgrounds
- ✅ Proper contrast ratios (WCAG compliant)
- ✅ All interactive states adapted
- ✅ Badge colors optimized for dark theme
- ✅ Icons and borders adjusted

---

## RTL Support

### Automatic RTL Detection
```typescript
// Detect from document direction
const isRTL = document.dir === 'rtl';
const config: SidebarConfig = { rtl: isRTL };
```

### Language Integration
```typescript
// Integration with translation service
this.translateService.onLangChange.subscribe(event => {
  const rtlLanguages = ['ar', 'he', 'ur', 'fa'];
  this.sidebarConfig = {
    ...this.sidebarConfig,
    rtl: rtlLanguages.includes(event.lang)
  };
});
```

### RTL Features
- ✅ **Layout Mirroring**: Automatic left/right position swapping
- ✅ **Text Alignment**: Right-aligned text for RTL languages
- ✅ **Icon Positioning**: Icons move to appropriate side
- ✅ **Active Indicators**: Border indicators on correct side
- ✅ **Expand Arrows**: Rotated for RTL direction
- ✅ **Touch Gestures**: Swipe directions reversed
- ✅ **Nested Navigation**: Proper RTL indentation

### Supported RTL Languages
- Arabic (العربية)
- Hebrew (עברית)
- Urdu (اردو)
- Persian (فارسی)
- And other RTL languages

---

## Examples

### Basic Sidebar
```typescript
@Component({
  template: `<os-sidebar [config]="config" [data]="data"></os-sidebar>`
})
export class BasicExample {
  config: SidebarConfig = { position: 'left' };
  data: SidebarData = {
    sections: [{
      id: 'main',
      items: [
        { id: 'home', label: 'Home', routerLink: '/' },
        { id: 'about', label: 'About', routerLink: '/about' }
      ]
    }]
  };
}
```

### Advanced Sidebar with Features
```typescript
@Component({
  template: `
    <os-sidebar 
      [config]="config" 
      [data]="data"
      (itemClicked)="onItemClick($event)"
      (stateChanged)="onStateChange($event)">
      
      <!-- Custom footer content -->
      <div slot="footer" class="user-profile">
        <img [src]="user.avatar" [alt]="user.name">
        <div>{{ user.name }}</div>
        <div>{{ user.email }}</div>
      </div>
    </os-sidebar>
  `
})
export class AdvancedExample {
  config: SidebarConfig = {
    variant: 'default',
    position: 'left',
    theme: 'auto',
    responsive: true,
    rtl: false,
    initialState: 'open'
  };
  
  data: SidebarData = {
    header: {
      title: 'My Application',
      logoUrl: '/assets/logo.png',
      showTitle: true
    },
    sections: [
      {
        id: 'navigation',
        title: 'Main Navigation',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'dashboard',
            routerLink: '/dashboard',
            badge: { text: '5', variant: 'primary' }
          },
          {
            id: 'users',
            label: 'Users',
            icon: 'people',
            permissions: ['USERS_VIEW'],
            children: [
              { id: 'user-list', label: 'All Users', routerLink: '/users' },
              { id: 'user-create', label: 'Add User', routerLink: '/users/new' }
            ]
          }
        ]
      }
    ],
    footer: {
      actions: [
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          onClick: () => this.openSettings()
        },
        {
          id: 'logout',
          label: 'Logout',
          icon: 'logout',
          onClick: () => this.logout()
        }
      ]
    }
  };
  
  onItemClick(item: SidebarItem) {
    console.log('Clicked:', item.label);
  }
  
  onStateChange(state: SidebarState) {
    console.log('State changed:', state);
  }
}
```

### Theme Toggle Example
```typescript
@Component({
  template: `
    <os-sidebar [config]="sidebarConfig" [data]="sidebarData"></os-sidebar>
    <button (click)="toggleTheme()">
      {{ isDark ? '🌙 Dark' : '☀️ Light' }}
    </button>
  `
})
export class ThemeToggleExample {
  isDark = false;
  
  sidebarConfig: SidebarConfig = {
    theme: 'light',
    position: 'left'
  };
  
  toggleTheme() {
    this.isDark = !this.isDark;
    this.sidebarConfig = {
      ...this.sidebarConfig,
      theme: this.isDark ? 'dark' : 'light'
    };
  }
}
```

### RTL Example
```typescript
@Component({
  template: `
    <os-sidebar [config]="sidebarConfig" [data]="sidebarData"></os-sidebar>
    <button (click)="toggleRTL()">
      Toggle RTL: {{ isRTL ? 'RTL' : 'LTR' }}
    </button>
  `
})
export class RTLExample {
  isRTL = false;
  
  sidebarConfig: SidebarConfig = {
    rtl: false,
    position: 'left'
  };
  
  toggleRTL() {
    this.isRTL = !this.isRTL;
    this.sidebarConfig = {
      ...this.sidebarConfig,
      rtl: this.isRTL
    };
    document.dir = this.isRTL ? 'rtl' : 'ltr';
  }
}
```

---

## Migration Guide

### From CoreUI Sidebar

#### Before (CoreUI)
```html
<c-sidebar>
  <c-sidebar-nav [navItems]="navItems"></c-sidebar-nav>
</c-sidebar>
```

#### After (New Sidebar)
```html
<os-sidebar [data]="{ sections: [{ items: navItems }] }"></os-sidebar>
```

#### Data Structure Migration
```typescript
// OLD: CoreUI navItems format
const navItems = [
  { name: 'Dashboard', url: '/dashboard', icon: 'icon-speedometer' }
];

// NEW: SidebarData format
const sidebarData: SidebarData = {
  sections: [{
    id: 'main',
    items: [
      { id: 'dashboard', label: 'Dashboard', routerLink: '/dashboard', icon: 'speedometer' }
    ]
  }]
};
```

### Breaking Changes
1. **Module Import**: Now standalone component (no module import needed)
2. **Data Structure**: New structured data format
3. **Events**: Updated event names and payloads
4. **Styling**: New CSS class naming convention

### Migration Benefits
- ✅ **Better Performance**: OnPush change detection
- ✅ **Modern Architecture**: Standalone components
- ✅ **Enhanced Features**: Dark theme, RTL, touch gestures
- ✅ **Better Accessibility**: WCAG compliance
- ✅ **Type Safety**: Full TypeScript support

---

## Architecture Integration

### Design System
Uses project's design system variables:
```scss
// Colors
--os-color-primary
--os-color-light
--os-color-dark
--os-color-medium

// Spacing
$os-spacing: (0, 1, 2, 3, 4...)

// Border radius
$os-border-radius: (small, medium, large...)

// Shadows
$os-shadows: (sm, md, lg...)
```

### Bundle Size
- **Optimized**: Tree-shakeable standalone component
- **Minimal**: No unnecessary dependencies
- **Efficient**: CSS-in-JS avoided, uses SCSS

### Browser Support
- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Mobile browsers

---

## Troubleshooting

### Common Issues

**Q: Sidebar not showing/rendering**
A: Ensure component is imported: `imports: [SidebarComponent]`

**Q: Dark theme not working**
A: Check theme configuration and CSS variables are available

**Q: RTL not displaying correctly**
A: Verify `document.dir = 'rtl'` is set and `config.rtl = true`

**Q: Touch gestures not working**
A: Ensure `responsive: true` is set in configuration

**Q: Active states not updating**
A: Check router integration and `routerLink` values match actual routes

---

## Performance

### Optimization Features
- ✅ **OnPush Change Detection**: Minimizes re-renders
- ✅ **CSS Variables**: Efficient theming without style recalculation
- ✅ **Event Delegation**: Optimized event handling
- ✅ **Lazy Loading**: Compatible with lazy-loaded modules
- ✅ **Memory Management**: Proper cleanup in ngOnDestroy

### Best Practices
1. Use `trackBy` functions for large navigation lists
2. Implement virtual scrolling for 100+ items
3. Debounce rapid state changes
4. Use CSS transforms for animations (GPU acceleration)

---

## 🚀 Production Checklist

- ✅ **Functionality**: All features implemented and tested
- ✅ **Accessibility**: WCAG 2.1 AA compliant
- ✅ **Performance**: Optimized for production
- ✅ **Browser Support**: Cross-browser compatible
- ✅ **Theme Support**: Light/dark themes complete
- ✅ **RTL Support**: Full right-to-left language support
- ✅ **Mobile Support**: Touch gestures and responsive design
- ✅ **Type Safety**: Complete TypeScript interfaces
- ✅ **Documentation**: Comprehensive guides and examples

**Status: ✅ PRODUCTION READY**