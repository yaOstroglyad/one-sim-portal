# OS Line Chart - Usage Examples

## Basic Line Chart

```typescript
import { Component } from '@angular/core';
import { OsLineChartComponent, LineChartData, LineChartOptions } from '@shared/components/line-chart';

@Component({
  selector: 'app-sales-trend',
  template: `
    <div class="chart-container">
      <h3>Sales Trend</h3>
      <os-line-chart 
        [data]="salesTrendData" 
        [options]="salesTrendOptions"
        [height]="350"
        [width]="'100%'"
        [smooth]="true">
      </os-line-chart>
    </div>
  `,
  standalone: true,
  imports: [OsLineChartComponent]
})
export class SalesTrendComponent {
  salesTrendData: LineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Monthly Sales ($)',
      data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
      borderColor: '#f9a743',
      backgroundColor: 'rgba(249, 167, 67, 0.1)',
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: true
    }]
  };

  salesTrendOptions: LineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Sales: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales Amount ($)'
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      x: {
        title: {
          display: true,
          text: 'Months'
        }
      }
    }
  };
}
```

## Multi-Line Comparison Chart

```typescript
@Component({
  selector: 'app-user-analytics',
  template: `
    <os-line-chart 
      [data]="userAnalyticsData" 
      [options]="userAnalyticsOptions"
      [height]="400">
    </os-line-chart>
  `,
  standalone: true,
  imports: [OsLineChartComponent]
})
export class UserAnalyticsComponent {
  userAnalyticsData: LineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Active Users',
        data: [1200, 1350, 1100, 1500, 1400, 1600],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#f9a743',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: true
      },
      {
        label: 'New Registrations',
        data: [200, 250, 180, 300, 280, 320],
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#2dd36f',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Churn Rate',
        data: [50, 60, 45, 80, 70, 65],
        borderColor: '#eb445a',
        backgroundColor: 'rgba(235, 68, 90, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#eb445a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: false
      }
    ]
  };

  userAnalyticsOptions: LineChartOptions = {
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
          text: 'Number of Users'
        }
      }
    }
  };
}
```

## Dashed Line Chart (Projections)

```typescript
@Component({
  selector: 'app-revenue-forecast',
  template: `
    <os-line-chart 
      [data]="forecastData" 
      [options]="forecastOptions"
      [height]="350"
      [smooth]="true">
    </os-line-chart>
  `,
  standalone: true,
  imports: [OsLineChartComponent]
})
export class RevenueForecastComponent {
  forecastData: LineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Actual Revenue',
        data: [100, 120, 115, 140, 130, 150, null, null, null],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Projected Revenue',
        data: [null, null, null, null, null, 150, 160, 170, 180],
        borderColor: '#3dc2ff',
        backgroundColor: 'rgba(61, 194, 255, 0.1)',
        borderWidth: 3,
        borderDash: [10, 5],
        pointRadius: 5,
        tension: 0.4,
        fill: false
      }
    ]
  };

  forecastOptions: LineChartOptions = {
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
          text: 'Revenue (K$)'
        }
      }
    }
  };
}
```

## Real-Time Data Chart

```typescript
@Component({
  selector: 'app-real-time-monitoring',
  template: `
    <div class="monitoring-container">
      <h3>Real-Time System Monitoring</h3>
      <div class="controls">
        <button (click)="toggleUpdates()" [class.active]="isUpdating">
          {{ isUpdating ? 'Stop' : 'Start' }} Updates
        </button>
        <button (click)="clearData()">Clear Data</button>
      </div>
      <os-line-chart 
        #chart
        [data]="monitoringData" 
        [options]="monitoringOptions"
        [height]="300"
        [smooth]="false">
      </os-line-chart>
    </div>
  `,
  styles: [`
    .monitoring-container {
      padding: 20px;
    }
    .controls {
      margin-bottom: 20px;
    }
    .controls button {
      margin-right: 10px;
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
    }
    .controls button.active {
      background: #f9a743;
      color: white;
    }
  `],
  standalone: true,
  imports: [OsLineChartComponent]
})
export class RealTimeMonitoringComponent implements OnInit, OnDestroy {
  @ViewChild('chart') chart!: OsLineChartComponent;
  
  isUpdating = false;
  private updateInterval?: number;
  private maxDataPoints = 20;

  monitoringData: LineChartData = {
    labels: [],
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: [],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0,
        fill: true
      },
      {
        label: 'Memory Usage (%)',
        data: [],
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0,
        fill: true
      }
    ]
  };

  monitoringOptions: LineChartOptions = {
    responsive: true,
    animation: {
      duration: 0 // Disable animations for real-time updates
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Usage (%)'
        }
      }
    }
  };

  ngOnInit(): void {
    // Initialize with some data
    for (let i = 0; i < 5; i++) {
      this.addDataPoint();
    }
  }

  ngOnDestroy(): void {
    this.stopUpdates();
  }

  toggleUpdates(): void {
    if (this.isUpdating) {
      this.stopUpdates();
    } else {
      this.startUpdates();
    }
  }

  private startUpdates(): void {
    this.isUpdating = true;
    this.updateInterval = setInterval(() => {
      this.addDataPoint();
    }, 1000);
  }

  private stopUpdates(): void {
    this.isUpdating = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private addDataPoint(): void {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();
    const cpuUsage = Math.floor(Math.random() * 100);
    const memoryUsage = Math.floor(Math.random() * 100);

    this.chart?.addDataPoint(timeLabel, [cpuUsage, memoryUsage]);

    // Keep only the last N data points
    if (this.monitoringData.labels.length > this.maxDataPoints) {
      this.chart?.removeLastDataPoint();
    }
  }

  clearData(): void {
    this.monitoringData.labels = [];
    this.monitoringData.datasets.forEach(dataset => {
      dataset.data = [];
    });
    this.chart?.getChartInstance()?.update();
  }
}
```

## Stepped Line Chart

```typescript
@Component({
  selector: 'app-process-flow',
  template: `
    <os-line-chart 
      [data]="processFlowData" 
      [options]="processFlowOptions"
      [height]="300"
      [smooth]="false">
    </os-line-chart>
  `,
  standalone: true,
  imports: [OsLineChartComponent]
})
export class ProcessFlowComponent {
  processFlowData: LineChartData = {
    labels: ['Start', 'Validation', 'Processing', 'Review', 'Complete'],
    datasets: [{
      label: 'Process Status',
      data: [0, 25, 50, 75, 100],
      borderColor: '#3dc2ff',
      backgroundColor: 'rgba(61, 194, 255, 0.1)',
      borderWidth: 3,
      pointRadius: 6,
      pointBackgroundColor: '#3dc2ff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      stepped: true,
      fill: true
    }]
  };

  processFlowOptions: LineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion (%)'
        },
        ticks: {
          callback: (value) => `${value}%`
        }
      },
      x: {
        title: {
          display: true,
          text: 'Process Steps'
        }
      }
    }
  };
}
```

## Interactive Chart with Export

```typescript
@Component({
  selector: 'app-exportable-line-chart',
  template: `
    <div class="chart-with-controls">
      <div class="chart-header">
        <h3>Performance Metrics</h3>
        <div class="chart-controls">
          <button (click)="toggleSmooth()">
            {{ isSmooth ? 'Sharp Lines' : 'Smooth Lines' }}
          </button>
          <button (click)="exportChart('png')">Export PNG</button>
          <button (click)="exportChart('jpeg')">Export JPEG</button>
        </div>
      </div>
      
      <os-line-chart 
        #chart
        [data]="performanceData" 
        [options]="performanceOptions"
        [height]="400"
        [smooth]="isSmooth">
      </os-line-chart>
    </div>
  `,
  styles: [`
    .chart-with-controls {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: white;
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .chart-controls button {
      margin-left: 10px;
      padding: 8px 16px;
      border: 1px solid #f9a743;
      background: white;
      color: #f9a743;
      cursor: pointer;
      border-radius: 4px;
    }
    .chart-controls button:hover {
      background: #f9a743;
      color: white;
    }
  `],
  standalone: true,
  imports: [OsLineChartComponent]
})
export class ExportableLineChartComponent {
  @ViewChild('chart') chart!: OsLineChartComponent;
  
  isSmooth = true;

  performanceData: LineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [120, 150, 100, 180, 140, 110],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Throughput (req/s)',
        data: [800, 750, 900, 650, 800, 950],
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false
      }
    ]
  };

  performanceOptions: LineChartOptions = {
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
          text: 'Performance Metrics'
        }
      }
    }
  };

  toggleSmooth(): void {
    this.isSmooth = !this.isSmooth;
    this.chart.setSmooth(this.isSmooth);
  }

  exportChart(format: 'png' | 'jpeg'): void {
    this.chart.downloadChart(`performance-metrics-${new Date().toISOString().split('T')[0]}`, format);
  }
}
```

## Usage in Dashboard

```typescript
import { Component } from '@angular/core';
import { OsLineChartComponent, OsCardComponent } from '@shared/components';

@Component({
  selector: 'app-analytics-dashboard',
  template: `
    <div class="dashboard-grid">
      <os-card title="Traffic Overview" variant="elevated" size="large">
        <os-line-chart 
          [data]="trafficData" 
          [height]="250"
          [smooth]="true">
        </os-line-chart>
      </os-card>
      
      <os-card title="Revenue Growth" variant="elevated" size="large">
        <os-line-chart 
          [data]="revenueData" 
          [height]="250"
          [smooth]="true">
        </os-line-chart>
      </os-card>
    </div>
  `,
  styles: [`
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 20px 0;
    }
    
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  standalone: true,
  imports: [OsLineChartComponent, OsCardComponent]
})
export class AnalyticsDashboardComponent {
  trafficData: LineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Page Views',
      data: [1200, 1900, 1500, 2200, 1800, 900, 700],
      borderColor: '#f9a743',
      backgroundColor: 'rgba(249, 167, 67, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  revenueData: LineChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue ($K)',
      data: [45, 52, 48, 61],
      borderColor: '#2dd36f',
      backgroundColor: 'rgba(45, 211, 111, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
}
```