# Research: Public API Documentation

**Feature Branch**: `023-public-api-docs`
**Date**: 2026-01-14

## Research Summary

All technical decisions resolved. No NEEDS CLARIFICATION items from Technical Context.

---

## 1. Markdown Rendering Library

### Decision: `marked` v14+

### Rationale
- Lightweight (~40KB minified), fast parsing
- Excellent TypeScript support
- Highly configurable with custom renderers
- Active maintenance, 30k+ GitHub stars
- Can integrate with highlight.js for code blocks

### Alternatives Considered

| Library | Size | Why Not Chosen |
|---------|------|----------------|
| markdown-it | ~100KB | Larger, more complex API |
| remark | ~150KB+ | Full AST manipulation overkill for rendering |
| showdown | ~50KB | Less active maintenance |
| ngx-markdown | ~depends | Angular wrapper adds overhead, prefer direct integration |

### Integration Pattern

```typescript
import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});
```

---

## 2. Syntax Highlighting Library

### Decision: `highlight.js` v11+

### Rationale
- Industry standard for syntax highlighting
- Supports 190+ languages (JSON, bash, HTTP are key)
- Theme support via CSS (easy dark mode)
- Tree-shakable - import only needed languages
- ~20KB for core + selected languages

### Alternatives Considered

| Library | Why Not Chosen |
|---------|----------------|
| Prism.js | Requires more setup, less Angular-friendly |
| CodeMirror | Full editor, overkill for read-only display |
| Monaco | Heavy (~2MB), for editors not display |

### Language Bundle

Only import needed languages to minimize bundle:

```typescript
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import http from 'highlight.js/lib/languages/http';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('http', http);
hljs.registerLanguage('typescript', typescript);
```

---

## 3. Search Provider Architecture

### Decision: Component-level DI with DocsSearchProvider

### Rationale
- Existing `SearchProvider` interface already defined
- `SearchIndexService.registerProvider()` supports dynamic registration
- Component-level providers isolate docs search from main app search
- `CommandPaletteComponent` works unchanged

### Implementation Pattern

```typescript
// DocsLayoutComponent
@Component({
  providers: [
    DocsSearchProvider,
    {
      provide: SearchIndexService,
      useFactory: (docsProvider: DocsSearchProvider, router: Router) => {
        const service = new SearchIndexService(router);
        // Clear default providers, add only docs
        service.registerProvider(docsProvider);
        return service;
      },
      deps: [DocsSearchProvider, Router]
    }
  ]
})
export class DocsLayoutComponent { }
```

### Alternative Considered

| Approach | Why Not Chosen |
|----------|----------------|
| Global context switch | Complicates state management |
| Separate SearchService | Duplicates existing infrastructure |
| Route-based provider | Less flexible, harder to test |

---

## 4. TOC (Table of Contents) Implementation

### Decision: Parse Markdown headings on client, use IntersectionObserver for active state

### Rationale
- Headings extracted during Markdown parsing (single pass)
- IntersectionObserver is performant for scroll tracking
- No additional server-side processing needed
- Pattern used successfully in major doc sites (Docusaurus, VuePress)

### Implementation Pattern

```typescript
// Extract headings from parsed Markdown
interface TocItem {
  id: string;
  text: string;
  level: number;  // 1-6
}

// Track active section with IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.activeSection.set(entry.target.id);
      }
    });
  },
  { rootMargin: '-20% 0px -80% 0px' }
);
```

---

## 5. Theme Implementation

### Decision: Extend existing CSS variables + highlight.js themes

### Rationale
- Project already has `--layout-*` and `--os-color-*` variables
- highlight.js provides pre-built dark/light themes
- Single source of truth for theme state
- No additional theming library needed

### Implementation Pattern

```scss
// _docs-theme.scss
:root {
  --docs-code-bg: var(--layout-content-bg);
  --docs-code-border: var(--os-color-gray-200);
}

html.dark {
  --docs-code-bg: var(--os-color-gray-800);
  --docs-code-border: var(--os-color-gray-600);
}

// Import highlight.js themes conditionally
@import 'highlight.js/styles/github.css';  // light

html.dark {
  @import 'highlight.js/styles/github-dark.css';  // dark
}
```

---

## 6. Mock Data Structure

### Decision: JSON structure with Markdown content field

### Rationale
- API returns structured metadata + raw Markdown content
- Frontend parses Markdown once and caches
- Matches typical documentation API patterns (GitBook, ReadMe, etc.)
- Easy to migrate from mock to real API

### Mock Data Format

```typescript
interface DocsResponse {
  title: string;
  version: string;
  sections: DocsSection[];
}

interface DocsSection {
  id: string;
  title: string;
  content: string;  // Raw Markdown
  order: number;
  children?: DocsSection[];
}
```

---

## 7. Copy to Clipboard

### Decision: Use Clipboard API with fallback

### Rationale
- Modern Clipboard API is standard
- Fallback for older browsers via `document.execCommand`
- Visual feedback via existing notification patterns

### Implementation Pattern

```typescript
async copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    this.notification.success('common.copied');
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.notification.success('common.copied');
  }
}
```

---

## Conclusion

All research items resolved. Ready to proceed to Phase 1: Design & Contracts.

| Item | Decision | Confidence |
|------|----------|------------|
| Markdown library | marked v14 | High |
| Syntax highlighting | highlight.js v11 | High |
| Search integration | DocsSearchProvider via DI | High |
| TOC implementation | Client-side parsing + IntersectionObserver | High |
| Theme implementation | Extend CSS variables | High |
| Mock data format | JSON with Markdown content | High |
| Copy functionality | Clipboard API + fallback | High |
