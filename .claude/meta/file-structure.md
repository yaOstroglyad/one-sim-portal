# Documentation File Structure

> **Last Updated:** 2025-11-15
> **Purpose:** Explain the organization and purpose of each documentation file

## 📁 Directory Structure

```
/CLAUDE.md                              # Main navigation hub (400-500 lines)
/.claude/
  ├── meta/                             # Documentation about documentation
  │   ├── CONTRIBUTING.md               # How to maintain rules (THIS IS KEY!)
  │   ├── file-structure.md             # This file - explains organization
  │   ├── context-tags-guide.md         # How to use context tags
  │   └── version-history.md            # Change log
  │
  ├── rules/                            # Detailed rules (load on demand)
  │   ├── 01-CRITICAL.md                # Project-breaking rules
  │   ├── 02-http-errors.md             # HTTP error handling
  │   ├── 03-models.md                  # Models organization
  │   ├── 04-services.md                # Services organization
  │   ├── 05-utils.md                   # Utilities organization
  │   ├── 06-scss.md                    # SCSS architecture
  │   └── 07-icons.md                   # Icon usage rules
  │
  ├── context/                          # Project inventory & patterns
  │   ├── reusable-components.md        # What components exist
  │   ├── common-patterns.md            # Established patterns
  │   ├── similar-features.md           # Examples of similar code
  │   └── architecture-map.md           # High-level architecture
  │
  ├── guides/                           # Step-by-step how-tos
  │   ├── creating-component.md         # Component creation workflow
  │   ├── creating-service.md           # Service creation workflow
  │   ├── http-integration.md           # Adding HTTP endpoints
  │   └── styling-guide.md              # Styling workflow
  │
  └── templates/                        # Code templates
      ├── component.template.ts         # Component boilerplate
      ├── service.template.ts           # Service boilerplate
      └── model.template.ts             # Model boilerplate
```

## 📄 File Purposes

### `/CLAUDE.md` - Main Navigation Hub

**Purpose:** Entry point for all documentation. Always read first.

**Contents:**
- 🚨 Critical rules (inline) - Always visible
- 🏷️ Context-based navigation with tags
- 📋 Quick reference tables
- 📚 Index of detailed rules

**Size:** 400-500 lines (< 6000 tokens)

**When to read:** Every time Claude starts working

**When to update:**
- New rule category added
- New context tag created
- Navigation paths change

---

### `.claude/meta/` - Documentation System Documentation

#### `CONTRIBUTING.md`
**The most important meta-file!**

**Purpose:** How to add/update/maintain all documentation

**Read when:**
- Adding new rules
- Updating existing rules
- Creating new categories
- Unsure where something belongs

**Update when:**
- Documentation system structure changes
- New process added
- Maintenance schedules change

#### `file-structure.md` (this file)
**Purpose:** Explain what each file is for

**Read when:**
- Learning the documentation system
- Deciding where to add content

**Update when:**
- New files/directories added
- File purposes change

#### `context-tags-guide.md`
**Purpose:** Deep dive into context tag system

**Read when:**
- Creating new context tags
- Understanding tag usage
- Mapping scenarios to tags

**Update when:**
- New tags added
- Tag definitions change
- New usage patterns emerge

#### `version-history.md`
**Purpose:** Track all significant changes to documentation

**Read when:**
- Understanding recent changes
- Checking breaking changes

**Update when:**
- Any significant rule change
- New files added
- Structure modified

---

### `.claude/rules/` - Detailed Rule Files

**Purpose:** Complete, detailed rules for specific topics

**Naming:** `NN-category-name.md` (number indicates priority)

**Size:** 300-600 lines per file

**Load strategy:** On-demand when tag matches

#### `01-CRITICAL.md`
**Rules that break the project if violated**
- Absolute paths
- Component architecture (standalone, OnPush, inject())
- Angular 19 requirements

**Context tags:** `@creating-new` `@component` `@critical`

**Read when:** Before creating any component

#### `02-http-errors.md`
**HTTP error handling patterns**
- Error handlers (`handleArrayError`, `handleObjectError`)
- forkJoin patterns
- Auth error handling

**Context tags:** `@http` `@extending` `@fixing-bug`

**Read when:** Working with HTTP calls or fixing HTTP errors

#### `03-models.md`
**TypeScript models/interfaces organization**
- Where to create models
- Naming conventions
- Category organization (/auth, /business, /ui, etc.)

**Context tags:** `@creating-new` `@model`

**Read when:** Creating new interfaces or types

#### `04-services.md`
**Service organization and patterns**
- Where to create services (/data, /ui, /core)
- Service patterns
- Barrel exports

**Context tags:** `@creating-new` `@service`

**Read when:** Creating or organizing services

#### `05-utils.md`
**Utility function organization**
- Where to create utils (/color, /data, /http, etc.)
- Searching before creating
- Reuse patterns

**Context tags:** `@creating-new` `@utils`

**Read when:** Creating utility functions

#### `06-scss.md`
**SCSS architecture and styling**
- @use vs @import
- CSS variables
- Mixins and utilities
- Color system

**Context tags:** `@styling` `@creating-new`

**Read when:** Writing styles or using SCSS

#### `07-icons.md`
**Icon and SVG usage**
- Custom icons vs CoreUI
- app-icon component
- Icon locations

**Context tags:** `@styling` `@component`

**Read when:** Using or adding icons

---

### `.claude/context/` - Project Inventory & Patterns

**Purpose:** Answer "What already exists?" and "How is it done here?"

**Update frequency:** Weekly (as new code added)

#### `reusable-components.md`
**Inventory of all reusable components**
- Generic components
- Available SCSS mixins
- UI elements

**Context tags:** `@creating-new` `@learn-project` `@component`

**Read when:** Before creating a component

**Update when:** New reusable component added

#### `common-patterns.md`
**Established patterns in the project**
- Data service patterns
- Form patterns
- State management patterns

**Context tags:** `@learn-patterns` `@extending`

**Read when:** Looking for how we do X in this project

**Update when:** New pattern established

#### `similar-features.md`
**Examples of similar implementations**
- "Show me how customer list works, I'm building order list"
- Links to actual code examples
- Pattern explanations

**Context tags:** `@learn-patterns` `@extending`

**Read when:** Building something similar to existing feature

**Update when:** New feature added that could serve as example

#### `architecture-map.md`
**High-level architecture overview**
- Module structure
- Routing structure
- Key services
- Data flow

**Context tags:** `@learn-project`

**Read when:** Learning the project structure

**Update when:** Major architectural changes

---

### `.claude/guides/` - Step-by-Step Workflows

**Purpose:** Procedural guides for common tasks

**Format:** Step-by-step instructions with examples

#### `creating-component.md`
**Complete workflow for creating a component**

**Steps covered:**
1. Check if component exists
2. Choose location
3. Apply architecture rules
4. Create files
5. Add to module/exports

**Context tags:** `@creating-new` `@component`

**Read when:** Creating a new component from scratch

#### `creating-service.md`
**Complete workflow for creating a service**

**Steps covered:**
1. Check if service exists
2. Choose category (data/ui/core)
3. Apply patterns
4. Error handling
5. Caching (if applicable)

**Context tags:** `@creating-new` `@service`

**Read when:** Creating a new service from scratch

#### `http-integration.md`
**How to add HTTP endpoints to existing code**

**Steps covered:**
1. Identify service
2. Add method
3. Error handling
4. Caching strategy
5. Testing

**Context tags:** `@extending` `@http`

**Read when:** Adding HTTP functionality

#### `styling-guide.md`
**How to style components properly**

**Steps covered:**
1. Check existing mixins
2. Use CSS variables
3. Apply @use pattern
4. Dark theme support

**Context tags:** `@styling` `@learn-patterns`

**Read when:** Styling a component

---

### `.claude/templates/` - Code Boilerplate

**Purpose:** Copy-paste starting points for common files

#### `component.template.ts`
```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss'
})
export class ExampleComponent {
  // Inject dependencies
  private readonly cdr = inject(ChangeDetectorRef);
}
```

#### `service.template.ts`
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ExampleDataService {
  private readonly http = inject(HttpClient);
  private readonly cacheHub = inject(CacheHubService);
}
```

#### `model.template.ts`
```typescript
/**
 * [Description]
 *
 * @example
 * ```typescript
 * const example: ExampleModel = {
 *   // ...
 * };
 * ```
 */
export interface ExampleModel {
  id: string;
  name: string;
}
```

---

## 🔄 Information Flow

### Scenario 1: Creating New Component

```
Developer: "I need a new dashboard card component"
           ↓
CLAUDE.md: 🏷️ Tags → @creating-new + @component
           ↓
Read order:
1. CLAUDE.md (critical rules inline)
2. .claude/context/reusable-components.md (check what exists)
3. .claude/rules/01-CRITICAL.md (component rules)
4. .claude/guides/creating-component.md (step-by-step)
5. .claude/templates/component.template.ts (boilerplate)
```

### Scenario 2: Fixing HTTP Error

```
Developer: "HTTP errors not showing correctly"
           ↓
CLAUDE.md: 🏷️ Tags → @fixing-bug + @http
           ↓
Read order:
1. CLAUDE.md (quick ref)
2. .claude/rules/02-http-errors.md (error handling rules)
3. .claude/context/similar-features.md#http (examples)
```

### Scenario 3: Learning Project

```
Developer: "What reusable components exist?"
           ↓
CLAUDE.md: 🏷️ Tags → @learn-project + @component
           ↓
Read order:
1. .claude/context/reusable-components.md (full inventory)
2. .claude/context/architecture-map.md (how things connect)
```

---

## 📊 Token Optimization Strategy

### Always Loaded (Unavoidable)
- `CLAUDE.md` - ~5000 tokens
- **Total:** ~5000 tokens

### Loaded on Demand (Context-driven)
- Rule files: ~3000-7000 tokens each (only load 1-2 per task)
- Context files: ~2000-4000 tokens each (only load when needed)
- Guides: ~3000-5000 tokens each (only when following workflow)

### Example Token Usage

**Typical task (create component):**
- CLAUDE.md: 5000 tokens
- 01-CRITICAL.md: 3000 tokens
- reusable-components.md: 3000 tokens
- **Total: ~11,000 tokens** (vs 26,865 tokens for monolithic file)
- **Savings: 58%**

**Quick fix (HTTP error):**
- CLAUDE.md: 5000 tokens
- 02-http-errors.md: 7000 tokens
- **Total: ~12,000 tokens**
- **Savings: 55%**

---

## 🎯 Design Principles

### 1. Context-Aware Loading
Only load what's needed for the current task via tags

### 2. Single Source of Truth
Each piece of information in exactly one place

### 3. Clear Navigation
Tags + tables make it obvious what to read

### 4. Maintenance-Friendly
CONTRIBUTING.md explains everything needed to maintain

### 5. Scalable
Easy to add new categories without restructuring

---

## 🔍 Quick Reference: "Where Does This Go?"

| Content Type | Location | Example |
|--------------|----------|---------|
| Critical project rule | `.claude/rules/01-CRITICAL.md` | "Use standalone components" |
| HTTP error pattern | `.claude/rules/02-http-errors.md` | "Use handleArrayError" |
| Model organization | `.claude/rules/03-models.md` | "Models in /shared/models/" |
| Service organization | `.claude/rules/04-services.md` | "Services in /data, /ui, /core" |
| SCSS rule | `.claude/rules/06-scss.md` | "Use @use, not @import" |
| List of components | `.claude/context/reusable-components.md` | "GenericTableComponent" |
| Code pattern | `.claude/context/common-patterns.md` | "Data service pattern" |
| Example implementation | `.claude/context/similar-features.md` | "See customer list for example" |
| Step-by-step workflow | `.claude/guides/` | "How to create component" |
| Code template | `.claude/templates/` | Component boilerplate |
| How to maintain docs | `.claude/meta/CONTRIBUTING.md` | "How to add rules" |

---

## 📝 Maintenance

**Update this file when:**
- New directory added
- File purposes change
- New file type added
- Token optimization strategy changes

**Owned by:** Development team
**Review schedule:** Quarterly
