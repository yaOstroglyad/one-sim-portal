# CLAUDE.md - Spec-Kit Integration

> **Last Updated:** 2025-12-03
> **Documentation System:** Spec-Kit (Spec-Driven Development)

---

## 🚀 Session Start

**Before starting any task, read:**
```
.specify/memory/project-map.md
```
This gives you complete project knowledge without iterative exploration.

---

## 🚨 CRITICAL RULES (Quick Reference)

### 0. Spec-Kit Workflow for New Features (MANDATORY)
**Before starting ANY new feature (more than a single line change):**

1. **ASK FIRST**: "Это большой фитчер или я могу начать делать сразу?"
2. **If big feature** → Follow FULL Spec-Kit workflow:
   - `/speckit.specify` → Create spec.md
   - `/speckit.clarify` → Resolve ambiguities (if needed)
   - `/speckit.plan` → Create plan.md
   - `/speckit.tasks` → Generate tasks.md
   - `/speckit.implement` → Execute tasks

**NEVER skip straight to implementation for features involving:**
- Multiple files
- New API integrations
- New components/services
- Architecture changes

### 1. Absolute Paths ONLY
```
❌ WRONG: ../../../../path/to/file
✅ CORRECT: /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/path/to/file
```

### 2. Component Architecture
- **Standalone components only:** `standalone: true`
- **OnPush change detection:** `changeDetection: ChangeDetectionStrategy.OnPush`
- **Use inject():** `private readonly service = inject(MyService);`
- **No HttpClientModule** - HttpClient provided globally

### 3. SCSS
- **Always use @use:** `@use "../../../../scss/variables" as vars;`
- **Use CSS variables:** `var(--os-color-text-primary)` not `#2c2c2c`

### 4. HTTP Errors
- **Use error handlers:** `handleArrayError<T>()`, `handleObjectError<T>()`
- **Import from utils:** `import { ... } from '@shared/utils'`

### 5. Documentation Language
- **English only** for all code, comments, commit messages

📖 **Full rules:** [.specify/memory/constitution.md](./.specify/memory/constitution.md)

---

## 📂 Spec-Kit Structure

```
.specify/
├── memory/
│   ├── constitution.md     # All project rules
│   └── project-map.md      # Project structure & components (READ FIRST)
├── templates/              # Spec-Kit templates
├── scripts/                # Spec-Kit scripts
├── plans/                  # Implementation plans
└── tasks/                  # Task breakdowns

specs/                      # Feature specifications
├── 001-tickets/spec.md
├── 002-product-constructor/spec.md
├── 003-dashboard/spec.md
├── 004-fab-layout/spec.md
└── 005-data-cache/spec.md
```

---

## 🔄 Spec-Kit Commands Cheatsheet

**Copy-paste these commands (no autocomplete available):**

### Core Workflow (in order)
```
/speckit.specify      # 1. Create spec.md from requirements
/speckit.clarify      # 2. (Optional) Clarify ambiguities
/speckit.plan         # 3. Create plan.md with architecture
/speckit.tasks        # 4. Generate tasks.md with task list
/speckit.analyze      # 5. (Optional) Check consistency
/speckit.checklist    # 6. (Optional) Validate requirements
/speckit.implement    # 7. Execute tasks, write code
```

### Auxiliary Commands
```
/speckit.constitution    # View/edit project rules
/speckit.taskstoissues   # Convert tasks to GitHub Issues
```

### Quick Reference
| Step | Command | Creates |
|------|---------|---------|
| 1 | `/speckit.specify` | `spec.md` |
| 2 | `/speckit.clarify` | updates `spec.md` |
| 3 | `/speckit.plan` | `plan.md` |
| 4 | `/speckit.tasks` | `tasks.md` |
| 5 | `/speckit.analyze` | report (stdout) |
| 6 | `/speckit.checklist` | `checklists/*.md` |
| 7 | `/speckit.implement` | code files |

> **Note:** Claude will remind you of the next command during development.

---

## 📋 Available Specifications

| Feature | Spec File | Status |
|---------|-----------|--------|
| **Tickets** | [specs/001-tickets/spec.md](./specs/001-tickets/spec.md) | Implemented |
| **Product Constructor** | [specs/002-product-constructor/spec.md](./specs/002-product-constructor/spec.md) | Implemented |
| **Dashboard** | [specs/003-dashboard/spec.md](./specs/003-dashboard/spec.md) | Implemented |
| **FAB Layout** | [specs/004-fab-layout/spec.md](./specs/004-fab-layout/spec.md) | Implemented |
| **CacheHub** | [specs/005-data-cache/spec.md](./specs/005-data-cache/spec.md) | Implemented |

---

## 💻 Templates

| Template | Purpose |
|----------|---------|
| [component.template.ts](./.claude/templates/component.template.ts) | New component scaffold |
| [service.template.ts](./.claude/templates/service.template.ts) | New service scaffold |
| [model.template.ts](./.claude/templates/model.template.ts) | New model/interface scaffold |

---

## 📚 Additional Documentation (`docs/`)

| Category | Location | Content |
|----------|----------|---------|
| **Component Guides** | `docs/components/` | GenericTable, AccountSelector, EmailLogs |
| **Architecture** | `docs/architecture/` | Mock Server, Table Menu decisions |
| **Optimizations** | `docs/optimizations/` | Form Generator hints |

---

## 📊 Project Info

**Framework:** Angular 21.0.5 (standalone components)

**Key Libraries:**
- CoreUI + Angular Material (UI)
- Chart.js (analytics)
- @ngx-translate (i18n: en, he, ru, uk)
- RxJS (reactive programming)

**Root Directory:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

**Dev Server:** `npm start` (http://localhost:4200)

**API Proxy:** All `/api/*` → `https://esim-server.dev.global-sim.app`

---

## 🛠️ Maintaining Documentation

**Adding new feature?**
1. Create spec: `/speckit.specify`
2. Generate plan: `/speckit.plan`

**Updating rules?**
- Edit [.specify/memory/constitution.md](./.specify/memory/constitution.md)

**Updating project map?**
- Edit [.specify/memory/project-map.md](./.specify/memory/project-map.md)

---

**Documentation System Version:** 4.1 (Spec-Kit)
**Last Major Update:** 2025-12-03 (Migrated to Spec-Kit format)

## Active Technologies
- TypeScript 5.9, Angular 21.0.5 + Angular HttpClient, RxJS, Chart.js, CoreUI, Angular Material (010-subscribers-api)
- N/A (read-only API integration) (010-subscribers-api)
- TypeScript 5.9, Angular 21.0.5 + Chart.js (existing), @angular/core, RxJS (012-waterfall-chart)
- N/A (visualization component only) (012-waterfall-chart)
- TypeScript 5.9, Angular 21.0.5 + Angular Core, Angular Material, CoreUI, RxJS, Chart.js (014-zoneless)
- N/A (frontend-only change) (014-zoneless)

## Recent Changes
- 013-angular-21-upgrade: Upgraded Angular 19.2.15 → 21.0.5, TypeScript 5.8 → 5.9, removed @angular/flex-layout
- 010-subscribers-api: Added TypeScript 5.9, Angular 21.0.5 + Angular HttpClient, RxJS, Chart.js, CoreUI, Angular Material
