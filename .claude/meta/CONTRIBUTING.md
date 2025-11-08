# Contributing to Project Rules

> **Last Updated:** 2025-11-15
> **Maintainers:** Development Team

This document explains how to add, update, and maintain the project's rule documentation system.

## 🎯 Philosophy

Our documentation system is designed to:
- ✅ **Minimize token usage** - Only load what's needed
- ✅ **Maximize discoverability** - Smart context-based navigation
- ✅ **Stay maintainable** - Clear structure, no duplication
- ✅ **Remain up-to-date** - Easy to update, version tracked

## 📋 Before Adding/Updating Rules

### Step 1: Determine Rule Type

Ask yourself:

1. **Is this a modification to existing rule?**
   - YES → [Update Existing Rule](#updating-existing-rules)
   - NO → Continue to step 2

2. **Is this rule critical (project-breaking if violated)?**
   - YES → Add to `.claude/rules/01-CRITICAL.md`
   - NO → Continue to step 3

3. **What category does it belong to?**
   - HTTP/API → `.claude/rules/02-http-errors.md`
   - Models/Interfaces → `.claude/rules/03-models.md`
   - Services → `.claude/rules/04-services.md`
   - Utilities → `.claude/rules/05-utils.md`
   - SCSS/Styling → `.claude/rules/06-scss.md`
   - Icons/SVG → `.claude/rules/07-icons.md`
   - New category? → [Create New Rule Category](#creating-new-rule-category)

4. **Is this an example/pattern (not a rule)?**
   - YES → Add to `.claude/context/similar-features.md`
   - NO → It's a rule

5. **Is this project inventory (what exists)?**
   - YES → Add to `.claude/context/reusable-components.md` or `.claude/context/common-patterns.md`

### Step 2: Check for Duplicates

**ALWAYS search before adding:**

```bash
# Search in all rule files
grep -r "keyword" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/.claude/rules/

# Search in context files
grep -r "keyword" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/.claude/context/

# Search in main file
grep "keyword" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/CLAUDE.md
```

**If found:**
- Update existing rule instead
- Add cross-reference if needed
- DO NOT duplicate

## ✏️ Updating Existing Rules

### Standard Update Process

1. **Read the entire section** you're updating
2. **Make your changes** in the appropriate file
3. **Update the "Last Updated" date** at the top of the section
4. **Add changelog note** if significant change

**Example:**

```markdown
## HTTP Error Handling
> **Created:** 2025-11-01 | **Last Updated:** 2025-11-15 (Added forkJoin pattern)

...rule content...
```

### Small Updates (Clarifications, Examples)

Just update the content, no date change needed:
- Fixing typos
- Adding code examples
- Clarifying existing text

### Major Updates (New Requirements, Breaking Changes)

Update date + add changelog:
- New mandatory patterns
- Deprecated approaches
- Architecture changes

**Template:**

```markdown
> **Created:** YYYY-MM-DD | **Last Updated:** YYYY-MM-DD (What changed)
```

## ➕ Adding New Rules

### Rule File Template

Every rule file must follow this structure:

```markdown
# [Category Name] Rules

> **Created:** YYYY-MM-DD | **Last Updated:** YYYY-MM-DD
> **Context Tags:** `@tag1` `@tag2` `@tag3`
> **Read when:** [When should Claude read this file]

## 🎯 Overview
Brief description of what this rule covers

## 🚨 Critical Rules

**❌ NEVER:**
- Don't do this
- Don't do that

**✅ ALWAYS:**
- Always do this
- Always do that

## 📋 Decision Tree

[Flow chart or decision tree for when to apply rules]

## 📝 Examples

### ✅ Correct Example
[Code example with explanation]

### ❌ Wrong Example
[Anti-pattern with explanation]

## 🔍 Search Checklist

Before creating [X], check:
- [ ] Location 1
- [ ] Location 2

## 📚 Related Files
- File 1: `/path/to/file`
- File 2: `/path/to/file`
```

### Context File Template

For inventory/pattern files in `.claude/context/`:

```markdown
# [Resource Name] Inventory

> **Context Tags:** `@creating-new` `@learn-project`
> **Read when:** [When should this be consulted]
> **Last Updated:** YYYY-MM-DD

## 📦 Available [Resources]

### Category 1

**Resource Name**
- Location: `/path/to/resource`
- Use for: [What it's for]
- Features: [Key features]
- Similar to: [Similar implementations]

## 🔍 Search Pattern

[How to search for these resources]

## 📋 Quick Reference

[Table or list for quick lookup]
```

## 🆕 Creating New Rule Category

When existing categories don't fit, create a new one:

### Step 1: Verify It's Truly New

Ask:
- Is this really a new category or a subcategory of existing?
- Will this have 3+ rules (worth separate file)?
- Is this permanent or temporary?

### Step 2: Choose File Number

Rules are numbered by importance:
- `01-09` - Critical, frequently referenced
- `10-19` - High priority
- `20-29` - Medium priority
- `30+` - Low priority, specific cases

### Step 3: Create Rule File

```bash
# Create new rule file
touch .claude/rules/08-my-new-category.md
```

### Step 4: Update Main Navigation

Edit `CLAUDE.md` and add your category to:

1. **Context Tags Navigator** (if applicable)
2. **Quick Reference by File Type** (if applicable)
3. **All Detailed Rules** table

**Example addition to CLAUDE.md:**

```markdown
## 📚 All Detailed Rules

| Priority | Topic | File | When to Read |
|----------|-------|------|--------------|
| 🟡 High | My New Category | [08-my-new-category.md](.claude/rules/08-my-new-category.md) | When doing X |
```

### Step 5: Update Context Tags

If your rule needs new context tags, add them to the main CLAUDE.md tags section.

### Step 6: Document in Version History

Add entry to `.claude/meta/version-history.md`:

```markdown
## 2025-11-15 - Added My New Category
- Created `.claude/rules/08-my-new-category.md`
- Added context tags: `@new-tag`
- Reason: [Why this was needed]
```

## 🏷️ Working with Context Tags

### Existing Context Tags

```yaml
# What I'm doing
@creating-new      # Creating something from scratch
@extending         # Adding to existing code
@fixing-bug        # Bug fixing
@refactoring       # Code refactoring
@learn-project     # Learning the project
@learn-patterns    # Need examples

# What type of code
@component         # Components
@service          # Services
@model            # Models/Interfaces
@styling          # SCSS/CSS
@http             # HTTP operations
@form             # Forms
@utils            # Utilities

# Quick reference
@quick-reference   # Need quick lookup
```

### Adding New Context Tag

1. **Identify the need** - Why is this tag needed?
2. **Check existing tags** - Can existing tags cover this?
3. **Name clearly** - Use verb form for actions, noun for types
4. **Update CLAUDE.md** - Add to tags section
5. **Tag relevant files** - Add to applicable rule/context files

**Example:**

```markdown
## In rule file (.claude/rules/XX-something.md)
> **Context Tags:** `@creating-new` `@my-new-tag` `@component`

## In CLAUDE.md
**"I'm doing something specific"** → `@my-new-tag + @component`
- 📖 Read: [.claude/rules/XX-something.md]()
```

## 📦 Updating Inventory Files

### When Component/Pattern Added

Update `.claude/context/reusable-components.md`:

```markdown
## 📦 Generic Components

### [Category]

- **NewComponent** - Brief description
  - Location: `/path/to/component`
  - Use for: [Use cases]
  - Features: [Key features]
  - Similar to: [Similar components]
```

### When Pattern Established

Update `.claude/context/common-patterns.md`:

```markdown
## 🔄 [Pattern Name]

**Example: ComponentName**
- Location: `/path/to/component`
- Pattern: [Pattern description]
- Use when: [When to use]

**Template:**
\`\`\`typescript
// Code template
\`\`\`
```

### When Similar Feature Implemented

Update `.claude/context/similar-features.md`:

```markdown
## 📋 [Feature Category]

**Example: FeatureName**
- Location: `/path/to/feature`
- Pattern: [Pattern used]
- Similar to: [Other similar features]

**Key implementation details:**
- Detail 1
- Detail 2
```

## 🔄 Maintenance Schedule

### Weekly
- [ ] Review recently added components → Update reusable-components.md
- [ ] Check for new patterns → Update common-patterns.md

### Monthly
- [ ] Review all rules for outdated information
- [ ] Check for duplicate rules across files
- [ ] Verify all file paths in examples are correct
- [ ] Update context tags if needed

### Quarterly
- [ ] Major review of entire system
- [ ] Consolidate related rules if needed
- [ ] Archive outdated rules
- [ ] Update Angular version references (if upgraded)

## 🚨 Critical Maintenance Rules

**NEVER:**
- ❌ Delete rules without documenting why
- ❌ Change file structure without updating CLAUDE.md
- ❌ Add rules without checking for duplicates
- ❌ Create context tags without documenting them

**ALWAYS:**
- ✅ Update dates when making changes
- ✅ Search for duplicates before adding
- ✅ Keep CLAUDE.md navigation in sync
- ✅ Document breaking changes
- ✅ Test that file paths work

## 📊 File Size Guidelines

**Target sizes to maintain performance:**

- `CLAUDE.md` - 400-500 lines max (currently ~450)
- Rule files - 300-600 lines max
- Context files - 200-400 lines max
- Guide files - 300-500 lines max

**If file exceeds limit:**
- Consider splitting into sub-categories
- Move examples to separate file
- Create cross-references instead of duplicating

## 🔍 Review Checklist

Before committing rule changes:

- [ ] Searched for duplicates
- [ ] Updated date if significant change
- [ ] Updated CLAUDE.md navigation if needed
- [ ] Added/updated context tags if applicable
- [ ] Verified file paths in examples
- [ ] Checked for broken cross-references
- [ ] File size within guidelines
- [ ] Examples are clear and correct
- [ ] No contradictions with other rules

## 📝 Version History Entry Template

When making significant changes, add to `.claude/meta/version-history.md`:

```markdown
## YYYY-MM-DD - [Change Title]

**Type:** [Rule Addition | Rule Update | Structure Change | Bug Fix]

**Files Modified:**
- `.claude/rules/XX-file.md` - [What changed]
- `CLAUDE.md` - [What changed]

**Reason:** [Why this change was needed]

**Breaking Changes:** [Yes/No - if yes, describe]

**Migration Required:** [Yes/No - if yes, describe steps]
```

## 🎓 Examples of Good Rule Additions

### Example 1: Adding New HTTP Pattern

**File:** `.claude/rules/02-http-errors.md`

```markdown
### 🔄 forkJoin Pattern (CRITICAL)
> **Added:** 2025-11-15

When combining multiple HTTP requests with `forkJoin`:

#### ✅ CORRECT Pattern:
[Code example]

**Why this matters:**
[Explanation]
```

**Also update CLAUDE.md:**
```markdown
**"Combining multiple HTTP requests"** → `@extending + @http`
- 📖 Read: [.claude/rules/02-http-errors.md#forkjoin-pattern]()
```

### Example 2: Adding New Reusable Component

**File:** `.claude/context/reusable-components.md`

```markdown
### Data Visualization

- **PieChartComponent** - Pie/Donut charts
  - Location: `/shared/components/pie-chart/`
  - Use for: Distribution analytics, percentage breakdowns
  - Features: Interactive legends, tooltips, animations
  - Similar to: BarChartComponent pattern
  - Created: 2025-11-15
```

## 🆘 Getting Help

**Questions about:**
- Which file to update? → Check decision tree in this file
- How to structure rule? → See templates above
- Context tags unclear? → Read `.claude/meta/context-tags-guide.md`
- Breaking change? → Document in version-history.md first

## 📚 Related Meta-Documentation

- [File Structure Guide](./.claude/meta/file-structure.md) - Detailed explanation of file organization
- [Context Tags Guide](./.claude/meta/context-tags-guide.md) - Deep dive into tag system
- [Version History](./.claude/meta/version-history.md) - Complete change log
