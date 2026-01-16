# Quickstart: Public API Documentation

**Feature Branch**: `023-public-api-docs`
**Date**: 2026-01-14

## Overview

This guide provides step-by-step instructions to implement the Public API Documentation feature.

---

## Prerequisites

1. Angular 21.0.5+ environment
2. Access to project repository
3. Understanding of:
   - Angular standalone components
   - Signal-based state management
   - SearchProvider interface (existing)

---

## Step 1: Install Dependencies

```bash
npm install marked highlight.js
npm install -D @types/marked
```

---

## Step 2: Create Feature Structure

```bash
mkdir -p src/app/views/docs/{docs-layout,components/{docs-header,docs-sidebar,docs-toc,docs-content,code-block},services,models}
```

---

## Step 3: Define Models

Create `src/app/views/docs/models/docs.model.ts`:

```typescript
export interface Documentation {
  readonly title: string;
  readonly version: string;
  readonly lastUpdated: string;
  readonly sections: DocSection[];
}

export interface DocSection {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly order: number;
  readonly children?: DocSection[];
}

export interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly level: number;
  readonly children: TocItem[];
}

export const DOCS_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type DocsTheme = typeof DOCS_THEMES[keyof typeof DOCS_THEMES];
```

---

## Step 4: Create DocsDataService

Create `src/app/views/docs/services/docs-data.service.ts`:

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Documentation } from '../models/docs.model';
import { MOCK_DOCUMENTATION } from './mock-docs.data';

@Injectable({ providedIn: 'root' })
export class DocsDataService {
  private readonly http = inject(HttpClient);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  getDocumentation(): Observable<Documentation> {
    // TODO: Replace with real API call
    // return this.http.get<{ data: Documentation }>('/api/public/docs')
    //   .pipe(map(res => res.data));
    return of(MOCK_DOCUMENTATION);
  }
}
```

---

## Step 5: Create DocsSearchProvider

Create `src/app/views/docs/services/docs-search.provider.ts`:

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SearchProvider, SearchResult, RESULT_SOURCES } from '@shared/services/search';
import { DocsDataService } from './docs-data.service';

@Injectable()
export class DocsSearchProvider implements SearchProvider {
  readonly name = 'docs';
  readonly priority = 0;

  private readonly docsService = inject(DocsDataService);
  private index = signal<SearchResult[]>([]);

  isAvailable(): boolean {
    return true;
  }

  search(query: string): Observable<SearchResult[]> {
    // Implement fuzzy search over documentation content
    const results = this.index()
      .filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10);
    return of(results);
  }

  rebuildIndex(): void {
    // Build search index from documentation sections
    // Called when documentation loads
  }
}
```

---

## Step 6: Create DocsLayoutComponent

Create `src/app/views/docs/docs-layout/docs-layout.component.ts`:

```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocsHeaderComponent } from '../components/docs-header/docs-header.component';
import { DocsSidebarComponent } from '../components/docs-sidebar/docs-sidebar.component';
import { DocsTocComponent } from '../components/docs-toc/docs-toc.component';
import { DocsContentComponent } from '../components/docs-content/docs-content.component';
import { DocsSearchProvider } from '../services/docs-search.provider';
import { SearchIndexService } from '@shared/services/search';
import { CommandPaletteComponent } from '@shared/components/command-palette';

@Component({
  standalone: true,
  selector: 'os-docs-layout',
  imports: [
    RouterOutlet,
    DocsHeaderComponent,
    DocsSidebarComponent,
    DocsTocComponent,
    DocsContentComponent,
    CommandPaletteComponent,
  ],
  providers: [
    DocsSearchProvider,
    // Component-level SearchIndexService with DocsSearchProvider
  ],
  templateUrl: './docs-layout.component.html',
  styleUrl: './docs-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'os-docs-layout' }
})
export class DocsLayoutComponent {
  // Implementation
}
```

---

## Step 7: Add Route to main.ts

In `src/main.ts`, add the public docs route:

```typescript
const routes: Routes = [
  // ... existing routes
  {
    path: 'docs',
    loadChildren: () => import('./app/views/docs/docs.routes')
      .then(m => m.DOCS_ROUTES)
    // NOTE: No AuthGuardService - public route
  },
  // ... rest of routes
];
```

---

## Step 8: Create docs.routes.ts

Create `src/app/views/docs/docs.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const DOCS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./docs-layout/docs-layout.component')
      .then(m => m.DocsLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview'
      },
      {
        path: ':sectionId',
        loadComponent: () => import('./components/docs-content/docs-content.component')
          .then(m => m.DocsContentComponent)
      }
    ]
  }
];
```

---

## Step 9: Add Theme Styles

Create `src/scss/_docs-theme.scss`:

```scss
@use "variables" as vars;

// Docs-specific CSS variables
:root {
  --docs-sidebar-width: 280px;
  --docs-toc-width: 220px;
  --docs-header-height: 64px;
  --docs-code-bg: var(--os-color-gray-50);
  --docs-code-border: var(--os-color-gray-200);
}

html.dark {
  --docs-code-bg: var(--os-color-gray-800);
  --docs-code-border: var(--os-color-gray-600);
}
```

Import in `styles.scss`:

```scss
@use "./docs-theme";
```

---

## Verification Checklist

- [ ] `/docs` route accessible without login
- [ ] Documentation content renders with Markdown formatting
- [ ] Code blocks have syntax highlighting
- [ ] Copy button works on code blocks
- [ ] Search (Cmd+K) finds documentation sections
- [ ] TOC navigation scrolls to sections
- [ ] Dark theme applies correctly
- [ ] Mobile layout is responsive

---

## Common Issues

### Issue: Search not finding docs content
**Solution**: Ensure `DocsSearchProvider.rebuildIndex()` is called after documentation loads.

### Issue: Syntax highlighting not working
**Solution**: Check that highlight.js languages are registered and CSS theme is imported.

### Issue: Theme flicker on load
**Solution**: Add `class="light"` (or `dark`) to `<html>` before Angular bootstraps, read from localStorage.

---

## Next Steps

After implementation:

1. Run `/speckit.tasks` to generate detailed task list
2. Run `/speckit.implement` to execute tasks
3. Test all acceptance scenarios from spec.md
