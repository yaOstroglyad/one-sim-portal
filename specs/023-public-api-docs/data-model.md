# Data Model: Public API Documentation

**Feature Branch**: `023-public-api-docs`
**Date**: 2026-01-14

## Overview

This document defines the data structures for the Public API Documentation feature. All models follow project conventions (const types, readonly where appropriate).

---

## Core Entities

### Documentation (Root)

```typescript
/**
 * Root documentation response from API
 */
export interface Documentation {
  readonly title: string;
  readonly version: string;
  readonly lastUpdated: string;  // ISO date
  readonly sections: DocSection[];
}
```

### DocSection

```typescript
/**
 * A section of documentation (e.g., "Balance API", "Product API")
 */
export interface DocSection {
  readonly id: string;           // URL-safe slug (e.g., "balance-api")
  readonly title: string;        // Display title
  readonly content: string;      // Raw Markdown content
  readonly order: number;        // Sort order
  readonly children?: DocSection[];  // Subsections
}
```

### TocItem (Table of Contents)

```typescript
/**
 * Table of contents item extracted from Markdown headings
 */
export interface TocItem {
  readonly id: string;      // Anchor ID (slugified heading)
  readonly text: string;    // Heading text
  readonly level: number;   // Heading level (1-6)
  readonly children: TocItem[];
}
```

### DocSearchResult

```typescript
/**
 * Search result for documentation content
 * Extends base SearchResult for compatibility with SearchProvider
 */
export interface DocSearchResult {
  readonly id: string;
  readonly sectionId: string;
  readonly title: string;
  readonly excerpt: string;      // Highlighted text snippet
  readonly url: string;          // Route with fragment
  readonly matchScore: number;
}
```

---

## API Response Types

### GetDocumentationResponse

```typescript
/**
 * Response from GET /api/public/docs
 */
export interface GetDocumentationResponse {
  readonly data: Documentation;
}
```

### GetSectionResponse

```typescript
/**
 * Response from GET /api/public/docs/sections/:id
 */
export interface GetSectionResponse {
  readonly data: DocSection;
}
```

---

## UI State Models

### DocsState

```typescript
/**
 * Documentation page state (managed via signals)
 */
export interface DocsState {
  documentation: Documentation | null;
  currentSectionId: string | null;
  activeTocId: string | null;
  isLoading: boolean;
  error: string | null;
}
```

### DocsTheme

```typescript
/**
 * Theme options for documentation
 */
export const DOCS_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type DocsTheme = typeof DOCS_THEMES[keyof typeof DOCS_THEMES];
```

---

## Navigation Models

### DocNavItem

```typescript
/**
 * Navigation item for sidebar
 */
export interface DocNavItem {
  readonly id: string;
  readonly title: string;
  readonly url: string;
  readonly icon?: string;
  readonly children?: DocNavItem[];
  readonly isExpanded?: boolean;
}
```

---

## Entity Relationships

```
Documentation (1)
    │
    └── sections (1:N) ─── DocSection
                              │
                              └── children (1:N) ─── DocSection (recursive)

DocSection ──extracts──> TocItem[] (client-side, from Markdown headings)

DocSection ──indexes──> DocSearchResult[] (client-side, for search)
```

---

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| DocSection | id | Required, URL-safe slug, unique within parent |
| DocSection | content | Required, valid Markdown |
| DocSection | order | Required, positive integer |
| TocItem | level | 1-6 (h1-h6) |

---

## State Transitions

### Documentation Loading

```
INITIAL → LOADING → LOADED
                 ↘ ERROR
```

| State | Trigger | Next State |
|-------|---------|------------|
| INITIAL | Page mount | LOADING |
| LOADING | API success | LOADED |
| LOADING | API error | ERROR |
| ERROR | Retry click | LOADING |
| LOADED | Section change | (stays LOADED, updates currentSectionId) |

---

## File Location

```
src/app/views/docs/models/
├── docs.model.ts           # All interfaces defined above
└── index.ts                # Barrel export
```

Following project convention: domain-specific models in feature folder.
