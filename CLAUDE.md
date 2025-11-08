# CLAUDE.md - Smart Context Navigation

> **Last Updated:** 2025-11-15
> **Documentation System:** Modular, context-aware, token-optimized
> **Quick Start:** Read critical rules below, then use tags to find what you need

---

## 🚨 CRITICAL RULES (Always Apply)

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

📖 **Full details:** [.claude/rules/01-CRITICAL.md](./.claude/rules/01-CRITICAL.md)

---

## 🏷️ Find What You Need by Context

### 🆕 Creating Something New (`@creating-new`)

**"I need to create a new component"** → `@creating-new + @component`
- 📖 Check inventory: [.claude/context/reusable-components.md](./.claude/context/reusable-components.md)
- 📖 Read rules: [.claude/rules/01-CRITICAL.md](./.claude/rules/01-CRITICAL.md)
- 📖 Step-by-step: [.claude/guides/creating-component.md](./.claude/guides/creating-component.md)
- 💻 Template: [.claude/templates/component.template.ts](./.claude/templates/component.template.ts)

**"I need to create a new service"** → `@creating-new + @service`
- 📖 Check existing: [.claude/rules/04-services.md](./.claude/rules/04-services.md)
- 📖 Patterns: [.claude/context/common-patterns.md](./.claude/context/common-patterns.md#data-service-pattern)
- 📖 Step-by-step: [.claude/guides/creating-service.md](./.claude/guides/creating-service.md)
- 💻 Template: [.claude/templates/service.template.ts](./.claude/templates/service.template.ts)

**"I need to create a new model/interface"** → `@creating-new + @model`
- 📖 Check existing: [.claude/rules/03-models.md](./.claude/rules/03-models.md)
- 💻 Template: [.claude/templates/model.template.ts](./.claude/templates/model.template.ts)

**"I need to create a utility function"** → `@creating-new + @utils`
- 📖 Check existing: [.claude/rules/05-utils.md](./.claude/rules/05-utils.md)

**"I need to style a component"** → `@creating-new + @styling`
- 📖 SCSS rules: [.claude/rules/06-scss.md](./.claude/rules/06-scss.md)
- 📖 Available mixins: [.claude/context/reusable-components.md](./.claude/context/reusable-components.md#available-scss-mixins)
- 📖 Guide: [.claude/guides/styling-guide.md](./.claude/guides/styling-guide.md)

---

### 🔧 Extending Existing Code (`@extending`)

**"Adding HTTP endpoint to service"** → `@extending + @http`
- 📖 Error handling: [.claude/rules/02-http-errors.md](./.claude/rules/02-http-errors.md)
- 📖 Quick guide: [.claude/guides/http-integration.md](./.claude/guides/http-integration.md)
- 📖 Examples: [.claude/context/similar-features.md](./.claude/context/similar-features.md#data-management-features)

**"Extending existing component"** → `@extending + @component`
- 📖 Similar features: [.claude/context/similar-features.md](./.claude/context/similar-features.md)
- 📖 Component rules: [.claude/rules/01-CRITICAL.md](./.claude/rules/01-CRITICAL.md)

---

### 🐛 Fixing Issues (`@fixing-bug`)

**"HTTP error not showing correctly"** → `@fixing-bug + @http`
- 📖 Error patterns: [.claude/rules/02-http-errors.md](./.claude/rules/02-http-errors.md)

**"Styles not applying"** → `@fixing-bug + @styling`
- 📖 SCSS rules: [.claude/rules/06-scss.md](./.claude/rules/06-scss.md)
- 📖 Common issues: [.claude/guides/styling-guide.md](./.claude/guides/styling-guide.md)

---

### 📚 Learning Project (`@learn-project`)

**"What reusable components exist?"** → `@learn-project + @component`
- 📖 Full inventory: [.claude/context/reusable-components.md](./.claude/context/reusable-components.md)

**"How is the project architected?"** → `@learn-project`
- 📖 Architecture: [.claude/context/architecture-map.md](./.claude/context/architecture-map.md)
- 📖 Patterns: [.claude/context/common-patterns.md](./.claude/context/common-patterns.md)

**"Show me similar features"** → `@learn-patterns`
- 📖 Code examples: [.claude/context/similar-features.md](./.claude/context/similar-features.md)

---

## 📋 Quick Reference by File Type

| Creating... | Check Exists | Read Rules | See Patterns | Template |
|-------------|--------------|------------|--------------|----------|
| Component | [reusable-components.md](./.claude/context/reusable-components.md) | [01-CRITICAL.md](./.claude/rules/01-CRITICAL.md) | [similar-features.md](./.claude/context/similar-features.md) | [component.template.ts](./.claude/templates/component.template.ts) |
| Service | [common-patterns.md](./.claude/context/common-patterns.md) | [04-services.md](./.claude/rules/04-services.md) | [similar-features.md](./.claude/context/similar-features.md) | [service.template.ts](./.claude/templates/service.template.ts) |
| Model | `/shared/models/` | [03-models.md](./.claude/rules/03-models.md) | - | [model.template.ts](./.claude/templates/model.template.ts) |
| Utility | `/shared/utils/` | [05-utils.md](./.claude/rules/05-utils.md) | [common-patterns.md](./.claude/context/common-patterns.md) | - |
| HTTP call | [similar-features.md](./.claude/context/similar-features.md) | [02-http-errors.md](./.claude/rules/02-http-errors.md) | [http-integration.md](./.claude/guides/http-integration.md) | - |

---

## 📚 All Detailed Rules

| Priority | Topic | File | When to Read |
|----------|-------|------|--------------|
| 🔴 Critical | Component Architecture | [01-CRITICAL.md](./.claude/rules/01-CRITICAL.md) | Before creating components |
| 🔴 Critical | HTTP Error Handling | [02-http-errors.md](./.claude/rules/02-http-errors.md) | Before HTTP calls |
| 🔴 Critical | Models Organization | [03-models.md](./.claude/rules/03-models.md) | Before creating interfaces |
| 🔴 Critical | Services Organization | [04-services.md](./.claude/rules/04-services.md) | Before creating services |
| 🔴 Critical | Utils Organization | [05-utils.md](./.claude/rules/05-utils.md) | Before creating utilities |
| 🔴 Critical | SCSS Architecture | [06-scss.md](./.claude/rules/06-scss.md) | Before writing styles |
| 🟡 High | Icons & SVG | [07-icons.md](./.claude/rules/07-icons.md) | When using icons |

---

## 🗂️ Context Files (Project Inventory)

| File | Purpose | When to Read |
|------|---------|--------------|
| [reusable-components.md](./.claude/context/reusable-components.md) | What components/mixins exist | Before creating components |
| [common-patterns.md](./.claude/context/common-patterns.md) | Established code patterns | Looking for how we do X |
| [similar-features.md](./.claude/context/similar-features.md) | Real code examples | Building something similar |
| [architecture-map.md](./.claude/context/architecture-map.md) | High-level architecture | Understanding project structure |

---

## 📖 Step-by-Step Guides

| Guide | Purpose | When to Read |
|-------|---------|--------------|
| [creating-component.md](./.claude/guides/creating-component.md) | Component creation workflow | Creating new component |
| [creating-service.md](./.claude/guides/creating-service.md) | Service creation workflow | Creating new service |
| [http-integration.md](./.claude/guides/http-integration.md) | Adding HTTP endpoints | Adding API calls |
| [styling-guide.md](./.claude/guides/styling-guide.md) | Styling workflow | Styling components |

---

## 🛠️ Maintaining Documentation

**Want to add/update rules?** Read:
- [.claude/meta/CONTRIBUTING.md](./.claude/meta/CONTRIBUTING.md) - How to maintain rules
- [.claude/meta/file-structure.md](./.claude/meta/file-structure.md) - File organization
- [.claude/meta/context-tags-guide.md](./.claude/meta/context-tags-guide.md) - Tag system
- [.claude/meta/version-history.md](./.claude/meta/version-history.md) - Change log

---

## 📊 Project Info

**Framework:** Angular 19.2.15 (standalone components)

**Key Libraries:**
- CoreUI + Angular Material (UI)
- Chart.js (analytics)
- @ngx-translate (i18n: en, he, ru, uk)
- RxJS (reactive programming)

**Root Directory:** `/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/`

**Dev Server:** `npm start` (http://localhost:4200)

**API Proxy:** All `/api/*` → `https://esim-server.dev.global-sim.app`

---

## 🎯 Token Optimization

**This modular system saves ~48-55% tokens compared to monolithic CLAUDE.md**

**Typical usage:**
- Creating component: ~15,000 tokens (vs 26,865)
- Fixing HTTP error: ~12,000 tokens (vs 26,865)
- Learning project: ~12,500 tokens (vs 26,865)

**Always loaded:**
- This file (~5,500 tokens)

**Loaded on demand:**
- Rule files (3,000-8,000 tokens each)
- Context files (2,500-5,000 tokens each)
- Guides (2,000-3,000 tokens each)

---

## 🔍 Search Before Creating

**Before creating anything:**

1. **Components:** Check [reusable-components.md](./.claude/context/reusable-components.md)
2. **Services:** Check [services.md](./.claude/rules/04-services.md)
3. **Models:** Check [models.md](./.claude/rules/03-models.md)
4. **Utils:** Check [utils.md](./.claude/rules/05-utils.md)

---

## 📞 Need Help?

- **Can't find rule?** Use context tags above
- **Adding new rule?** Read [CONTRIBUTING.md](./.claude/meta/CONTRIBUTING.md)
- **Confused about tags?** Read [context-tags-guide.md](./.claude/meta/context-tags-guide.md)

---

**Documentation System Version:** 2.0
**Last Major Update:** 2025-11-15 (Modular restructuring)
**Total Documentation:** ~5,500 lines across 24 files
**Maintenance:** See [.claude/README.md](./.claude/README.md)
