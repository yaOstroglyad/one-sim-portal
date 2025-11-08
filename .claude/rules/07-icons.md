# Icons & SVG Usage Rules

> **Created:** 2025-10-16 | **Last Updated:** 2025-11-15
> **Context Tags:** `@icon` `@styling` `@creating-new`
> **Read when:** Using icons, SVGs, or adding new icons

## CoreUI Icons Integration

### 🎨 ICON STRATEGY: Prefer Custom Icons
> **Created:** 2025-10-16 | **Last Updated:** 2025-10-24 (Added CRITICAL inline SVG rule)

**ALWAYS prefer custom SVG icons over CoreUI icons when possible:**

1. **Custom Icons First** - Create or use existing icons from `src/assets/icons/`
2. **Gradual Migration** - When adding new icons, use custom SVGs instead of CoreUI
3. **Benefits**: Better performance, consistent design, no external dependency

#### Custom Icon Usage:
```typescript
// FAB Configuration with custom icon
{
  id: 'home',
  label: 'Главная',
  icon: '/assets/icons/home.svg',  // ✅ Custom SVG
  action: 'route',
  target: '/home'
}

// Icon Service with custom URL
iconService.getIcon('/assets/icons/home.svg')
```

#### ⚠️ CRITICAL: NEVER Use Inline SVG in HTML

**ALWAYS use the `app-icon` component instead of inline SVG elements!**

**❌ WRONG - Inline SVG:**
```html
<svg viewBox="0 0 200 200" fill="none">
  <circle cx="100" cy="100" r="80"/>
  <!-- ... more SVG code -->
</svg>
```

**✅ CORRECT - app-icon component:**
```html
<!-- 1. Create SVG file in /src/assets/icons/my-icon.svg -->
<!-- 2. Use app-icon component -->
<div class="icon-container">
  <app-icon [icon]="'my-icon'"></app-icon>
</div>
```

**Process for adding new SVG icons:**
1. Check if similar icon already exists in `/src/assets/icons/`
2. If not, create new `.svg` file with descriptive name
3. Use `app-icon` component with the filename (without extension)
4. NEVER paste SVG code directly in HTML templates

**Why?**
- ✅ Icon reusability across the app
- ✅ Centralized icon management
- ✅ Built-in caching via IconService
- ✅ Consistent sizing and styling
- ✅ Smaller bundle size

#### Available Custom Icons:
- `home.svg` - Home/dashboard navigation
- `chat.svg` - Chat/messaging features
- `chat-search.svg` - Chat search state illustration
- `chat-empty.svg` - Chat empty state illustration
- `chat-placeholder.svg` - Chat thread selection placeholder
- `plus.svg` - Add/create actions
- `settings.svg` - Configuration/settings
- `history.svg` - Historical data/logs
- `cart.svg` - Shopping cart/purchases
- `chart-line.svg` - Line chart/analytics
- `chart-line-empty.svg` - Empty line chart state/no data
- `bundles-empty.svg` - Empty bundles/data packages state
- `download.svg` - Download/export actions
- `check-circle.svg` - Success/confirmation states
- `chevron-down.svg` - Dropdown indicators
- `sidebar-toggle-arrows.svg` - Sidebar toggle control
- `no-activities.svg` - No activities state
- `default.svg` - Fallback icon

**Create new custom icons**: Add SVG files to `src/assets/icons/` with descriptive names.

### CRITICAL: How to Properly Use CoreUI Icons (Legacy)

**NEVER use CSS classes like `<i class="icon cil-name">` - this will NOT work!**

#### Correct Icon Implementation:

1. **Use SVG with CoreUI directive**:
   ```html
   <svg cIcon [name]="iconName" width="24" height="24"></svg>
   ```

2. **Required imports in component**:
   ```typescript
   import { IconDirective, IconModule } from '@coreui/icons-angular';

   @Component({
     imports: [IconDirective, IconModule, ...]
   })
   ```

3. **CSS styling for SVG icons**:
   ```scss
   svg {
     width: 1.5rem;
     height: 1.5rem;
     fill: white; // Use 'fill' not 'color' for SVG
   }
   ```

4. **Icon availability**:
   - All icons must be added to `src/app/icons/icon-subset.ts`
   - Import icon from `@coreui/icons`
   - Add to both import list and iconSubset object
   - Icons are loaded globally via IconSetService in app.component.ts

#### Available Icons Pattern:
- Use `cil-` prefix: `cil-location-pin`, `cil-data-transfer-down`
- Check `icon-subset.ts` for available icons before using
- Add new icons to subset if needed

#### Example Usage:
```html
<!-- Correct -->
<svg cIcon name="cil-location-pin" width="20" height="20"></svg>

<!-- Incorrect - will not display -->
<i class="icon cil-location-pin"></i>
```

## Known Issues & Limitations

1. No environment configuration files - API URLs hardcoded
2. Permissions hardcoded in AuthService instead of backend-driven
3. No linting configuration - relies on Angular CLI defaults
4. Limited test coverage - most spec files only check component creation
5. No centralized error handling beyond HTTP interceptor

## Docker & Deployment

The application includes a multi-stage Dockerfile:
- Build stage: Node 16 Alpine with Angular CLI
- Runtime stage: Nginx Alpine
- Nginx configuration in `default.conf`

