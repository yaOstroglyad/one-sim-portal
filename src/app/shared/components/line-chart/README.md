# OS Line Chart Component

## Overview

The `os-line-chart` component is a highly configurable line chart component built with Chart.js. It provides smooth animated line charts perfect for displaying trends, time series data, and continuous data visualization while following the One Sim Portal design system.

## Features

- **Smooth & Sharp Lines**: Toggle between bezier curves and straight lines
- **Multi-dataset Support**: Display multiple data series with different colors
- **Interactive Tooltips**: Hover effects with detailed information
- **Responsive Design**: Automatically adapts to container size
- **Theme Support**: Light and dark theme variants
- **Export Functionality**: Download charts as PNG or JPEG images
- **Real-time Updates**: Add/remove data points dynamically
- **Accessibility**: Screen reader support and keyboard navigation
- **Performance Optimized**: OnPush change detection strategy

## Basic Usage

```typescript
import { OsLineChartComponent, LineChartData } from '@shared/components/line-chart';

@Component({
  template: `
    <os-line-chart 
      [data]="chartData" 
      [height]="400"
      [width]="'100%'"
      [smooth]="true">
    </os-line-chart>
  `,
  imports: [OsLineChartComponent]
})
export class MyComponent {
  chartData: LineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [65, 59, 80, 81, 56],
      borderColor: '#f9a743',
      backgroundColor: 'rgba(249, 167, 67, 0.1)',
      tension: 0.4
    }]
  };
}
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | `LineChartData \| null` | `null` | Chart data following Chart.js format |
| `options` | `LineChartOptions` | `{}` | Chart configuration options |
| `width` | `number \| string` | `'100%'` | Chart container width |
| `height` | `number \| string` | `400` | Chart container height |
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `maintainAspectRatio` | `boolean` | `false` | Maintain aspect ratio |
| `theme` | `'light' \| 'dark'` | `'light'` | Color theme |
| `smooth` | `boolean` | `true` | Enable smooth bezier curves |

### Methods

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getChartInstance()` | - | `Chart \| null` | Get Chart.js instance |
| `exportAsImage()` | `format?: 'png' \| 'jpeg'` | `string \| null` | Export chart as base64 image |
| `downloadChart()` | `filename?: string, format?: 'png' \| 'jpeg'` | `void` | Download chart as image |
| `updateColors()` | `newColors: Partial<Colors>` | `void` | Update color palette |
| `getCurrentColors()` | - | `Colors` | Get current color palette |
| `setSmooth()` | `smooth: boolean` | `void` | Toggle smooth/sharp lines |
| `addDataPoint()` | `label: string, dataPoints: number[]` | `void` | Add data point to chart |
| `removeLastDataPoint()` | - | `void` | Remove last data point |

## Data Structure

### LineChartData Interface

```typescript
interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderDash?: number[];
    fill?: boolean | string | number;
    pointBackgroundColor?: string | string[];
    pointBorderColor?: string | string[];
    pointBorderWidth?: number;
    pointRadius?: number;
    pointHoverRadius?: number;
    tension?: number;
    stepped?: boolean | 'before' | 'after' | 'middle';
  }[];
}
```

## Advanced Examples

### Time Series Data

```typescript
export class TimeSeriesChartComponent {
  timeSeriesData: LineChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Active Users',
        data: [120, 80, 150, 300, 280, 200, 150],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'New Registrations',
        data: [20, 15, 35, 45, 40, 30, 25],
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  timeSeriesOptions: LineChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time of Day'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Count'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} users`;
          }
        }
      }
    }
  };
}
```

### Multi-Line Comparison

```typescript
export class ComparisonChartComponent {
  comparisonData: LineChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '2023 Revenue',
        data: [100, 120, 115, 140],
        borderColor: '#f9a743',
        borderDash: [5, 5], // Dashed line
        fill: false
      },
      {
        label: '2024 Revenue',
        data: [110, 140, 135, 170],
        borderColor: '#2dd36f',
        fill: false
      },
      {
        label: '2024 Target',
        data: [120, 130, 140, 150],
        borderColor: '#eb445a',
        borderDash: [10, 5], // Different dash pattern
        fill: false
      }
    ]
  };
}
```

### Stepped Line Chart

```typescript
export class SteppedChartComponent {
  steppedData: LineChartData = {
    labels: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
    datasets: [{
      label: 'Process Flow',
      data: [0, 25, 25, 75, 100],
      borderColor: '#3dc2ff',
      backgroundColor: 'rgba(61, 194, 255, 0.1)',
      stepped: true,
      fill: true
    }]
  };
}
```

### Real-time Data Updates

```typescript
export class RealTimeChartComponent {
  @ViewChild(OsLineChartComponent) chart!: OsLineChartComponent;
  
  private updateInterval?: number;

  ngOnInit(): void {
    this.startRealTimeUpdates();
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString();
      const randomValue = Math.floor(Math.random() * 100);
      
      this.chart.addDataPoint(timeLabel, [randomValue]);
      
      // Keep only last 10 data points
      if (this.chart.data?.labels && this.chart.data.labels.length > 10) {
        this.chart.removeLastDataPoint();
      }
    }, 2000);
  }
}
```

## Styling and Themes

### Custom Colors

```typescript
chartData: LineChartData = {
  labels: ['A', 'B', 'C', 'D'],
  datasets: [{
    label: 'Custom Colors',
    data: [10, 20, 15, 25],
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    pointBackgroundColor: '#ff6b6b',
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: 6
  }]
};
```

### Gradient Background

```typescript
// Note: Gradients need to be created in the component
ngAfterViewInit(): void {
  const canvas = this.chart.getChartInstance()?.canvas;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx?.createLinearGradient(0, 0, 0, 400);
    gradient?.addColorStop(0, 'rgba(249, 167, 67, 0.2)');
    gradient?.addColorStop(1, 'rgba(249, 167, 67, 0.0)');
    
    // Update dataset background
    this.chartData.datasets[0].backgroundColor = gradient;
  }
}
```

## Accessibility

The component includes comprehensive accessibility features:

- **ARIA labels**: `aria-label` for screen readers
- **Semantic HTML**: `role="img"` for canvas
- **Keyboard navigation**: Chart.js built-in keyboard support
- **Fallback content**: Text alternative when chart fails to load
- **High contrast support**: Adapts to system preferences

## Performance Tips

1. **Use OnPush Detection**: Implement OnPush strategy in parent components
2. **Limit Data Points**: Keep datasets under 100 points for smooth performance
3. **Debounce Updates**: Use debouncing for real-time data updates
4. **Optimize Animations**: Reduce animation duration for large datasets

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Color System Integration

The component automatically integrates with the project's color system:

```typescript
// Colors are resolved in this order:
// 1. CSS Custom Properties (--os-color-*)
// 2. LocalStorage configuration
// 3. Default color palette

// Available colors: primary, secondary, success, danger, warning, info
// Plus all Tailwind colors: red, orange, amber, yellow, lime, green, etc.
```

## Chart.js Compatibility

This component is built on Chart.js v3.9.1+ and supports all Chart.js line chart options. You can pass any valid Chart.js configuration through the `options` input.