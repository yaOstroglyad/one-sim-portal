# Shared Directives

This directory contains reusable Angular directives organized by type.

## Directory Structure

```
directives/
├── attribute/           # Attribute Directives
│   └── copy-to-clipboard/
├── structural/          # Structural Directives
│   ├── feature-toggle/
│   └── has-permission/
└── index.ts            # Barrel export
```

## Directive Types

### Attribute Directives
Modify element behavior or appearance. Used with `[directiveName]` syntax.

**Available:**
- **`copyToClipboard`** - Copy element text to clipboard on click
  ```html
  <span copyToClipboard>Click to copy this text</span>
  ```

### Structural Directives
Conditionally add or remove elements from DOM. Used with `*directiveName` syntax.

**Available:**
- **`featureToggle`** - Show/hide elements based on feature flags
  ```html
  <div *featureToggle="'new-feature'">New feature content</div>
  ```

- **`appHasPermission`** - Show/hide elements based on user permissions
  ```html
  <button *appHasPermission="['admin', 'editor']">Admin Action</button>
  ```

## Usage

Import directives from `@shared` or `@shared/directives`:

```typescript
import { CopyToClipboardDirective, FeatureToggleDirective, HasPermissionDirective } from '@shared';
// or
import { CopyToClipboardDirective } from '@shared/directives';
```

## Adding New Directives

1. **Determine directive type:**
   - Attribute directive → Place in `attribute/`
   - Structural directive → Place in `structural/`

2. **Create directory structure:**
   ```bash
   mkdir -p attribute/my-directive
   # or
   mkdir -p structural/my-directive
   ```

3. **Create directive file:**
   ```
   attribute/my-directive/
   ├── my-directive.directive.ts
   └── my-directive.directive.spec.ts
   ```

4. **Export from index.ts:**
   ```typescript
   export * from './attribute/my-directive/my-directive.directive';
   ```

5. **Use in components:**
   ```typescript
   import { MyDirective } from '@shared';

   @Component({
     imports: [MyDirective]
   })
   ```

## Testing

Run directive tests:
```bash
npm test -- --include='**/*.directive.spec.ts'
```
