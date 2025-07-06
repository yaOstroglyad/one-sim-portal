# OS Bar Chart - Color System

## Overview

The `os-bar-chart` component uses a sophisticated color system that automatically resolves colors from multiple sources to ensure proper rendering in Chart.js canvas context.

## Why CSS Variables Don't Work in Chart.js

Chart.js renders graphics in a `<canvas>` element, which doesn't have access to CSS variables like regular DOM elements. This is why using `var(--os-color-primary)` directly in chart configurations results in black/default colors.

## Color Resolution Strategy

The component uses a multi-layered approach to resolve colors:

### 1. Default Color Palette
```typescript
private colors = {
  // Project semantic colors
  primary: '#f9a743',
  secondary: '#3dc2ff', 
  success: '#2dd36f',
  danger: '#eb445a',
  warning: '#ffc409',
  info: '#3dc2ff',
  
  // Tailwind-inspired colors
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  // ... more colors
};
```

### 2. LocalStorage Configuration
```typescript
constructor() {
  // Get primary color from view configuration
  const viewConfig = this.localStorageService.retrieve('viewConfig');
  if (viewConfig?.primaryColor) {
    this.colors.primary = viewConfig.primaryColor;
  }
}
```

### 3. CSS Variable Resolution
```typescript
private loadColorsFromCSS(): void {
  const style = getComputedStyle(document.documentElement);
  
  const cssVarMap = {
    primary: '--os-color-primary',
    secondary: '--os-color-secondary',
    success: '--os-color-success',
    // ... more mappings
  };

  Object.entries(cssVarMap).forEach(([colorName, cssVar]) => {
    const cssValue = style.getPropertyValue(cssVar).trim();
    if (cssValue && cssValue !== '') {
      this.colors[colorName] = cssValue;
    }
  });
}
```

## Usage Examples

### Automatic Color Assignment
```typescript
// Component automatically assigns colors based on dataset index
chartData: BarChartData = {
  labels: ['A', 'B', 'C'],
  datasets: [{
    label: 'Data',
    data: [10, 20, 30],
    // No backgroundColor specified - component assigns automatically
  }]
};
```

### Manual Color Assignment
```typescript
chartData: BarChartData = {
  labels: ['A', 'B', 'C'], 
  datasets: [{
    label: 'Data',
    data: [10, 20, 30],
    backgroundColor: '#f9a743', // Use hex values for Chart.js
    borderColor: '#e6962e'
  }]
};
```

### Multi-Dataset with Different Colors
```typescript
chartData: BarChartData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Sales',
      data: [100, 200, 150, 300],
      backgroundColor: '#f9a743', // Primary
      borderColor: '#e6962e'
    },
    {
      label: 'Profit', 
      data: [50, 80, 70, 120],
      backgroundColor: '#2dd36f', // Success
      borderColor: '#25b760'
    }
  ]
};
```

## Dynamic Color Updates

### Update Component Colors
```typescript
@ViewChild(OsBarChartComponent) chart!: OsBarChartComponent;

updateChartColors(): void {
  this.chart.updateColors({
    primary: '#ff6b6b',
    success: '#51cf66'
  });
}
```

### Get Current Colors
```typescript
getCurrentColors(): void {
  const colors = this.chart.getCurrentColors();
  console.log('Current primary color:', colors.primary);
}
```

## Color Generation Utilities

### Automatic Border Colors
The component automatically generates darker border colors:
```typescript
private darkenColor(color: string, percent: number): string {
  // Converts hex to RGB, darkens by percentage, converts back
  // Example: '#f9a743' with 20% darkening = '#e6962e'
}
```

### Color Assignment Algorithm
```typescript
private getDefaultColor(index: number): string {
  const colorKeys = [
    'primary', 'secondary', 'success', 'info', 
    'warning', 'danger', 'blue', 'green',
    'orange', 'purple', 'pink', 'cyan'
  ];
  const colorKey = colorKeys[index % colorKeys.length];
  return this.colors[colorKey];
}
```

## Best Practices

### ✅ Do
- Use hex color values in chart data configurations
- Let the component assign colors automatically for simple charts
- Use the `updateColors()` method for dynamic theming
- Test colors in both light and dark themes

### ❌ Don't
- Use CSS variables directly in chart configurations
- Hardcode colors that don't match the project palette
- Forget to provide fallback colors for dynamic data

## Theme Integration

The component integrates with the project's theming system:

```typescript
// Component automatically loads colors from:
// 1. LocalStorage view configuration
// 2. CSS custom properties
// 3. Default color palette (fallback)

// Colors are applied in this priority order:
// CSS Variables > LocalStorage > Default Palette
```

## Color Palette Reference

### Semantic Colors
- **Primary**: `#f9a743` (Project orange)
- **Secondary**: `#3dc2ff` (Light blue) 
- **Success**: `#2dd36f` (Green)
- **Danger**: `#eb445a` (Red)
- **Warning**: `#ffc409` (Yellow)
- **Info**: `#3dc2ff` (Cyan)

### Extended Palette
All Tailwind colors are available: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, zinc.

## Troubleshooting

### Charts Show Black/Gray Colors
**Problem**: Using CSS variables in chart data  
**Solution**: Use hex values instead of `var(--color-name)`

### Colors Don't Match Theme
**Problem**: Colors not updating with theme changes  
**Solution**: Use `updateColors()` method or recreate chart data

### Performance Issues
**Problem**: Too many color calculations  
**Solution**: Cache resolved colors and reuse them

## Migration Guide

### From CSS Variables to Hex Values
```typescript
// ❌ Old way (doesn't work in Chart.js)
backgroundColor: 'var(--os-color-primary)'

// ✅ New way (works properly)
backgroundColor: '#f9a743'

// ✅ Best way (automatic)
// Let component assign colors automatically
```