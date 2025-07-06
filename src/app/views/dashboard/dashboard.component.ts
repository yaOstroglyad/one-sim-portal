import { Component, OnInit } from '@angular/core';
import { TabChangeEvent } from '../../shared/components/tabs/tabs.types';
import { BarChartData, BarChartOptions } from '../../shared/components/bar-chart';
import { LineChartData, LineChartOptions } from '../../shared/components/line-chart';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  basicTabIndex = 0;

  // Chart data for dashboard analytics
  salesChartData: BarChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Sales ($)',
      data: [12000, 19000, 15000, 25000, 22000, 30000],
      backgroundColor: '#f9a743',
      borderColor: '#e6962e',
      borderWidth: 2,
      borderRadius: 6
    }]
  };

  salesChartOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
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

  // User growth chart data
  userGrowthData: BarChartData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
    datasets: [
      {
        label: 'New Users',
        data: [1200, 1900, 1500, 2200],
        backgroundColor: '#2dd36f',
        borderColor: '#25b760',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Active Users',
        data: [2800, 3200, 2900, 3800],
        backgroundColor: '#3dc2ff',
        borderColor: '#329ce6',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  userGrowthOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
      },
      x: {
        title: {
          display: true,
          text: 'Quarters'
        }
      }
    }
  };

  // Revenue analytics horizontal chart
  revenueByProductData: BarChartData = {
    labels: ['eSIM Plans', 'Data Packages', 'International Roaming', 'Premium Features', 'Enterprise'],
    datasets: [{
      label: 'Revenue ($)',
      data: [45000, 32000, 28000, 15000, 38000],
      backgroundColor: [
        '#f9a743', // primary
        '#2dd36f', // success
        '#3dc2ff', // info  
        '#ffc409', // warning
        '#3b82f6'  // blue
      ],
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  revenueByProductOptions: BarChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Revenue: $${context.parsed.x.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)'
        },
        ticks: {
          callback: (value) => `$${Number(value).toLocaleString()}`
        }
      },
      y: {
        title: {
          display: true,
          text: 'Product Categories'
        }
      }
    }
  };

  // Line chart data for trends
  trafficTrendData: LineChartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Website Traffic',
        data: [120, 80, 150, 300, 280, 200, 150],
        borderColor: '#f9a743',
        backgroundColor: 'rgba(249, 167, 67, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true
      },
      {
        label: 'API Requests',
        data: [80, 60, 120, 250, 220, 160, 120],
        borderColor: '#3dc2ff',
        backgroundColor: 'rgba(61, 194, 255, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true
      }
    ]
  };

  trafficTrendOptions: LineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y} requests`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Requests per Hour'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time of Day'
        }
      }
    }
  };

  // Performance metrics line chart
  performanceData: LineChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [120, 150, 100, 180, 140, 110],
        borderColor: '#eb445a',
        backgroundColor: 'rgba(235, 68, 90, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#eb445a',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Uptime (%)',
        data: [99.9, 99.8, 99.95, 99.7, 99.85, 99.92],
        borderColor: '#2dd36f',
        backgroundColor: 'rgba(45, 211, 111, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#2dd36f',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        fill: false
      }
    ]
  };

  performanceOptions: LineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 200,
        title: {
          display: true,
          text: 'Performance Metrics'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time Period'
        }
      }
    }
  };

  constructor() { }

  ngOnInit(): void {
  }

  onCardClick(cardType: string): void {
    console.log(`${cardType} card clicked!`);
  }

  onTabChange(event: TabChangeEvent): void {
    console.log('Tab changed:', event);
    this.basicTabIndex = event.index;
  }

}