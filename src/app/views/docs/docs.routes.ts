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
        loadComponent: () => import('./components/docs-default-redirect/docs-default-redirect.component')
          .then(m => m.DocsDefaultRedirectComponent)
      },
      {
        path: ':categoryId',
        loadComponent: () => import('./components/docs-content/docs-content.component')
          .then(m => m.DocsContentComponent)
      }
    ]
  }
];
