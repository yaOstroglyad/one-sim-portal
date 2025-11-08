# .context - Feature Documentation

> **Purpose:** Feature-specific documentation, HLDs, and component guides
> **Last Updated:** 2025-11-08
> **Language:** English only

---

## 📋 Overview

The `.context/` directory contains **feature-specific, implementation-focused documentation** that complements the **project-wide rules** in `.claude/`.

**Key Principle:** `.context/` = specific features/implementations, `.claude/` = general rules/patterns

---

## 📁 Directory Structure

```
.context/
├── features/         ← Feature HLDs and feature-specific documentation
├── components/       ← Component-specific guides and documentation
├── architecture/     ← Architecture decision documents
└── optimizations/    ← Performance and optimization documentation
```

---

## 📂 Features (`./features/`)

**High-Level Designs:**
- **[product-constructor-hld.md](./features/product-constructor-hld.md)** - Product Constructor feature design (18K)
- **[tickets-feature-hld.md](./features/tickets-feature-hld.md)** - Tickets feature comprehensive design (32K)
- **[fab-layout-hld.md](./features/fab-layout-hld.md)** - FAB + Flyout Layout system (14K)

**Feature Directories:**
- **[dashboard/](./features/dashboard/)** - Dashboard analytics feature (HLD, implementation plan, finance/traffic tabs)
- **[data-cache/](./features/data-cache/)** - Future caching system documentation
- **[feature-toggles/](./features/feature-toggles/)** - Feature toggle system
- **[check-active-products-for-registration-email/](./features/check-active-products-for-registration-email/)** - Email validation feature

---

## 🧩 Components (`./components/`)

Component-specific implementation guides and documentation:
- **[generic-right-panel/](./components/generic-right-panel/)** - GenericRightPanel usage guide (8.2K)
- **[account-selector/](./components/account-selector/)** - Account selector component docs
- **[generic-table/](./components/generic-table/)** - Generic table comprehensive docs
- **[email-logs/](./components/email-logs/)** - Email logs component
- **[header/](./components/header/)** - Reusable header component
- **[info-strip/](./components/info-strip/)** - Info strip component
- **[navigation-system/](./components/navigation-system/)** - Navigation architecture

---

## 🏗️ Architecture (`./architecture/`)

Architecture decision documents and system designs:
- **[mock-server-architecture.md](./architecture/mock-server-architecture.md)** - Selective mock server system (5.4K)
- **[table-menu-architecture.md](./architecture/table-menu-architecture.md)** - Table menu/button sizing solutions (5.8K)

---

## ⚡ Optimizations (`./optimizations/`)

Performance and optimization documentation:
- **[form-generator-hint/](./optimizations/form-generator-hint/)** - Form generator optimization

---

## 🗂️ Organization Guidelines

### What Goes Where

#### ✅ Belongs in `.context/`
- Feature HLDs (high-level designs)
- Component-specific implementation details
- Architecture decision documents
- Feature-specific patterns
- Implementation notes

#### ✅ Belongs in `.claude/`
- Project-wide critical rules
- General development patterns
- Component/service templates
- Cross-cutting concerns
- Common error solutions

### File Naming Conventions

**HLD Documents (in `features/`):**
- `feature-name-hld.md` (kebab-case with `-hld` suffix)

**Architecture Documents (in `architecture/`):**
- `feature-name-architecture.md` (kebab-case with `-architecture` suffix)

**Component Guides (in `components/`):**
- Component directory without `-component` suffix (e.g., `generic-table/`, not `generic-table-component/`)
- Guide file named after component (e.g., `guide.md` or `README.md`)

**Optimization Docs (in `optimizations/`):**
- Directory format: `feature-name/` (kebab-case)

---

## 📝 Creating New Documentation

### Quick Decision Tree

```
Need to document something?
├── Is it a project-wide rule? → .claude/rules/
├── Is it a reusable pattern? → .claude/context/
├── Is it a step-by-step guide? → .claude/guides/
└── Is it feature-specific?
    ├── Major feature architecture? → .context/features/feature-name-hld.md
    ├── Feature subsystem? → .context/features/feature-name/
    ├── Component details? → .context/components/component-name/
    ├── Architecture decision? → .context/architecture/decision-name-architecture.md
    └── Performance optimization? → .context/optimizations/optimization-name/
```

### HLD Template

```markdown
# HLD — Feature Name

> **Status:** [Planning | In Progress | Implemented]
> **Last Updated:** YYYY-MM-DD

## Overview
[Feature purpose and goals]

## Architecture
[System design, components, services]

## Models
[Data structures]

## Implementation Details
[Technical specifics]

## Testing Strategy
[How to test]

## Acceptance Criteria
[When is it done]
```

---

## 🔄 Documentation Lifecycle

1. **Planning Phase** - Create HLD with architecture decisions
2. **Implementation Phase** - Update with actual implementation details
3. **Completion Phase** - Mark status as "Implemented", add final notes
4. **Maintenance Phase** - Update when feature changes, add troubleshooting

---

## 📚 Related Documentation

- **`.claude/rules/`** - Project-wide critical rules (8 rules)
- **`.claude/context/`** - Reusable components inventory, common patterns
- **`.claude/guides/`** - Step-by-step guides (creating components, styling, etc.)
- **`.claude/templates/`** - Code templates (component, service, model)

---

## ✅ Best Practices

1. **Keep It Current** - Update docs when features change
2. **Write in English** - All documentation must be in English
3. **Be Specific** - Focus on implementation details
4. **Use Examples** - Real code snippets over pseudo-code
5. **Link Generously** - Cross-reference related docs
6. **Follow Naming** - Use kebab-case with appropriate suffixes

---

## 🎯 Quick Reference

**Before creating component:**
- Check: `.claude/context/reusable-components.md`
- Read: `.claude/rules/01-CRITICAL.md`
- Use: `.claude/templates/component.template.ts`

**Before styling:**
- Read: `.claude/rules/06-scss.md`
- Check: Available mixins in `src/scss/_mixins.scss`

**When encountering errors:**
- Read: `.claude/guides/common-errors.md`

---

## 📊 Structure Summary

**Last Updated:** 2025-11-08
- **Features:** 3 HLDs + 4 feature directories
- **Components:** 7 component directories
- **Architecture:** 2 architecture documents
- **Optimizations:** 1 optimization directory

**Total:** 17 items across 4 logical categories
**Maintenance:** Update when features change or new features added
