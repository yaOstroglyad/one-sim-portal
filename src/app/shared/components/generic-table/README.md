# Generic Table Component (AG-Grid Style)

Reusable Angular table component with AG-Grid visual styling, reactive data handling, and advanced features.

## Features

- **AG-Grid Visual Style**: Identical look and feel to AG-Grid
- **Generic TypeScript**: Type-safe with `GenericTableComponent<T extends TableRow>`
- **Column Sorting**: Multi-column sorting with visual indicators
- **Footer Aggregations**: Sum, average, count, min, max with currency conversion support
- **Custom Tooltips**: Detailed breakdowns on footer values
- **Row Selection**: Single/multiple selection with checkboxes
- **Pagination**: Server-side and client-side support
- **Custom Templates**: Cell templates and toolbar customization
- **Responsive Design**: Mobile-friendly with horizontal scroll
- **RTL Support**: Right-to-left language support
- **Loading States**: Built-in spinner and empty state handling
- **OnPush Change Detection**: Optimized performance

## Architecture

### Component Structure
```
generic-table/
├── generic-table.component.ts     # Main component with generic type support
├── generic-table.component.html   # Template with AG-Grid structure
├── generic-table.component.scss   # Styles (footer-specific)
├── helpers/
│   ├── table-footer-aggregation.helper.ts  # Footer calculations
│   └── table.utils.ts                      # Utility functions
└── models/
    └── table-row.interface.ts              # Type definitions
```

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, AggregationType } from '@shared/models';

interface MyData {
  id: string;
  name: string;
  price: number;
  currency: string;
  createdAt: Date;
}

@Component({
  selector: 'my-table',
  template: `
    <generic-table
      [config$]="tableConfig$"
      [data$]="tableData$"
      [isRowClickable]="true"
      (sortChange)="onSort($event)"
      (pageChange)="onPageChange($event)"
      (onRowClickEvent)="onRowClick($event)">
    </generic-table>
  `
})
export class MyTableComponent {
  tableConfig$ = new BehaviorSubject<TableConfig>({
    columns: [
      {
        key: 'id',
        header: 'ID',
        visible: true,
        sortable: true,
        width: '80px'
      },
      {
        key: 'name',
        header: 'Name',
        visible: true,
        sortable: true,
        templateType: TemplateType.Text
      },
      {
        key: 'price',
        header: 'Price',
        visible: true,
        sortable: true,
        width: '120px'
      },
      {
        key: 'createdAt',
        header: 'Created',
        visible: true,
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/yyyy'
      }
    ],
    pagination: {
      enabled: true,
      serverSide: true,
      totalPages: 10
    }
  });

  tableData$ = new BehaviorSubject<MyData[]>([
    { id: '1', name: 'Item 1', price: 100, currency: 'USD', createdAt: new Date() },
    { id: '2', name: 'Item 2', price: 200, currency: 'EUR', createdAt: new Date() }
  ]);

  onSort(event: SortChangeEvent): void {
    console.log('Sort:', event);
  }

  onPageChange(event: PageChangeEvent): void {
    console.log('Page:', event);
  }

  onRowClick(item: MyData): void {
    console.log('Clicked:', item);
  }
}
```

## Footer Aggregations

### Simple Aggregations

```typescript
tableConfig$ = new BehaviorSubject<TableConfig>({
  columns: [
    { key: 'quantity', header: 'Quantity', visible: true },
    { key: 'price', header: 'Price', visible: true }
  ],
  footer: {
    enabled: true,
    label: 'Total',
    aggregations: [
      {
        columnKey: 'quantity',
        type: AggregationType.Sum
      },
      {
        columnKey: 'price',
        type: AggregationType.Sum,
        formatFn: (value) => `$${value.toFixed(2)}`
      }
    ]
  }
});
```

### Advanced: Currency Conversion with Tooltips

For complex scenarios like multi-currency totals, use `customValues` and `customTooltips`:

```typescript
// In your component
private updateFooterValues(data: MyData[]): void {
  const result = this.calculateWithCurrencyConversion(data);

  const currentConfig = this.tableConfig$.value;
  if (currentConfig.footer) {
    currentConfig.footer.customValues = result.values;
    currentConfig.footer.customTooltips = result.tooltips;
    this.tableConfig$.next({...currentConfig});
  }
}

private calculateWithCurrencyConversion(data: MyData[]): {
  values: Record<string, string>,
  tooltips?: Record<string, string>
} {
  // Group by currency
  const priceByCurrency: Record<string, number> = {};
  let totalInBaseCurrency = 0;

  data.forEach(item => {
    const price = parseFloat(item.price) || 0;
    const currency = item.currency;

    priceByCurrency[currency] = (priceByCurrency[currency] || 0) + price;

    // Convert to EUR
    const converted = CurrencyPriceCalculatorUtils.convertCurrency(
      price, currency, 'EUR', exchangeRates
    );
    totalInBaseCurrency += converted.convertedAmount;
  });

  return {
    values: {
      price: `€${totalInBaseCurrency.toFixed(2)}`
    },
    tooltips: {
      price: Object.entries(priceByCurrency)
        .map(([curr, val]) => `${val.toFixed(2)} ${curr}`)
        .join(' + ')
    }
  };
}
```

See `bundle-purchases.strategy.ts` for real-world example.

## Custom Toolbar

```html
<generic-table
  [config$]="tableConfig$"
  [data$]="tableData$">
  <ng-container custom-toolbar>
    <button class="ag-grid-button" (click)="onExport()">
      Export
    </button>
  </ng-container>
</generic-table>
```

## Generic Type Support

Component is fully generic for type safety:

```typescript
export class GenericTableComponent<T extends TableRow = TableRow> {
  @Input() data$!: Observable<T[]>;
  @Output() selectedItemsChange = new EventEmitter<T[]>();
  @Output() onRowClickEvent = new EventEmitter<T>();
}
```

Usage:
```typescript
@ViewChild(GenericTableComponent) table!: GenericTableComponent<MyData>;
```

## Helper Classes

### TableUtils
Utility functions used internally:
- `trackById()` - TrackBy function for ngFor
- `isEven()`, `isOdd()` - Row styling helpers
- `getMinRows()` - Calculate minimum rows to display
- `setSortDirection()` - Initialize sort directions

### TableFooterAggregationHelper
Footer calculation logic:
- `calculateAggregation()` - Perform aggregation calculation
- `getAggregationValue()` - Get formatted aggregation value
- `getAggregationTooltip()` - Get tooltip text

## CSS Variables

```scss
:root {
  --ag-header-height: 42px;
  --ag-row-height: 36px;
  --ag-header-background-color: #f8f8f8;
  --ag-odd-row-background-color: #f9f9f9;
  --ag-row-border-color: #e2e2e2;
  --ag-selected-row-background-color: rgba(var(--os-color-primary-rgb), 0.1);
  --ag-row-hover-color: rgba(var(--os-color-primary-rgb), 0.05);

  // Footer
  --os-color-border: #e2e2e2;
}
``` 