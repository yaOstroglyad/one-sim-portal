---
name: review-code
description: Reviews Angular code against One-Sim-Portal project standards from constitution.md. Use when asked to review code, check code, validate code, code review, or audit code.
allowed-tools: Read, Glob, Grep
---

# Review Code

Review Angular code for compliance with project standards.

> **Rules Reference:** ALL rules are defined in `constitution.md`.
> This skill provides the **procedure** for reviewing code against those rules.

## Procedure

1. **Read the file(s)** to be reviewed
2. **Check against constitution.md** rules (see checklist below)
3. **Note violations** with line numbers
4. **Provide fix suggestions**
5. **Generate summary** with severity levels

## Review Checklist (from constitution.md)

### Section II: Component Architecture

| Rule | What to Check |
|------|---------------|
| Standalone | `standalone: true` present |
| OnPush | `changeDetection: ChangeDetectionStrategy.OnPush` |
| inject() | No constructor injection (except Interceptors) |
| Selector prefix | `os-` not `app-` |
| Signal APIs | `input()`, `output()`, `signal()`, `computed()` |
| Member ordering | Follows "Code Organization Order" |
| Control flow | `@if/@for` not `*ngIf/*ngFor` |
| Host display | `:host { display: block }` for block-level |

### Section III: Error Handling

| Rule | What to Check |
|------|---------------|
| Services | Do NOT show notifications |
| Components | Use NotificationService with i18n keys |
| No hardcoded | All messages use translation keys |

### Section VII: SCSS

| Rule | What to Check |
|------|---------------|
| @use syntax | `@use "variables"` not `@import` |
| CSS variables | `var(--os-color-*)` not hardcoded hex |
| Mixins | Use existing mixins, no duplication |
| BEM naming | `.os-component__element--modifier` |

### Section IV: Models

| Rule | What to Check |
|------|---------------|
| as const | Use const objects, not inline unions/enums |
| Location | Reusable in `/shared/models/` |

## Output Format

```markdown
## Code Review: {file_path}

### 🔴 Critical (must fix)
- Line XX: {issue} → {fix}

### 🟡 Warning (should fix)
- Line XX: {issue} → {fix}

### ✅ Good Practices
- {what's done correctly}

### Summary
- Critical: X | Warnings: X | Score: X/10
```

## Severity Levels

| Level | Constitution Section | Action |
|-------|---------------------|--------|
| 🔴 Critical | Marked "NON-NEGOTIABLE" | Must fix |
| 🟡 Warning | Best practice | Should fix |
| 🟢 Info | Suggestion | Nice to have |
