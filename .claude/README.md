# .claude/ - Project Documentation System

> **Purpose:** Modular, context-aware documentation for Claude Code
> **Last Updated:** 2025-11-08

---

## 📁 Directory Structure

```
.claude/
├── rules/         → Critical project-wide rules (7 files)
├── context/       → Component inventory, patterns, architecture (4 files)
├── guides/        → Step-by-step implementation guides (4 files)
├── templates/     → Code boilerplate (component, service, model)
├── meta/          → Documentation maintenance guides
└── commands/      → Custom slash commands (e.g., /start)
```

---

## 🚀 Quick Start

**New to this project?**
1. Read [/CLAUDE.md](../CLAUDE.md) - Main navigation hub (auto-loaded by Claude Code)
2. For implementation → Use context tags in CLAUDE.md (e.g., `@creating-new + @component`)
3. For maintenance → Read [meta/CONTRIBUTING.md](./meta/CONTRIBUTING.md)

**Need to add/update rules?** → [meta/CONTRIBUTING.md](./meta/CONTRIBUTING.md)

---

## 📖 File Categories

### Rules (`./rules/`)
Critical project-wide rules that must be followed:
- **01-CRITICAL.md** - Breaking rules (standalone, OnPush, inject(), absolute paths)
- **02-http-errors.md** - HTTP error handling patterns
- **03-models.md** - Models organization
- **04-services.md** - Services organization
- **05-utils.md** - Utilities organization
- **06-scss.md** - SCSS architecture (@use, CSS variables)
- **07-icons.md** - Icon usage guidelines

### Context (`./context/`)
Project inventory and established patterns:
- **reusable-components.md** - Available components/services/mixins
- **common-patterns.md** - Established code patterns
- **similar-features.md** - Real implementation examples
- **architecture-map.md** - High-level architecture overview

### Guides (`./guides/`)
Step-by-step implementation workflows:
- **creating-component.md** - Component creation checklist
- **creating-service.md** - Service creation workflow
- **http-integration.md** - Adding HTTP endpoints
- **styling-guide.md** - Styling workflow
- **common-errors.md** - Common errors and solutions

### Templates (`./templates/`)
Code boilerplate for consistency:
- **component.template.ts** - Standalone component template
- **service.template.ts** - Injectable service template
- **model.template.ts** - TypeScript interface template

### Meta (`./meta/`)
Documentation maintenance guides:
- **CONTRIBUTING.md** - How to add/update documentation
- **file-structure.md** - Directory organization guide
- **context-tags-guide.md** - Context tags system explained
- **version-history.md** - Change log

---

## 🔍 How to Find What You Need

**Use CLAUDE.md with context tags:**
- Creating component → `@creating-new + @component`
- Adding HTTP call → `@extending + @http`
- Fixing HTTP error → `@fixing-bug + @http`
- Learning project → `@learn-project`
- Styling component → `@creating-new + @styling`

**Full navigation:** See [/CLAUDE.md](../CLAUDE.md)

---

## 🔧 Maintenance

### Adding New Rules
1. Read [meta/CONTRIBUTING.md](./meta/CONTRIBUTING.md) for decision tree
2. Choose appropriate file (rules vs context vs guides)
3. Follow existing format and examples
4. Update [meta/version-history.md](./meta/version-history.md)
5. Update [/CLAUDE.md](../CLAUDE.md) if needed

### Organization Principles
- **rules/** - Project-wide requirements (must follow)
- **context/** - What exists and established patterns (search before creating)
- **guides/** - How to implement (step-by-step)
- **templates/** - Starting point code (copy & customize)

---

## 📊 Token Optimization

**Before:** Monolithic CLAUDE.md (26,865 tokens)
**After:** Modular system (~12,000-17,000 tokens per task)
**Savings:** ~48-55% average

---

## 📞 Quick Links

- **Main Hub:** [/CLAUDE.md](../CLAUDE.md)
- **How to maintain:** [meta/CONTRIBUTING.md](./meta/CONTRIBUTING.md)
- **Context tags guide:** [meta/context-tags-guide.md](./meta/context-tags-guide.md)
- **Change log:** [meta/version-history.md](./meta/version-history.md)

---

**Last Updated:** 2025-11-08
