import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { 
  DashboardPeriod,
  ExecutiveTabData,
  SubscribersTabData,
  LoadingStatus,
  SubscriberAnalytics
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
      macroKPI: {
        cards: [
          { id: 'arpu', title: 'dashboard.metrics.arpu', value: '$24.18', change: { value: 2.15, percentage: 9.7, trend: 'up' }, color: 'primary' },
          { id: 'churn', title: 'dashboard.metrics.churnRate', value: '3.2%', change: { value: -0.5, percentage: -13.5, trend: 'down' }, color: 'success' },
          { id: 'ltv', title: 'dashboard.metrics.customerLtv', value: '$289', change: { value: 15, percentage: 5.5, trend: 'up' }, color: 'info' },
          { id: 'cac', title: 'dashboard.metrics.cac', value: '$45', change: { value: -5, percentage: -10, trend: 'down' }, color: 'success' }
        ],
        summary: {
          totalRevenue: 125750.50,
          activeSubscribers: 5200,
          averageRevenue: 24.18,
          churnRate: 3.2
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
   * Generate Subscribers tab mock data
   */
  getSubscribersData(period: DashboardPeriod): Observable<SubscribersTabData> {
    const data: SubscribersTabData = {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },
      metrics: {
        newSubscribers: { count: 423, change: 15.2, trend: 'up' },
        downloadedSIMs: { count: 389, change: 12.8 },
        activeSubscribers: { count: 5200, change: 8.5 },
        spentBundles: { count: 1847, totalGB: 18470 },
        avgBundleSize: { sizeGB: 10, unit: 'GB' }
      },
      customerJourney: {
        stages: [
          { id: 'awareness', name: 'Awareness', count: 10000, percentage: 100, avgDuration: 0 },
          { id: 'interest', name: 'Interest', count: 6500, percentage: 65, avgDuration: 2 },
          { id: 'consideration', name: 'Consideration', count: 3200, percentage: 32, avgDuration: 5 },
          { id: 'purchase', name: 'Purchase', count: 1500, percentage: 15, avgDuration: 7 },
          { id: 'activation', name: 'Activation', count: 1350, percentage: 13.5, avgDuration: 8 },
          { id: 'retention', name: 'Retention', count: 1200, percentage: 12, avgDuration: 30 }
        ],
        conversionRates: {
          overall: 12,
          byStage: {
            'awareness-interest': 65,
            'interest-consideration': 49.2,
            'consideration-purchase': 46.9,
            'purchase-activation': 90,
            'activation-retention': 88.9
          }
        }
      },
      bundleStatus: {
        statuses: {
          active: 3120,
          pending: 580,
          expired: 1200,
          suspended: 300
        },
        distribution: [
          { label: 'Active', value: 3120, color: '#10b981' },
          { label: 'Pending', value: 580, color: '#f59e0b' },
          { label: 'Expired', value: 1200, color: '#ef4444' },
          { label: 'Suspended', value: 300, color: '#6b7280' }
        ]
      },
      geographic: {
        countries: [
          { code: 'US', name: 'United States', subscribers: 1560, revenue: 46800, percentage: 30, growth: 12.5 },
          { code: 'GB', name: 'United Kingdom', subscribers: 780, revenue: 19500, percentage: 15, growth: 8.2 },
          { code: 'DE', name: 'Germany', subscribers: 624, revenue: 15600, percentage: 12, growth: 15.3 },
          { code: 'FR', name: 'France', subscribers: 520, revenue: 13000, percentage: 10, growth: 5.7 },
          { code: 'JP', name: 'Japan', subscribers: 416, revenue: 12480, percentage: 8, growth: 22.1 },
          { code: 'OTHER', name: 'Others', subscribers: 1300, revenue: 18370, percentage: 25, growth: 9.8 }
        ],
        totalCountries: 45
      }
    };

    return of(data);
  }

  /**
   * Generate Traffic tab mock data
   */
  getTrafficData(period: DashboardPeriod): Observable<TrafficAnalytics> {
    console.log('MockDataService: getTrafficData called with period:', period);
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

    console.log('MockDataService: returning traffic data:', data);
    return of(data);
  }

  /**
   * Generate Finance tab mock data
   */
  getFinanceData(period: DashboardPeriod): Observable<FinanceAnalytics> {
    console.log('MockDataService: getFinanceData called with period:', period);
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

    console.log('MockDataService: returning finance data:', data);
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

  private generateHourlyTraffic() {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      avgMB: Math.floor(Math.random() * 50) + 10 + (hour >= 18 && hour <= 22 ? 30 : 0)
    }));
  }

  /**
   * Generate Subscriber Analytics mock data
   */
  getSubscriberAnalytics(period: DashboardPeriod): Observable<SubscriberAnalytics> {
    const data: SubscriberAnalytics = {
      period,
      lastUpdated: new Date(),
      loading: { state: 'success' },
      kpis: [
        {
          id: 'total-subscribers',
          title: 'Total Subscribers',
          value: 8450,
          format: 'number',
          trend: { direction: 'up', percentage: 12.5, label: 'vs last month' },
          color: 'primary'
        },
        {
          id: 'active-subscribers',
          title: 'Active Subscribers',
          value: 7892,
          format: 'number',
          trend: { direction: 'up', percentage: 8.2, label: 'vs last month' },
          color: 'success'
        },
        {
          id: 'new-subscribers',
          title: 'New Subscribers',
          value: 342,
          format: 'number',
          trend: { direction: 'up', percentage: 24.1, label: 'vs last month' },
          color: 'info'
        },
        {
          id: 'churn-rate',
          title: 'Churn Rate',
          value: 6.8,
          format: 'percentage',
          trend: { direction: 'down', percentage: 1.2, label: 'vs last month' },
          color: 'danger'
        }
      ],
      growth: {
        summary: {
          totalSubscribers: 8450,
          newSubscribers: 342,
          activeSubscribers: 7892,
          churnedSubscribers: 93,
          growthRate: 12.5,
          churnRate: 6.8
        },
        trends: this.generateGrowthTrends(30),
        chartConfig: {
          type: 'line',
          data: {
            labels: this.generateDateLabels(30),
            datasets: [
              {
                label: 'New Subscribers',
                data: this.generateRandomArray(30, 8, 25),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true
              },
              {
                label: 'Active Subscribers',
                data: this.generateRandomArray(30, 250, 300),
                borderColor: '#f9a743',
                backgroundColor: 'rgba(249, 167, 67, 0.1)',
                fill: true
              },
              {
                label: 'Churned',
                data: this.generateRandomArray(30, 2, 8),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                stacked: false
              }
            }
          }
        }
      },
      demographics: {
        byCountry: [
          { country: 'United States', subscribers: 2250, percentage: 26.6 },
          { country: 'United Kingdom', subscribers: 1180, percentage: 14.0 },
          { country: 'Germany', subscribers: 980, percentage: 11.6 },
          { country: 'France', subscribers: 720, percentage: 8.5 },
          { country: 'Canada', subscribers: 650, percentage: 7.7 },
          { country: 'Others', subscribers: 2670, percentage: 31.6 }
        ],
        byAge: [
          { ageRange: '18-24', subscribers: 1520, percentage: 18.0 },
          { ageRange: '25-34', subscribers: 2830, percentage: 33.5 },
          { ageRange: '35-44', subscribers: 2110, percentage: 25.0 },
          { ageRange: '45-54', subscribers: 1350, percentage: 16.0 },
          { ageRange: '55+', subscribers: 640, percentage: 7.5 }
        ],
        byGender: [
          { gender: 'Male', subscribers: 4480, percentage: 53.0 },
          { gender: 'Female', subscribers: 3780, percentage: 44.8 },
          { gender: 'Other', subscribers: 190, percentage: 2.2 }
        ],
        chartConfig: {
          type: 'bar',
          data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            datasets: [{
              label: 'Subscribers by Age',
              data: [1520, 2830, 2110, 1350, 640],
              backgroundColor: [
                '#3b82f6', '#10b981', '#f9a743', '#8b5cf6', '#ef4444'
              ]
            }]
          }
        }
      },
      lifecycle: {
        stages: [
          { stage: 'prospect', subscribers: 1250, percentage: 14.8, averageDuration: 5 },
          { stage: 'trial', subscribers: 890, percentage: 10.5, averageDuration: 7 },
          { stage: 'active', subscribers: 5890, percentage: 69.7, averageDuration: 180 },
          { stage: 'at_risk', subscribers: 320, percentage: 3.8, averageDuration: 15 },
          { stage: 'churned', subscribers: 100, percentage: 1.2, averageDuration: 2 }
        ],
        chartConfig: {
          type: 'doughnut',
          data: {
            labels: ['Prospect', 'Trial', 'Active', 'At Risk', 'Churned'],
            datasets: [{
              label: 'Lifecycle Stages',
              data: [1250, 890, 5890, 320, 100],
              backgroundColor: [
                '#06b6d4', '#10b981', '#f9a743', '#f59e0b', '#ef4444'
              ]
            }]
          }
        }
      },
      retention: {
        thirtyDay: 88.5,
        sixtyDay: 82.3,
        ninetyDay: 75.8,
        cohortAnalysis: [
          { cohort: 'Jan 2024', month0: 100, month1: 89, month2: 82, month3: 78, month6: 65, month12: 0 },
          { cohort: 'Feb 2024', month0: 100, month1: 91, month2: 85, month3: 80, month6: 68, month12: 0 },
          { cohort: 'Mar 2024', month0: 100, month1: 88, month2: 83, month3: 76, month6: 0, month12: 0 }
        ],
        chartConfig: {
          type: 'line',
          data: {
            labels: ['Month 0', 'Month 1', 'Month 2', 'Month 3', 'Month 6', 'Month 12'],
            datasets: [
              {
                label: 'Jan 2024 Cohort',
                data: [100, 89, 82, 78, 65, 0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
              },
              {
                label: 'Feb 2024 Cohort',
                data: [100, 91, 85, 80, 68, 0],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              },
              {
                label: 'Mar 2024 Cohort',
                data: [100, 88, 83, 76, 0, 0],
                borderColor: '#f9a743',
                backgroundColor: 'rgba(249, 167, 67, 0.1)'
              }
            ]
          }
        }
      },
      churnAnalysis: {
        currentRate: 6.8,
        previousRate: 8.0,
        trend: 'down',
        reasons: [
          { label: 'Price Sensitivity', count: 45, percentage: 48.4 },
          { label: 'Service Quality', count: 23, percentage: 24.7 },
          { label: 'Competitor Offer', count: 15, percentage: 16.1 },
          { label: 'Technical Issues', count: 7, percentage: 7.5 },
          { label: 'Other', count: 3, percentage: 3.3 }
        ],
        predictedChurn: {
          nextMonth: 5.2,
          confidence: 78.5,
          riskFactors: ['Low usage patterns', 'Payment issues', 'Customer service complaints']
        }
      }
    };

    return of(data);
  }

  private generateGrowthTrends(days: number) {
    const trends = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trends.push({
        period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        new: Math.floor(Math.random() * 20) + 5,
        active: Math.floor(Math.random() * 50) + 250,
        churned: Math.floor(Math.random() * 8) + 2
      });
    }
    
    return trends;
  }
}