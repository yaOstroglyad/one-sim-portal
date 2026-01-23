# CLAUDE.md — AI Developer Guide

> **Version:** 5.0 | **Last Updated:** 2026-01-16
> **For:** AI assistants (Claude, GPT, etc.) working on this project

---

## Documentation Hierarchy

This project uses a 4-level documentation system optimized for AI development:

```
LEVEL 0: ENTRY POINT (this file)
    │
    │   You are here. Start by reading project-map.md
    │
    ▼
LEVEL 1: KNOWLEDGE BASE (always in context)
    │
    │   constitution.md  →  ALL rules (source of truth)
    │   project-map.md   →  Project structure, components, services
    │
    ▼
LEVEL 2: PROCEDURES (loaded on trigger)
    │
    │   Skills (.claude/skills/)  →  HOW to do specific tasks
    │
    ▼
LEVEL 3: REFERENCE (loaded on demand)
    │
    │   docs/   →  Component guides, architecture decisions
    │   specs/  →  Feature specifications, plans, tasks
```

**Key Principle:** Rules are in `constitution.md` only. Everything else references it.

---

## Quick Start

**Step 1:** Read project structure
```
.specify/memory/project-map.md
```

**Step 2:** For any task, check if a Skill exists (see Skills section below)

**Step 3:** Follow rules from `constitution.md`

---

## Critical Rules (Quick Reference)

> **Full rules:** `.specify/memory/constitution.md`
> Below are the most critical ones. Always check constitution for complete rules.

| Rule | Reference |
|------|-----------|
| Absolute paths only | Constitution Section I |
| `standalone: true` + OnPush | Constitution Section II |
| `inject()` for DI (no constructor injection) | Constitution Section II |
| Signal APIs: `input()`, `output()`, `signal()` | Constitution Section II |
| Member ordering in components | Constitution Section II |
| `os-` selector prefix | Constitution Section II |
| `@use "variables"` (no relative paths) | Constitution Section VII |
| CSS variables for colors | Constitution Section VII |
| Error handling: 4-layer architecture | Constitution Section III |
| English only for code/comments | Constitution Section IX |

---

## Skills (Automated Procedures)

Skills are triggered automatically when your request matches their description.

| Skill | Trigger Examples | What It Does |
|-------|------------------|--------------|
| **create-component** | "create component", "new component" | Creates Angular component with templates |
| **create-service** | "create service", "new service" | Creates Angular service with templates |
| **create-model** | "create model", "new interface" | Creates TypeScript model/interface |
| **document-component** | "document this", "add docs" | Creates component documentation |
| **add-translations** | "add translation", "translate" | Adds i18n keys to all 4 language files |
| **review-code** | "review code", "check code" | Reviews code against constitution |
| **fix-errors** | "fix errors", "fix build" | Diagnoses and fixes build/lint errors |
| **refactor-legacy** | "refactor", "modernize" | Updates legacy code to current standards |

**Location:** `.claude/skills/`

**How Skills work:**
1. AI detects trigger keywords in your request
2. Skill is loaded with procedure + templates
3. Skill references constitution for rules (no duplication)

---

## Spec-Kit Workflow (New Features)

**Before starting ANY new feature (more than a single line change):**

1. **ASK FIRST:** "Это большой фичер или можно делать сразу?"
2. **If big feature** → Follow Spec-Kit workflow:

```
/speckit.specify   →  spec.md      # Define requirements
/speckit.plan      →  plan.md      # Plan architecture
/speckit.tasks     →  tasks.md     # Generate task list
/speckit.implement →  code         # Execute tasks
```

**Optional steps:**
```
/speckit.clarify   →  Resolve ambiguities
/speckit.analyze   →  Check consistency
/speckit.checklist →  Validate requirements
```

**Never skip to implementation for:**
- Multiple files
- New API integrations
- New components/services
- Architecture changes

---

## Project Structure

```
/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/
│
├── CLAUDE.md                    ← You are here (L0)
│
├── .specify/memory/
│   ├── constitution.md          ← ALL rules (L1)
│   └── project-map.md           ← Project structure (L1)
│
├── .claude/skills/              ← Procedures (L2)
│   ├── create-component/
│   ├── create-service/
│   ├── create-model/
│   ├── document-component/
│   ├── add-translations/
│   ├── review-code/
│   ├── fix-errors/
│   └── refactor-legacy/
│
├── docs/                        ← Reference (L3)
│   ├── components/
│   └── architecture/
│
├── specs/                       ← Feature specs (L3)
│   ├── 001-tickets/
│   ├── ...
│   └── 023-public-api-docs/
│
└── src/app/                     ← Source code
    ├── shared/                  ← Reusable code
    ├── views/                   ← Feature modules
    └── layout/                  ← Layout components
```

---

## Key Locations

| What | Where |
|------|-------|
| **Rules (source of truth)** | `.specify/memory/constitution.md` |
| **Project map** | `.specify/memory/project-map.md` |
| **Skills** | `.claude/skills/` |
| **Shared components** | `src/app/shared/components/` |
| **Shared services** | `src/app/shared/services/` |
| **Shared models** | `src/app/shared/models/` |
| **Feature views** | `src/app/views/{feature}/` |
| **Translations** | `src/assets/i18n/{en,he,ru,ua}.json` |
| **SCSS variables** | `src/scss/_variables.scss` |
| **SCSS mixins** | `src/scss/_mixins.scss` |

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 21.0.5 (Zoneless, standalone) |
| Language | TypeScript 5.9 |
| UI | CoreUI + Angular Material |
| Charts | Chart.js |
| i18n | @ngx-translate (en, he, ru, uk) |
| Reactive | RxJS + Angular Signals |

**Dev Server:** `npm start` → http://localhost:4200

**API Proxy:** `/api/*` → `https://esim-server.dev.global-sim.app`

---

## Build Policy

- **DO NOT** run `npm run build` automatically after changes
- **Dev server** (`npm start`) handles incremental compilation
- **Run build only** when explicitly asked or before commit

---

## For New AI Developers

1. **Read first:** `project-map.md` — gives complete project context
2. **Check Skills:** Before starting a task, see if a Skill exists
3. **Follow constitution:** All rules are there, Skills reference it
4. **Ask if unsure:** "Это большой фичер или можно делать сразу?"

**The hierarchy ensures:**
- No conflicting rules (single source of truth)
- No duplication (Skills reference, not copy)
- Clear responsibilities (each document = one purpose)

---

## Maintaining This System

| Action | How |
|--------|-----|
| Update rules | Edit `constitution.md` only |
| Add new Skill | Create `.claude/skills/{name}/SKILL.md` |
| Update project map | Edit `project-map.md` |
| Add feature spec | Use `/speckit.specify` |

**Never:**
- Duplicate rules in Skills (reference instead)
- Add rules to CLAUDE.md (link to constitution)
- Create conflicting documentation

---

**Documentation System Version:** 5.0 (Hierarchical AI-Ready)
**Last Major Update:** 2026-01-16

## Active Technologies
- SCSS (Dart Sass) with Angular 21.0.5 + Angular, CoreUI, Angular Material (024-scss-responsive-refactoring)
- N/A (CSS-only refactoring) (024-scss-responsive-refactoring)

## Recent Changes
- 024-scss-responsive-refactoring: Added SCSS (Dart Sass) with Angular 21.0.5 + Angular, CoreUI, Angular Material
