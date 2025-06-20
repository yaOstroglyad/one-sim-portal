# Generic Table Component

## Overview

The `generic-table` component is a powerful, reusable Angular table component designed to mimic the visual appearance and functionality of AG-Grid while maintaining simplicity and flexibility. It serves as the standard table component across the One Sim Portal application.

## Component Architecture

### Core Files
- `generic-table.component.ts` - Main component logic (129 lines)
- `generic-table.component.html` - Template with AG-Grid-like structure (176 lines)
- `generic-table.component.scss` - Styling (empty, uses global AG-Grid styles)
- `table-config-abstract.service.ts` - Abstract service for table configuration
- `generic-table.module.ts` - Angular module with dependencies

### Key Dependencies
- CoreUI Angular (Table, Pagination, Card components)
- Angular Translation (ngx-translate)
- Custom pipes (FormatTime, DisplayValueByKey)
- Icon support (@coreui/icons-angular)

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
- **Sorting**: Client-side column sorting with visual indicators
- **Selection**: Row selection with checkboxes (single/multiple)
- **Pagination**: Server-side and client-side pagination support
- **Custom Templates**: Support for custom cell templates and toolbar content

### Interactive Elements
- **Row Actions**: Edit buttons and custom menus
- **Row Clicking**: Configurable row click events
- **Toolbar**: Custom toolbar with add buttons and custom content projection

## Technical Implementation

### Component Interface

```typescript
@Input() config$: Observable<TableConfig>        // Table configuration
@Input() data$: Observable<any[]>               // Table data
@Input() menu: TemplateRef<any>                 // Custom menu template
@Input() isRowClickable: boolean = false        // Enable row clicking

@Output() selectedItemsChange: EventEmitter<any[]>          // Selection changes
@Output() onRowClickEvent: EventEmitter<any>                // Row click events
@Output() toggleAction: EventEmitter<any>                   // Edit actions
@Output() pageChange: EventEmitter<PageChangeEvent>         // Pagination
@Output() sortChange: EventEmitter<SortChangeEvent>         // Sorting
```

### Column Configuration

The component uses a `TableConfig` interface that defines:
- Column visibility and headers
- Data types (text, date, time, custom)
- Sorting capabilities
- Width and minimum width settings
- Custom templates
- Translation prefixes

### State Management

- **Selection State**: Uses Set<any> for efficient selection tracking
- **Pagination State**: Tracks current page, page size, and total pages
- **Sort State**: Maintains sort direction per column
- **View Model**: Combines configuration and data using RxJS combineLatest

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

## Future Enhancements

Potential improvements identified:
- Virtual scrolling for large datasets
- Column resizing functionality
- Advanced filtering capabilities
- Export functionality
- Cell editing capabilities
- Group headers support

## Maintenance Notes

- Component follows Angular best practices
- Comprehensive type safety with TypeScript
- Reactive programming patterns throughout
- Clean separation of concerns
- Extensible architecture for future features 