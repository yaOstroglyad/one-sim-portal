# OS Bar Chart - Usage Examples

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { OsBarChartComponent, BarChartData, BarChartOptions } from '@shared/components/bar-chart';

@Component({
  selector: 'app-sales-chart',
  template: `
    <div class="chart-container">
      <h3>Monthly Sales</h3>
      <os-bar-chart 
        [data]="salesData" 
        [options]="chartOptions"
        [height]="400"
        [width]="'100%'">
      </os-bar-chart>
    </div>
  `,
  standalone: true,
  imports: [OsBarChartComponent]
})
export class SalesChartComponent {
  salesData: BarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Sales ($)',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: 'var(--os-color-primary)',
      borderColor: 'var(--os-color-primary-shade)',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  chartOptions: BarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales Amount ($)'
        }
      }
    }
  };
}
```

## Multi-Dataset Chart

```typescript
@Component({
  selector: 'app-comparison-chart',
  template: `
    <os-bar-chart 
      [data]="comparisonData" 
      [options]="comparisonOptions"
      [height]="350">
    </os-bar-chart>
  `,
  standalone: true,
  imports: [OsBarChartComponent]
})
export class ComparisonChartComponent {
  comparisonData: BarChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: '2023',
        data: [65, 59, 80, 81],
        backgroundColor: 'var(--os-color-primary)',
        borderColor: 'var(--os-color-primary-shade)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: '2024',
        data: [75, 69, 90, 91],
        backgroundColor: 'var(--os-color-secondary)',
        borderColor: 'var(--os-color-secondary-shade)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  comparisonOptions: BarChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Performance (%)'
        }
      }
    }
  };
}
```

## Horizontal Bar Chart

```typescript
@Component({
  selector: 'app-product-ranking',
  template: `
    <os-bar-chart 
      [data]="rankingData" 
      [options]="rankingOptions"
      chartType="horizontalBar"
      [height]="300">
    </os-bar-chart>
  `,
  standalone: true,
  imports: [OsBarChartComponent]
})
export class ProductRankingComponent {
  rankingData: BarChartData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [{
      label: 'Sales Volume',
      data: [450, 380, 320, 290, 250],
      backgroundColor: [
        'var(--os-color-success)',
        'var(--os-color-blue)',
        'var(--os-color-warning)',
        'var(--os-color-orange)',
        'var(--os-color-danger)'
      ],
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  rankingOptions: BarChartOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Sold'
        }
      }
    }
  };
}
```

## Usage in Dashboard Component

```typescript
import { Component } from '@angular/core';
import { OsBarChartComponent } from '@shared/components/bar-chart';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-grid">
      <div class="chart-card">
        <h4>Revenue Analytics</h4>
        <os-bar-chart 
          [data]="revenueData" 
          [height]="250"
          theme="light">
        </os-bar-chart>
      </div>
      
      <div class="chart-card">
        <h4>User Growth</h4>
        <os-bar-chart 
          [data]="userGrowthData" 
          [height]="250"
          [options]="userGrowthOptions">
        </os-bar-chart>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    
    .chart-card {
      padding: 20px;
      background: var(--os-color-light);
      border: 1px solid var(--os-color-medium-subtle-bg);
      border-radius: 8px;
    }
    
    h4 {
      margin: 0 0 16px 0;
      color: var(--os-color-dark);
    }
  `],
  standalone: true,
  imports: [OsBarChartComponent]
})
export class DashboardComponent {
  revenueData: BarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Revenue',
      data: [45000, 52000, 48000, 61000, 58000],
      backgroundColor: 'var(--os-color-primary)',
      borderRadius: 6
    }]
  };

  userGrowthData: BarChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'New Users',
      data: [120, 150, 180, 200],
      backgroundColor: 'var(--os-color-success)',
      borderRadius: 6
    }]
  };

  userGrowthOptions: BarChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
}
```

## Export Functionality

```typescript
import { Component, ViewChild } from '@angular/core';
import { OsBarChartComponent } from '@shared/components/bar-chart';

@Component({
  selector: 'app-exportable-chart',
  template: `
    <div>
      <os-bar-chart 
        #chart
        [data]="chartData" 
        [height]="400">
      </os-bar-chart>
      
      <div class="export-buttons">
        <button (click)="exportPNG()">Export PNG</button>
        <button (click)="exportJPEG()">Export JPEG</button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [OsBarChartComponent]
})
export class ExportableChartComponent {
  @ViewChild('chart') chart!: OsBarChartComponent;

  chartData: BarChartData = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [{
      label: 'Data',
      data: [10, 20, 30, 40],
      backgroundColor: 'var(--os-color-primary)'
    }]
  };

  exportPNG(): void {
    this.chart.downloadChart('my-chart', 'png');
  }

  exportJPEG(): void {
    this.chart.downloadChart('my-chart', 'jpeg');
  }
}
```