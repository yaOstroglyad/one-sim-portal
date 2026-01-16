import { Routes } from '@angular/router';

export const DOCS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./docs-layout/docs-layout.component')
      .then(m => m.DocsLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'public-api',
        pathMatch: 'full'
      },
      {
        path: ':categoryId',
        loadComponent: () => import('./components/docs-content/docs-content.component')
          .then(m => m.DocsContentComponent)
      }
    ]
  }
];
