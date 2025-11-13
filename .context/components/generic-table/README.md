# Generic Table Component

## Overview

The `generic-table` component is a powerful, reusable Angular table component designed to mimic the visual appearance and functionality of AG-Grid while maintaining simplicity and flexibility. It serves as the standard table component across the One Sim Portal application.

## Component Architecture

### Core Files
- `generic-table.component.ts` - Main component with generic type support (167 lines)
- `generic-table.component.html` - Template with AG-Grid structure and footer support
- `generic-table.component.scss` - Footer-specific styles
- `helpers/table-footer-aggregation.helper.ts` - Footer calculations and aggregations
- `helpers/table.utils.ts` - Utility functions (trackBy, sorting, etc.)
- `models/table-row.interface.ts` - Type definitions (TableRow, PageChangeEvent, SortChangeEvent)
- `table-config-abstract.service.ts` - Abstract service for table configuration

### Key Dependencies
- Angular 19.2.15 (standalone components, OnPush change detection)
- CoreUI Angular (Table, Pagination directives)
- Angular Translation (@ngx-translate/core)
- Custom pipes (FormatTime, DisplayValueByKey)
- Icon support (@coreui/icons-angular)
- RxJS (combineLatest, Observable, BehaviorSubject)

## Features

### Visual Design
- **AG-Grid Aesthetic**: Identical visual styling to AG-Grid with proper CSS variables
- **Row Styling**: Alternating row colors with hover and selection states
- **Responsive Design**: Mobile-friendly with horizontal scroll for wide tables
- **RTL Support**: Right-to-left language support

### Data Management
- **Observable-based**: Uses RxJS Observables for reactive data handling
- **Track by ID**: Optimized rendering with trackBy function
- **Loading States**: Built-in loading indicator and empty state handling

### Table Features
- **Column Configuration**: Highly configurable columns with visibility, width, and type settings
- **Sorting**: Client-side and server-side column sorting with visual indicators
- **Selection**: Row selection with checkboxes (single/multiple) using Set for O(1) operations
- **Pagination**: Server-side and client-side pagination support with page size configuration
- **Custom Templates**: Support for custom cell templates and toolbar content projection
- **Footer Aggregations**: Sum, average, count, min, max with custom formatting
- **Advanced Footer**: Currency conversion with multi-currency tooltips
- **Generic Types**: Full TypeScript type safety with `GenericTableComponent<T extends TableRow>`

### Interactive Elements
- **Row Actions**: Edit buttons and custom menus
- **Row Clicking**: Configurable row click events
- **Toolbar**: Custom toolbar with add buttons and custom content projection

## Technical Implementation

### Component Interface

```typescript
export class GenericTableComponent<T extends TableRow = TableRow> implements OnChanges {
  // Inputs
  @Input() config$!: Observable<TableConfig>;
  @Input() data$!: Observable<T[]>;
  @Input() menu!: TemplateRef<any>;
  @Input() isRowClickable = false;

  // Content Projection
  @ContentChild('[custom-toolbar]', { read: TemplateRef })
  public customToolbarTpl?: TemplateRef<any>;

  // Outputs
  @Output() selectedItemsChange = new EventEmitter<T[]>();
  @Output() onRowClickEvent = new EventEmitter<T>();
  @Output() toggleAction = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<PageChangeEvent>();
  @Output() sortChange = new EventEmitter<SortChangeEvent>();

  // State
  public viewModel$!: Observable<{ config: TableConfig; data: T[] }>;
  public currentPage = 0;
  public pageSize = 15;
  public totalPages = 0;
  public selectedItems = new Set<T>();
}
```

### Column Configuration

The component uses a `TableConfig` interface that defines:
- Column visibility and headers
- Data types (text, date, time, custom)
- Sorting capabilities (sortable, sortDirection)
- Width and minimum width settings
- Custom templates
- Translation prefixes
- Footer configuration (aggregations, customValues, customTooltips)

### State Management

- **Selection State**: Uses `Set<T>` for O(1) add/delete/lookup operations
- **Pagination State**: Tracks current page (default 0), page size (default 15), and total pages
- **Sort State**: Maintains sort direction per column ('asc' | 'desc' | null)
- **View Model**: Combines configuration and data using RxJS `combineLatest`
- **Footer State**: Dynamic updates via config subject for custom values and tooltips

## Usage Patterns

### Basic Implementation
```typescript
export class MyTableComponent {
  tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      { key: 'id', header: 'ID', visible: true, sortable: true },
      { key: 'name', header: 'Name', visible: true, templateType: 'text' }
    ],
    showCheckboxes: true,
    showEditButton: true,
    pagination: { enabled: true, serverSide: true }
  });

  tableData$ = new BehaviorSubject<any[]>([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' }
  ]);
}
```

### Advanced Features
- Custom cell templates via `templateType: 'custom'`
- Toolbar customization with content projection
- Server-side pagination with page change events
- Multi-column sorting with direction indicators

## Integration with Application

### Common Use Cases
- **Company Management**: Display hierarchical company structures
- **Customer Lists**: Show customer data with CRM integration
- **Order Management**: Display order chains and relationships
- **Product Catalogs**: Show product templates and customizations
- **User Management**: Administrative user interfaces

### Service Integration
The `TableConfigAbstractService` provides:
- Column visibility management
- Data filtering capabilities
- Configuration updates
- Pagination handling

## Performance Considerations

- **Change Detection**: Uses OnPush strategy for optimal performance
- **Track By**: Implements trackById for efficient list rendering
- **Observable Patterns**: Reactive data flow prevents unnecessary updates
- **Lazy Rendering**: Only renders visible columns and rows

## Styling System

Uses CSS custom properties for theming:
```scss
--ag-header-height: 42px
--ag-row-height: 36px
--ag-header-background-color: #f8f8f8
--ag-odd-row-background-color: #f9f9f9
--ag-selected-row-background-color: rgba(primary, 0.1)
```

## Recent Updates (2025-11-13)

### Refactoring
- Extracted footer logic to `TableFooterAggregationHelper`
- Extracted utilities to `TableUtils`
- Created type definitions in `table-row.interface.ts`
- Made component fully generic: `GenericTableComponent<T extends TableRow>`
- Improved code organization with clear section comments

### Footer Aggregations
- Added `AggregationType` enum (Sum, Average, Count, Min, Max)
- Support for simple aggregations via config
- Hybrid approach: `customValues` for complex calculations (like currency conversion)
- Tooltip support via `customTooltips` for detailed breakdowns
- Visual indicators (dotted underline, help cursor) for cells with tooltips

### Type Safety Improvements
- All event emitters now use proper generic types
- Created `PageChangeEvent` and `SortChangeEvent` interfaces
- Table data properly typed as `Observable<T[]>`
- Selection state uses `Set<T>` instead of `Set<any>`

## Future Enhancements

Potential improvements identified:
- Virtual scrolling for large datasets
- Column resizing functionality
- Advanced filtering capabilities (search, multi-filter)
- Cell editing capabilities (inline editing)
- Group headers support
- Column pinning (freeze columns)

## Maintenance Notes

- Component follows Angular 19 best practices (standalone, inject(), OnPush)
- Comprehensive type safety with generic TypeScript
- Reactive programming patterns throughout (Observables, BehaviorSubject)
- Clean separation of concerns (helpers, models, component)
- Extensible architecture for future features
- Helper classes are stateless with static methods for testability 