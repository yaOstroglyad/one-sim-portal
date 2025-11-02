import { Routes } from '@angular/router';
import { ADMIN_PERMISSION } from '@shared';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    data: {
      title: 'nav.dashboard'
    },
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'reports',
    data: {
      title: 'nav.reports'
    },
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'admin-overview',
    data: {
      title: 'nav.adminOverview',
      permissions: [ADMIN_PERMISSION]
    },
    loadComponent: () => import('./admin-overview/admin-overview.component').then(m => m.AdminOverviewComponent)
  }
];
