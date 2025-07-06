# OS Bar Chart Component

## Overview

The `os-bar-chart` component is a reusable, highly configurable bar chart component built with Chart.js. It follows the One Sim Portal design system and provides extensive customization options while maintaining consistency with the application's architecture.

## Features

- **Flexible Data Input**: Accepts Chart.js compatible data structures
- **Responsive Design**: Automatically adapts to container size
- **Theme Support**: Light and dark theme variants
- **Chart Types**: Both vertical and horizontal bar charts
- **Customizable Options**: Extensive configuration for styling and behavior
- **Accessibility**: Screen reader support and keyboard navigation
- **Export Functionality**: Download charts as PNG or JPEG images
- **Performance Optimized**: OnPush change detection strategy

## Usage

### Basic Usage

```typescript
import { OsBarChartComponent, BarChartData } from '@shared/components/bar-chart';

@Component({
  template: `
    <os-bar-chart 
      [data]="chartData" 
      [height]="400"
      [width]="'100%'">
    </os-bar-chart>
  `,
  imports: [OsBarChartComponent]
})
export class MyComponent {
  chartData: BarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [65, 59, 80, 81, 56],
      backgroundColor: 'var(--os-color-primary)'
    }]
  };
}
```

### Advanced Configuration

```typescript
export class AdvancedChartComponent {
  chartData: BarChartData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Q1 Sales',
        data: [120, 190, 30, 50],
        backgroundColor: 'var(--os-color-primary)',
        borderColor: 'var(--os-color-primary-shade)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Q2 Sales',
        data: [80, 140, 60, 90],
        backgroundColor: 'var(--os-color-secondary)',
        borderColor: 'var(--os-color-secondary-shade)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  chartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} units`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales (Units)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Products'
        }
      }
    }
  };
}
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `BarChartData \| null` | `null` | Chart data following Chart.js format |
| `options` | `BarChartOptions` | `{}` | Chart configuration options |
| `width` | `number \| string` | `'100%'` | Chart container width |
| `height` | `number \| string` | `400` | Chart container height |
| `chartType` | `'bar' \| 'horizontalBar'` | `'bar'` | Chart orientation |
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `maintainAspectRatio` | `boolean` | `false` | Maintain aspect ratio |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getChartInstance()` | - | `Chart \| null` | Get Chart.js instance |
| `exportAsImage()` | `format?: 'png' \| 'jpeg'` | `string \| null` | Export chart as base64 image |
| `downloadChart()` | `filename?: string, format?: 'png' \| 'jpeg'` | `void` | Download chart as image |

## Data Structure

### BarChartData Interface

```typescript
interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderRadius?: number;
    barThickness?: number;
    maxBarThickness?: number;
  }[];
}
```

### BarChartOptions Interface

The options interface provides comprehensive configuration for:

- **Responsive behavior**: `responsive`, `maintainAspectRatio`
- **Chart orientation**: `indexAxis` ('x' or 'y')
- **Plugin configuration**: `legend`, `tooltip`, `datalabels`
- **Scale configuration**: `x` and `y` axis settings
- **Animation settings**: `duration`, `easing`
- **Interaction modes**: `intersect`, `mode`
- **Layout padding**: `padding` configuration

## Styling

### CSS Classes

- `.os-bar-chart`: Main container
- `.os-bar-chart__container`: Chart wrapper
- `.os-bar-chart__canvas`: Canvas element
- `.os-bar-chart__fallback`: Fallback content

### Theme Variants

- `.os-bar-chart--dark`: Dark theme styling
- `.os-bar-chart--loading`: Loading state
- `.os-bar-chart--error`: Error state
- `.os-bar-chart--no-data`: No data state

### Size Variants

- `.os-bar-chart--small`: 150px min height
- `.os-bar-chart--medium`: 300px min height
- `.os-bar-chart--large`: 400px min height
- `.os-bar-chart--xl`: 500px min height

## Examples

### Horizontal Bar Chart

```html
<os-bar-chart 
  [data]="chartData" 
  chartType="horizontalBar"
  [height]="300">
</os-bar-chart>
```

### Custom Colors

```typescript
chartData: BarChartData = {
  labels: ['Team A', 'Team B', 'Team C'],
  datasets: [{
    label: 'Performance',
    data: [85, 92, 78],
    backgroundColor: [
      'var(--os-color-success)',
      'var(--os-color-primary)',
      'var(--os-color-warning)'
    ],
    borderColor: [
      'var(--os-color-success-shade)',
      'var(--os-color-primary-shade)',
      'var(--os-color-warning-shade)'
    ],
    borderWidth: 2,
    borderRadius: 8
  }]
};
```

### Export Functionality

```typescript
export class ChartExportComponent {
  @ViewChild(OsBarChartComponent) chart!: OsBarChartComponent;

  exportChart(): void {
    this.chart.downloadChart('sales-report', 'png');
  }

  getChartImage(): string | null {
    return this.chart.exportAsImage('jpeg');
  }
}
```

## Accessibility

The component includes:

- **ARIA labels**: `aria-label` for screen readers
- **Semantic HTML**: `role="img"` for canvas
- **Keyboard navigation**: Chart.js built-in keyboard support
- **High contrast support**: Adapts to system preferences
- **Fallback content**: Text alternative when chart fails to load

## Performance

- **OnPush Change Detection**: Minimizes unnecessary re-renders
- **Efficient Updates**: Only re-renders when data or options change
- **Memory Management**: Proper cleanup of Chart.js instances
- **Lazy Loading**: Chart initializes only when visible

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Dependencies

- Chart.js v3.9.1+
- Angular 16+
- TypeScript 4.9+

## Best Practices

1. **Use CSS Variables**: Always use project color variables for consistent theming
2. **Responsive Design**: Set appropriate width/height for your layout
3. **Data Validation**: Validate data before passing to component
4. **Performance**: Use OnPush detection strategy in parent components
5. **Accessibility**: Provide meaningful labels and descriptions
6. **Error Handling**: Handle empty or invalid data gracefully

## Troubleshooting

### Common Issues

1. **Chart not rendering**: Check that data is properly formatted
2. **Poor performance**: Ensure parent component uses OnPush strategy
3. **Styling issues**: Verify CSS variables are properly imported
4. **Responsive issues**: Check container CSS and component settings

### Debug Methods

```typescript
// Get Chart.js instance for debugging
const chartInstance = this.chart.getChartInstance();
console.log(chartInstance?.data);

// Check if chart is initialized
if (chartInstance) {
  console.log('Chart is ready');
}
```