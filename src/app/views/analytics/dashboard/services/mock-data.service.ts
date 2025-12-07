import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DashboardPeriod,
  ExecutiveTabData
} from '../models/dashboard.types';
import { TrafficAnalytics } from '../models/traffic.types';
import { FinanceAnalytics } from '../models/finance.types';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  /**
   * Generate Executive tab mock data
   */
  getExecutiveData(period: DashboardPeriod): Observable<ExecutiveTabData> {
    const data: ExecutiveTabData = {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },
      revenue: {
        total: 125750.50,
        currency: 'USD',
        totalCost: 62875.25,
        totalMargin: 62875.25,
        breakdown: {
          new: 45250.00,
          recurring: 75500.50,
          churn: -5000.00
        },
        trend: {
          daily: this.generateRandomArray(30, 3000, 5000),
          labels: this.generateDateLabels(30)
        }
      },
      subscribersByBundle: {
        bundles: [
          { id: '1', name: 'Europe 10GB', code: 'EU10', subscribers: 1250, revenue: 31250, percentage: 25, color: '#f9a743' },
          { id: '2', name: 'USA Unlimited', code: 'US∞', subscribers: 890, revenue: 44500, percentage: 35, color: '#3b82f6' },
          { id: '3', name: 'Asia 5GB', code: 'AS5', subscribers: 2100, revenue: 21000, percentage: 17, color: '#10b981' },
          { id: '4', name: 'Global 20GB', code: 'GL20', subscribers: 650, revenue: 26000, percentage: 21, color: '#8b5cf6' },
          { id: '5', name: 'Africa 3GB', code: 'AF3', subscribers: 310, revenue: 3000, percentage: 2, color: '#ef4444' }
        ],
        total: 5200,
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['Europe 10GB', 'USA Unlimited', 'Asia 5GB', 'Global 20GB', 'Africa 3GB'],
            datasets: [{
              label: 'Subscribers',
              data: [1250, 890, 2100, 650, 310],
              backgroundColor: ['#f9a743', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'],
              borderRadius: 4,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        }
      },
      revenueByBundle: {
        bundles: [
          { id: '2', name: 'USA Unlimited', code: 'US∞', subscribers: 890, revenue: 44500, percentage: 35, color: '#3b82f6' },
          { id: '1', name: 'Europe 10GB', code: 'EU10', subscribers: 1250, revenue: 31250, percentage: 25, color: '#f9a743' },
          { id: '4', name: 'Global 20GB', code: 'GL20', subscribers: 650, revenue: 26000, percentage: 21, color: '#8b5cf6' },
          { id: '3', name: 'Asia 5GB', code: 'AS5', subscribers: 2100, revenue: 21000, percentage: 17, color: '#10b981' },
          { id: '5', name: 'Africa 3GB', code: 'AF3', subscribers: 310, revenue: 3000, percentage: 2, color: '#ef4444' }
        ],
        total: 125750,
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['USA Unlimited', 'Europe 10GB', 'Global 20GB', 'Asia 5GB', 'Africa 3GB'],
            datasets: [{
              label: 'Revenue (USD)',
              data: [44500, 31250, 26000, 21000, 3000],
              backgroundColor: '#f9a743'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
            }
          }
        }
      },
      inventoryStatus: {
        totalESIMs: 50000,
        available: 35000,
        allocated: 12000,
        expired: 3000,
        breakdown: [
          { label: 'Available', value: 35000, percentage: 70, status: 'healthy' },
          { label: 'Allocated', value: 12000, percentage: 24, status: 'healthy' },
          { label: 'Expired', value: 3000, percentage: 6, status: 'warning' }
        ]
      }
    };

    return of(data);
  }

  /**
   * Generate Traffic tab mock data
   */
  getTrafficData(period: DashboardPeriod): Observable<TrafficAnalytics> {
    const data: TrafficAnalytics = {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },

      // KPI Metrics
      kpiMetrics: [
        {
          id: 'total-traffic',
          title: 'dashboard.metrics.totalTraffic',
          value: 850,
          format: 'bytes',
          unit: 'GB',
          change: { value: 100, percentage: 12.5, trend: 'up' },
          color: 'primary'
        },
        {
          id: 'active-countries',
          title: 'dashboard.metrics.activeCountries',
          value: 4,
          format: 'number',
          change: { value: 0, percentage: 0, trend: 'stable' },
          color: 'success'
        },
        {
          id: 'avg-traffic-per-user',
          title: 'dashboard.metrics.avgTrafficPerUser',
          value: 1.8,
          format: 'number',
          unit: 'GB',
          change: { value: 0.1, percentage: 5.2, trend: 'up' },
          color: 'info'
        }
      ],

      // Traffic by Country (horizontal bar chart)
      trafficByCountry: {
        data: [
          { country: 'France', traffic: 300, percentage: 35.3, trend: { direction: 'up', percentage: 8.2 } },
          { country: 'Israel', traffic: 250, percentage: 29.4, trend: { direction: 'up', percentage: 15.3 } },
          { country: 'Germany', traffic: 180, percentage: 21.2, trend: { direction: 'stable', percentage: 2.1 } },
          { country: 'United States', traffic: 120, percentage: 14.1, trend: { direction: 'down', percentage: 3.5 } }
        ],
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['France', 'Israel', 'Germany', 'United States'],
            datasets: [{
              label: 'Traffic (GB)',
              data: [300, 250, 180, 120],
              backgroundColor: ['#3b82f6', '#10b981', '#f9a743', '#8b5cf6'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Traffic Shares (pie chart)
      trafficShares: {
        data: [
          { country: 'France', share: 40, traffic: 300, color: '#3b82f6' },
          { country: 'Israel', share: 30, traffic: 250, color: '#10b981' },
          { country: 'Germany', share: 30, traffic: 180, color: '#f9a743' }
        ],
        chartConfig: {
          type: 'pie',
          data: {
            labels: ['France', 'Israel', 'Germany'],
            datasets: [{
              label: 'Subscribers by Country',
              data: [40, 30, 30],
              backgroundColor: ['#3b82f6', '#10b981', '#f9a743']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        },
        loading: false
      },

      // Active Users by Country (horizontal bar chart)
      activeUsersByCountry: {
        data: [
          { country: 'France', users: 100, percentage: 32.3, trend: { direction: 'up', percentage: 12.0 } },
          { country: 'USA', users: 80, percentage: 25.8, trend: { direction: 'stable', percentage: 2.5 } },
          { country: 'Israel', users: 75, percentage: 24.2, trend: { direction: 'up', percentage: 8.7 } },
          { country: 'Germany', users: 55, percentage: 17.7, trend: { direction: 'down', percentage: 5.2 } }
        ],
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['France', 'USA', 'Israel', 'Germany'],
            datasets: [{
              label: 'Active Users',
              data: [100, 80, 75, 55],
              backgroundColor: ['#3b82f6', '#10b981', '#f9a743', '#8b5cf6'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Average Traffic KPI
      averageTraffic: {
        data: {
          averageTrafficGB: 1.8,
          totalTrafficGB: 850,
          activeCountries: 4,
          topCountry: 'France'
        },
        loading: false
      }
    };

    return of(data);
  }

  /**
   * Generate Finance tab mock data
   */
  getFinanceData(period: DashboardPeriod): Observable<FinanceAnalytics> {
    const data: FinanceAnalytics = {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },

      // KPI Metrics
      kpiMetrics: [
        {
          id: 'total-revenue',
          title: 'dashboard.metrics.totalRevenue',
          value: 15000,
          format: 'currency',
          unit: 'USD',
          change: { value: 1200, percentage: 8.5, trend: 'up' },
          color: 'primary'
        },
        {
          id: 'avg-margin',
          title: 'dashboard.metrics.avgMargin',
          value: 47.5,
          format: 'percentage',
          change: { value: 1.1, percentage: 2.3, trend: 'up' },
          color: 'success'
        },
        {
          id: 'pending-invoices',
          title: 'dashboard.metrics.pendingInvoices',
          value: 3200,
          format: 'currency',
          unit: 'USD',
          change: { value: -170, percentage: -5.2, trend: 'down' },
          color: 'warning'
        }
      ],

      // Margin by Month (line chart)
      marginByMonth: {
        data: [
          { month: '2025-03', margin: 45 },
          { month: '2025-04', margin: 40 },
          { month: '2025-05', margin: 50 },
          { month: '2025-06', margin: 47.5 }
        ],
        chartConfig: {
          type: 'line',
          data: {
            labels: ['Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
            datasets: [{
              label: 'Margin (%)',
              data: [45, 40, 50, 47.5],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Top 10 Countries (horizontal bar chart)
      topCountries: {
        data: [
          { country: 'Germany', revenue: 5000, percentage: 33.3, trend: { direction: 'up', percentage: 12.5 } },
          { country: 'USA', revenue: 4500, percentage: 30.0, trend: { direction: 'stable', percentage: 2.1 } },
          { country: 'France', revenue: 3200, percentage: 21.3, trend: { direction: 'up', percentage: 8.7 } },
          { country: 'United Kingdom', revenue: 2300, percentage: 15.3, trend: { direction: 'down', percentage: 3.2 } }
        ],
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['Germany', 'USA', 'France', 'United Kingdom'],
            datasets: [{
              label: 'Revenue (USD)',
              data: [5000, 4500, 3200, 2300],
              backgroundColor: ['#3b82f6', '#10b981', '#f9a743', '#8b5cf6'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Top 10 Bundles (horizontal bar chart)
      topBundles: {
        data: [
          { bundle: 'Europe 3GB', revenue: 3200, percentage: 35.6, trend: { direction: 'up', percentage: 15.2 } },
          { bundle: 'Asia 1GB', revenue: 2700, percentage: 30.0, trend: { direction: 'stable', percentage: 1.5 } },
          { bundle: 'USA 5GB', revenue: 1800, percentage: 20.0, trend: { direction: 'up', percentage: 8.3 } },
          { bundle: 'Global 10GB', revenue: 1300, percentage: 14.4, trend: { direction: 'down', percentage: 5.1 } }
        ],
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['Europe 3GB', 'Asia 1GB', 'USA 5GB', 'Global 10GB'],
            datasets: [{
              label: 'Revenue (USD)',
              data: [3200, 2700, 1800, 1300],
              backgroundColor: ['#3b82f6', '#10b981', '#f9a743', '#8b5cf6'],
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
              x: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Revenue (line chart)
      revenue: {
        data: [
          { month: '2025-04', revenue: 7000 },
          { month: '2025-05', revenue: 8000 },
          { month: '2025-06', revenue: 9000 }
        ],
        chartConfig: {
          type: 'line',
          data: {
            labels: ['Apr 2025', 'May 2025', 'Jun 2025'],
            datasets: [{
              label: 'Revenue (USD)',
              data: [7000, 8000, 9000],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true }
            }
          }
        },
        loading: false
      },

      // Balance for Invoice (table)
      balanceForInvoice: {
        data: [
          { company: 'Client A', amount: 1200, dueDate: '2025-07-10', status: 'pending', daysPending: 5 },
          { company: 'Client B', amount: 850, dueDate: '2025-07-15', status: 'pending', daysPending: 2 },
          { company: 'Client C', amount: 1500, dueDate: '2025-07-08', status: 'overdue', daysPending: 12 }
        ],
        loading: false
      },

      // Bundle Purchases to be Invoiced (table)
      bundlePurchases: {
        data: [
          { bundle: 'Europe 1GB', quantity: 5, customer: 'Client B', total: 100, date: '2025-07-01', status: 'pending' },
          { bundle: 'Asia 1GB', quantity: 3, customer: 'Client A', total: 75, date: '2025-07-02', status: 'pending' },
          { bundle: 'USA 5GB', quantity: 2, customer: 'Client C', total: 120, date: '2025-06-30', status: 'invoiced' }
        ],
        loading: false
      }
    };

    return of(data);
  }

  /**
   * Helper methods
   */
  private generateRandomArray(length: number, min: number, max: number): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  }

  private generateDateLabels(days: number): string[] {
    const labels: string[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    return labels;
  }

}
