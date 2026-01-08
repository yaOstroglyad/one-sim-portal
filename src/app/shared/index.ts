// Constants - no dependencies, safe to import first
export * from './constants';

// Models - organized by domain categories
export * from './models';

// Named exports for frequently used constants
export { PeriodPresets } from './models/ui/period-selector.model';

export { CommentsComponent } from './components/comments/comments.component'
export { AttachmentsComponent } from './components/attachments/attachments.component'
export * from './components/confirmation-dialog/confirmation-dialog.component'
export * from './components/timeline/timeline.component'
export * from './components/chart/chart.component'
export * from './components/bar-chart'
export * from './components/waterfall-chart'
export * from './components/line-chart'
export * from './components/chart-legend'
export * from './components/refund-product/refund-product.component'
export * from './components/empty-state/empty-state.component'
export * from './components/qr-code/qr-code.component'
export * from './components/info-strip/info-strip.component'
export * from './components/form-inputs'
export * from './components/html-dialog'
export * from './components/badge'
export * from './components/card'
export * from './components/tabs'
export * from './components/tooltip'
export * from './components/debug-display'
export * from './components/pagination'
export * from './components/datepicker'
export * from './components/period-selector/period-selector.component'
export * from './components/generic-right-panel'
export * from './components/delete-confirmation'
export * from './components/searchable-select'
export * from './components/smart-filter-header'
export * from './components/user-avatar'
export * from './components/breadcrumb/breadcrumb.component'
export * from './components/icon/icon.component'
export * from './components/contextual-text'
export * from './components/detail-row'
export * from './components/price-comparison'
export * from './components/command-palette'
export * from './components/page-header'
export * from './components/page-sub-header'
export * from './components/page-title'
export * from './components/back-button'
export * from './components/mobile-filter-button'
export * from './components/filter-drawer'

// UI Components - New organized structure
export * from './components/ui/os-dropdown'
export * from './components/ui/os-menu'

export * from './components/header-component/header.component';
export * from './pipes/format-time/format-time.pipe';
export * from './components/generic-table/generic-table.component';
export * from './components/column-control/column-control.component'
export * from './components/form-generator/form-generator.component'

export * from './components/generic-table/table-config-abstract.service';

// Services - organized by category
export * from './services/data';        // Data/API services
export * from './services/ui';          // UI/UX services
export * from './services/core';        // Core/foundational services
export * from './services/feature-toggle';  // Feature toggle service
export * from './services/cache-hub';   // Cache service
export * from './services/excel-export.service';  // Excel export service
export * from './services/search';      // Global search service

// Named exports for specific services
export { Language } from './services/ui/language.service';

// Directives
export * from './directives';

export * from './auth/permission.guard';
export * from './auth/auth.service';

export * from './auth/index';

export * from './utils/index';
