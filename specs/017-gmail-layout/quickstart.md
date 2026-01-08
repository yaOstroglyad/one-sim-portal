# Quickstart: Gmail-Style Layout Redesign

**Feature**: 017-gmail-layout
**Date**: 2025-12-28

## Prerequisites

- Node.js (as specified in `.nvmrc`)
- npm packages installed (`npm install`)
- Development server running (`npm start`)

## Files to Modify

### Primary (Layout Structure)

| File | Changes |
|------|---------|
| `src/app/containers/default-layout/default-layout.component.scss` | Content wrapper with sidebar background, content border-radius |
| `src/app/containers/default-layout/default-layout.component.html` | Move breadcrumb to content area |
| `src/app/containers/default-layout/components/header/header.component.scss` | Full-width positioning |
| `src/app/containers/default-layout/components/header/header.component.html` | Add search bar, dropdown button |
| `src/app/containers/default-layout/components/sidebar/sidebar.component.scss` | Top offset, height calculation |

### Secondary (Minor Adjustments)

| File | Changes |
|------|---------|
| `src/scss/_variables.scss` | Add layout constants if needed |

## Quick Reference

### Header Structure (Target)

```html
<header class="header">
  <div class="header__left">
    <button class="header__dropdown-btn" disabled>
      <!-- Dropdown icon -->
    </button>
  </div>

  <div class="header__center">
    <div class="header__search">
      <input type="text" placeholder="Search..." />
    </div>
  </div>

  <div class="header__right">
    <!-- Existing user menu -->
  </div>
</header>
```

### Sidebar CSS Changes

```scss
.sidebar {
  position: fixed;
  top: 64px;  // Changed from 0
  left: 0;
  width: 256px;
  height: calc(100vh - 64px);  // Changed from 100vh
  z-index: 1000;
}
```

### Content CSS Changes

```scss
.layout__main {
  background: var(--os-color-dark);  // Sidebar background extends
  padding-top: 64px;
  min-height: 100vh;
}

.layout__content {
  background: var(--os-color-light);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  min-height: calc(100vh - 64px);
}
```

### Header CSS Changes

```scss
.header {
  position: fixed;
  top: 0;
  left: 0;   // Changed from 256px
  right: 0;  // Full width
  height: 64px;
  z-index: 1001;  // Above sidebar
}
```

## Testing Checklist

After each change, verify:

1. **Desktop (>768px)**
   - [ ] Header spans full width
   - [ ] Sidebar below header
   - [ ] Content has rounded corners
   - [ ] Sidebar collapse/expand works
   - [ ] Hover expand works

2. **Mobile (<768px)**
   - [ ] Header full width
   - [ ] Sidebar hidden by default
   - [ ] Toggle button visible and enlarged
   - [ ] Sidebar slides in/out
   - [ ] Overlay appears behind sidebar

3. **RTL (Hebrew)**
   - [ ] Sidebar on right side
   - [ ] Content on left side
   - [ ] Animations mirror correctly

## Development Workflow

```bash
# Start dev server
npm start

# Open browser
open http://localhost:4200

# Test RTL by switching to Hebrew in user menu
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Header overlaps sidebar | Check z-index: header should be 1001, sidebar 1000 |
| Content doesn't have radius | Ensure wrapper has sidebar background color |
| Mobile toggle not working | Verify toggle button is not hidden by overflow |
| RTL not mirroring | Check [dir="rtl"] selectors in SCSS |
