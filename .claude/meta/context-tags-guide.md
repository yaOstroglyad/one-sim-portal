# Context Tags System Guide

> **Last Updated:** 2025-11-15
> **Purpose:** Complete guide to understanding and using context tags

## 🎯 What Are Context Tags?

Context tags are semantic labels that help Claude understand **what you're trying to accomplish** so it can load only the relevant documentation.

**Key Concept:** Instead of loading all 2600+ lines of rules, tags let Claude load only the 300-600 lines needed for your specific task.

## 🏷️ Tag Categories

### Intent Tags (What Am I Doing?)

These describe your current activity:

| Tag | When to Use | Typical Files Loaded |
|-----|-------------|---------------------|
| `@creating-new` | Starting something from scratch | Rules + Inventory + Templates |
| `@extending` | Adding to existing code | Rules + Similar features |
| `@fixing-bug` | Debugging/fixing issues | Rules + Common patterns |
| `@refactoring` | Improving existing code | Rules + Patterns |
| `@learn-project` | Understanding the codebase | Context files + Architecture |
| `@learn-patterns` | Looking for examples | Similar features + Patterns |

### Type Tags (What Am I Working On?)

These describe the type of code:

| Tag | Code Type | Rules File |
|-----|-----------|-----------|
| `@component` | Angular components | `01-CRITICAL.md` |
| `@service` | Injectable services | `04-services.md` |
| `@model` | Interfaces/types | `03-models.md` |
| `@http` | HTTP operations | `02-http-errors.md` |
| `@styling` | SCSS/CSS | `06-scss.md` |
| `@utils` | Utility functions | `05-utils.md` |
| `@form` | Forms | Guides + Patterns |
| `@icon` | Icons/SVG | `07-icons.md` |

### Meta Tags (Quick Actions)

| Tag | Purpose |
|-----|---------|
| `@quick-reference` | Just need a quick lookup |
| `@checklist` | Pre-creation checklist |

## 🎨 Tag Combinations (Usage Patterns)

### Pattern 1: Creating New Code

**Formula:** `@creating-new + @[type]`

**Examples:**

```
@creating-new + @component
→ Loads: CRITICAL.md + reusable-components.md + creating-component.md

@creating-new + @service
→ Loads: services.md + common-patterns.md + creating-service.md

@creating-new + @model
→ Loads: models.md + (search existing models)

@creating-new + @styling
→ Loads: scss.md + reusable-components.md (for mixins)
```

### Pattern 2: Extending Existing Code

**Formula:** `@extending + @[type]`

**Examples:**

```
@extending + @http
→ Loads: http-errors.md + similar-features.md

@extending + @component
→ Loads: CRITICAL.md + similar-features.md

@extending + @service
→ Loads: services.md + common-patterns.md
```

### Pattern 3: Learning

**Formula:** `@learn-[what]`

**Examples:**

```
@learn-project + @component
→ Loads: reusable-components.md + architecture-map.md

@learn-patterns + @http
→ Loads: similar-features.md + common-patterns.md

@learn-project
→ Loads: architecture-map.md + reusable-components.md + common-patterns.md
```

### Pattern 4: Fixing Issues

**Formula:** `@fixing-bug + @[type]`

**Examples:**

```
@fixing-bug + @http
→ Loads: http-errors.md + common-patterns.md

@fixing-bug + @styling
→ Loads: scss.md + styling-guide.md

@fixing-bug + @component
→ Loads: CRITICAL.md + common-patterns.md
```

## 📋 Scenario-Based Tag Selection

### Scenario 1: "I need to create a new dashboard card"

**Think:**
- Creating? → `@creating-new`
- Component? → `@component`
- Styling involved? → `@styling`

**Tags:** `@creating-new + @component + @styling`

**Claude loads:**
1. CLAUDE.md (critical rules)
2. `.claude/rules/01-CRITICAL.md` (component architecture)
3. `.claude/context/reusable-components.md` (check if card exists)
4. `.claude/rules/06-scss.md` (styling rules)
5. `.claude/guides/creating-component.md` (workflow)

**Token count:** ~15,000 tokens (vs 26,865 for full file)

---

### Scenario 2: "HTTP errors aren't displaying correctly"

**Think:**
- Fixing? → `@fixing-bug`
- HTTP? → `@http`

**Tags:** `@fixing-bug + @http`

**Claude loads:**
1. CLAUDE.md (navigation)
2. `.claude/rules/02-http-errors.md` (error handling rules)
3. `.claude/context/common-patterns.md#error-handling` (patterns)

**Token count:** ~12,000 tokens

---

### Scenario 3: "What reusable components exist?"

**Think:**
- Learning project → `@learn-project`
- Components → `@component`

**Tags:** `@learn-project + @component`

**Claude loads:**
1. CLAUDE.md (navigation)
2. `.claude/context/reusable-components.md` (full inventory)

**Token count:** ~8,000 tokens

---

### Scenario 4: "How do I add a new HTTP endpoint to existing service?"

**Think:**
- Extending existing → `@extending`
- HTTP → `@http`
- Service → `@service`

**Tags:** `@extending + @http + @service`

**Claude loads:**
1. CLAUDE.md
2. `.claude/rules/02-http-errors.md` (error handling)
3. `.claude/rules/04-services.md` (service patterns)
4. `.claude/guides/http-integration.md` (step-by-step)
5. `.claude/context/similar-features.md#data-services` (examples)

**Token count:** ~18,000 tokens

---

### Scenario 5: "Need to refactor a component to use OnPush"

**Think:**
- Refactoring → `@refactoring`
- Component → `@component`

**Tags:** `@refactoring + @component`

**Claude loads:**
1. CLAUDE.md
2. `.claude/rules/01-CRITICAL.md` (OnPush requirements)
3. `.claude/context/similar-features.md#components` (examples)

**Token count:** ~10,000 tokens

---

## 🧭 Tag Decision Tree

```
What am I trying to do?
├─ Create something NEW
│  ├─ Component? → @creating-new + @component
│  ├─ Service? → @creating-new + @service
│  ├─ Model? → @creating-new + @model
│  ├─ Utility? → @creating-new + @utils
│  └─ Style? → @creating-new + @styling
│
├─ Add to EXISTING code
│  ├─ HTTP endpoint? → @extending + @http + @service
│  ├─ Component feature? → @extending + @component
│  └─ New method? → @extending + @[type]
│
├─ Fix a BUG
│  ├─ HTTP error? → @fixing-bug + @http
│  ├─ Style issue? → @fixing-bug + @styling
│  └─ Component bug? → @fixing-bug + @component
│
├─ LEARN about project
│  ├─ What exists? → @learn-project + @[type]
│  ├─ How is it done? → @learn-patterns + @[type]
│  └─ Architecture? → @learn-project
│
└─ REFACTOR existing code
   └─ → @refactoring + @[type]
```

## 📖 How Claude Uses Tags

### In CLAUDE.md

Tags map to specific documentation sections:

```markdown
## 🏷️ Find What You Need by Context

### 🆕 Creating Something New (@creating-new)

**"I need to create a new component"** → `@creating-new + @component`
- 📖 Read: [.claude/context/reusable-components.md]()
- 📖 Read: [.claude/rules/01-CRITICAL.md]()
- 📖 Read: [.claude/guides/creating-component.md]()
```

### In Rule Files

Each rule file declares which tags it serves:

```markdown
# HTTP Error Handling Rules

> **Context Tags:** `@http` `@extending` `@fixing-bug`
> **Read when:** Working with HTTP calls or fixing HTTP errors
```

### In Context Files

Context files also declare tags:

```markdown
# Reusable Components Inventory

> **Context Tags:** `@creating-new` `@learn-project` `@component`
> **Read when:** Before creating a component
```

## 🆕 Adding New Context Tags

### When to Add a New Tag

Add a new tag when:
- ✅ You have 3+ scenarios that need the same documentation combo
- ✅ Existing tags don't accurately describe the scenario
- ✅ The tag represents a common developer activity

**Don't add a tag for:**
- ❌ One-off scenarios
- ❌ Tags that overlap too much with existing ones
- ❌ Too specific scenarios

### How to Add a New Tag

1. **Choose tag name**
   - Format: `@verb-noun` or `@noun`
   - Examples: `@creating-new`, `@component`, `@learn-patterns`
   - Keep it short and clear

2. **Document the tag**

   Add to CLAUDE.md:
   ```markdown
   ## 🏷️ Find What You Need by Context

   ### 🆕 [New Tag Section]

   **"[Scenario description]"** → `@new-tag + @type`
   - 📖 Read: [relevant files]
   ```

3. **Tag relevant files**

   Add to rule/context file headers:
   ```markdown
   > **Context Tags:** `@existing-tag` `@new-tag`
   ```

4. **Add to this guide**

   Add to tag categories table above

5. **Update CONTRIBUTING.md**

   Document the new tag in the tags section

### Example: Adding `@testing` Tag

**Scenario:** Developers often need to write tests

**Tag name:** `@testing`

**Files to tag:**
- Create new: `.claude/guides/writing-tests.md`
- Update: CLAUDE.md

**In CLAUDE.md:**
```markdown
### 🧪 Testing Code (@testing)

**"I need to write tests"** → `@testing + @component`
- 📖 Read: [.claude/guides/writing-tests.md]()
- 📖 Read: [.claude/context/common-patterns.md#testing]()
```

**In guide file:**
```markdown
# Writing Tests Guide

> **Context Tags:** `@testing` `@component` `@service`
> **Read when:** Writing unit tests
```

## 🎯 Tag Best Practices

### For Claude

When Claude sees tags in a user request:
1. ✅ Load CLAUDE.md first (always)
2. ✅ Identify tags from user's scenario
3. ✅ Load only files matching those tags
4. ✅ Follow the links in CLAUDE.md navigation

### For Developers

When working with this system:
1. ✅ Think about what you're doing (intent)
2. ✅ Think about what type of code (type)
3. ✅ Combine intent + type tags
4. ✅ Check CLAUDE.md for matching documentation

## 📊 Tag Usage Statistics (Goal)

**Most common combinations:**

```
@creating-new + @component     → 30% of tasks
@extending + @http             → 20% of tasks
@fixing-bug + @http            → 15% of tasks
@learn-project                 → 10% of tasks
@creating-new + @service       → 10% of tasks
Other combinations             → 15% of tasks
```

**Token savings:**

```
Without tags: Always load 26,865 tokens
With tags:    Load 8,000-18,000 tokens (avg 12,000)
Savings:      55% average
```

## 🔍 Tag Quick Reference

### Quick Tag Lookup

| I want to... | Tags |
|--------------|------|
| Create a component | `@creating-new + @component` |
| Create a service | `@creating-new + @service` |
| Add HTTP endpoint | `@extending + @http + @service` |
| Fix HTTP error | `@fixing-bug + @http` |
| Fix styling | `@fixing-bug + @styling` |
| Learn what exists | `@learn-project + @[type]` |
| See examples | `@learn-patterns + @[type]` |
| Refactor code | `@refactoring + @[type]` |

### All Available Tags

**Intent:**
- `@creating-new`
- `@extending`
- `@fixing-bug`
- `@refactoring`
- `@learn-project`
- `@learn-patterns`

**Type:**
- `@component`
- `@service`
- `@model`
- `@http`
- `@styling`
- `@utils`
- `@form`
- `@icon`

**Meta:**
- `@quick-reference`
- `@checklist`

## 📝 Maintaining Tags

**Monthly review:**
- [ ] Check if new tags needed based on common questions
- [ ] Verify tag combinations make sense
- [ ] Update tag documentation
- [ ] Remove unused tags

**Update when:**
- New common scenario emerges
- New rule category added
- Developer feedback suggests confusion

## 🆘 Tag Troubleshooting

**"Tags aren't clear enough"**
→ Add more examples to CLAUDE.md navigation

**"Too many tag combinations"**
→ Consolidate similar tags, create meta-tags

**"Don't know which tags to use"**
→ Use the decision tree above

**"Multiple tags load same files"**
→ Good! Redundancy ensures documentation is found

---

## 📚 Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to maintain the tag system
- [file-structure.md](./file-structure.md) - Where files live
- Main: [/CLAUDE.md](../../CLAUDE.md) - Tag navigation hub
