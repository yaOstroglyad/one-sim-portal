---
name: document-component
description: Documents an Angular component in docs/components/. Use when asked to document a component, add documentation, create docs for component, or write component documentation.
allowed-tools: Write, Read, Glob, Grep, Edit
---

# Document Angular Component

Create comprehensive documentation for an Angular component.

> **Rules Reference:** Documentation language rules in `constitution.md` Section IX.
> This skill provides the **procedure** and **template** for documenting components.

## Procedure

1. **Read the component source files**:
   - `.component.ts` — inputs, outputs, methods
   - `.component.html` — template structure
   - `.component.scss` — styling approach
2. **Extract API information** (inputs, outputs, public methods)
3. **Find usage examples** in the codebase
4. **Create documentation** using template below
5. **Save to** `docs/components/{component-name}.md`

## Documentation Template

```markdown
# {Component Name}

> **Status:** Active
> **Last Updated:** {YYYY-MM-DD}
> **Location:** `{path/to/component}/`

## Overview

{Brief description of what the component does and when to use it}

## File Structure

```
{component-name}/
├── {component-name}.component.ts
├── {component-name}.component.html
├── {component-name}.component.scss
└── models/ (if exists)
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `inputName` | `Type` | `default` | Description |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `outputName` | `Type` | Description |

## Usage

### Basic Example

```typescript
@Component({...})
export class ParentComponent {
  // Setup code
}
```

```html
<os-component-name [input]="value" (output)="handler($event)">
</os-component-name>
```

## Related Components

- [RelatedComponent](./related-component.md)
```

## Output Location

All component documentation: `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/docs/components/`

## Existing Documentation

Reference these for format consistency:
- `generic-table.md`
- `bar-chart.md`
- `account-selector.md`
