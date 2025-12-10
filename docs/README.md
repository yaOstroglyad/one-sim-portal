# docs/ — Detailed Documentation

> **Purpose:** Feature-specific documentation, HLDs, and component deep-dives
> **Last Updated:** 2025-11-26
> **Language:** English only

---

## 📋 Overview

The `docs/` directory contains **detailed, feature-specific documentation** that complements the **project-wide rules** in `.claude/`.

**Key Principle:**
- `.claude/` = project-wide rules, patterns, inventory (auto-loaded by Claude)
- `docs/` = feature-specific HLDs, component deep-dives, architecture decisions

---

## 📁 Structure

```
docs/
├── README.md                  # This file
├── features/                  # Feature HLDs and business logic
│   ├── product-constructor.md # eSIM product domain model
│   ├── tickets.md             # Support ticketing system
│   ├── dashboard.md           # Analytics dashboard
│   ├── fab-layout.md          # Global FAB + Flyout
│   └── data-cache.md          # CacheHub caching system
├── components/                # Component deep-dives
│   ├── generic-table.md       # Table component (72KB)
│   ├── account-selector.md    # Account selection
│   ├── bar-chart.md           # Bar chart with Chart.js
│   ├── chart-legend.md        # Custom scrollable chart legend
│   ├── email-logs.md          # Email logs viewer
│   ├── navigation-system.md   # Navigation architecture
│   ├── generic-right-panel.md # Right panel component
│   ├── header.md              # Header component
│   └── info-strip.md          # Info strip component
├── architecture/              # Architecture decisions
│   ├── mock-server.md         # Selective mocking system
│   └── table-menu.md          # Button sizing solutions
└── optimizations/             # Performance documentation
    └── form-generator-hint.md # Form generator optimization
```

---

## 📂 Features (`features/`)

| File | Description | Size |
|------|-------------|------|
| [product-constructor.md](./features/product-constructor.md) | eSIM product domain model + pricing schedule | 22KB |
| [tickets.md](./features/tickets.md) | Support ticketing system HLD | 33KB |
| [dashboard.md](./features/dashboard.md) | Analytics dashboard (4 tabs: Overview, Subscribers, Traffic, Finance) | 16KB |
| [fab-layout.md](./features/fab-layout.md) | Global FAB button + Flyout panel architecture | 18KB |
| [data-cache.md](./features/data-cache.md) | CacheHub intelligent caching system | 7KB |

---

## 🧩 Components (`components/`)

| File | Description | Size |
|------|-------------|------|
| [generic-table.md](./components/generic-table.md) | GenericTableComponent with examples | 8KB |
| [account-selector.md](./components/account-selector.md) | Account selection component | 3KB |
| [bar-chart.md](./components/bar-chart.md) | Bar chart with Chart.js | 10KB |
| [chart-legend.md](./components/chart-legend.md) | Custom scrollable chart legend | 5KB |
| [email-logs.md](./components/email-logs.md) | Email logs viewer | 3KB |
| [navigation-system.md](./components/navigation-system.md) | Navigation architecture | 5KB |
| [generic-right-panel.md](./components/generic-right-panel.md) | Right panel component | 5KB |
| [header.md](./components/header.md) | Header/filter component | 3KB |
| [info-strip.md](./components/info-strip.md) | Info strip component | 2KB |

---

## 🏗️ Architecture (`architecture/`)

| File | Description |
|------|-------------|
| [mock-server.md](./architecture/mock-server.md) | Selective mock server architecture |
| [table-menu.md](./architecture/table-menu.md) | Table menu button sizing solutions |

---

## ⚡ Optimizations (`optimizations/`)

| File | Description |
|------|-------------|
| [form-generator-hint.md](./optimizations/form-generator-hint.md) | Form generator hint positioning optimization |

---

## 📝 Creating New Documentation

### Where to Put What

```
Need to document something?
│
├─► Project-wide rule/pattern?
│   └─► Go to .claude/ (see .claude/meta/CONTRIBUTING.md)
│
└─► Feature-specific?
    ├─► Feature HLD → docs/features/{feature-name}.md
    ├─► Component deep-dive → docs/components/{component-name}.md
    ├─► Architecture decision → docs/architecture/{decision-name}.md
    └─► Optimization → docs/optimizations/{optimization-name}.md
```

### File Naming

- Use **kebab-case**: `product-constructor.md`, not `ProductConstructor.md`
- **One file per topic** — no subdirectories
- No suffixes like `-hld` or `-architecture` (directory name indicates type)

### HLD Template

Use `.claude/templates/hld.template.md` for new feature HLDs.

---

## 🔗 Related Documentation

- **Project-wide rules:** [.claude/rules/](../.claude/rules/)
- **Component inventory:** [.claude/context/reusable-components.md](../.claude/context/reusable-components.md)
- **Code patterns:** [.claude/context/common-patterns.md](../.claude/context/common-patterns.md)
- **Business domain:** [.claude/context/business-domain.md](../.claude/context/business-domain.md)
- **Contributing guide:** [.claude/meta/contributing.md](../.claude/meta/contributing.md)

---

## 📊 Statistics

| Category | Files | Total Size |
|----------|-------|------------|
| Features | 5 | ~96KB |
| Components | 9 | ~44KB |
| Architecture | 2 | ~11KB |
| Optimizations | 1 | ~6KB |
| **Total** | **17** | **~157KB** |

**Last Updated:** 2025-12-10
