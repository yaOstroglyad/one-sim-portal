import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  effect
} from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import Chart from 'chart.js/auto';

import {
  WaterfallDataPoint,
  WaterfallChartOptions,
  WaterfallColors,
  WaterfallChartData
} from './waterfall-chart.types';
import { transformToWaterfallData } from './waterfall-chart.utils';

/**
 * Waterfall Chart Component
 *
 * A reusable component for visualizing cumulative data flows using floating bars.
 * Each bar shows how values increase or decrease from a running total.
 *
 * @example
 * ```html
 * <os-waterfall-chart [data]="waterfallData"></os-waterfall-chart>
 * ```
 *
 * @example
 * ```typescript
 * waterfallData: WaterfallDataPoint[] = [
 *   { label: 'Starting', value: 100, type: 'total' },
 *   { label: 'Sales', value: 50 },
 *   { label: 'Returns', value: -20 },
 *   { label: 'Final', value: 0, type: 'total' }
 * ];
 * ```
 */
@Component({
  standalone: true,
  selector: 'os-waterfall-chart',
  templateUrl: './os-waterfall-chart.component.html',
  styleUrls: ['./os-waterfall-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule
]
})
export class OsWaterfallChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('waterfallChartCanvas') private waterfallChartCanvas!: ElementRef<HTMLCanvasElement>;

  // Signal-based inputs
  /** Data points to visualize */
  data = input.required<WaterfallDataPoint[]>();
  /** Chart.js options override */
  options = input<WaterfallChartOptions>({});
  /** Custom color overrides */
  colors = input<Partial<WaterfallColors>>({});
  /** Chart height */
  height = input<number | string>(400);
  /** Enable responsive sizing */
  responsive = input<boolean>(true);

  private chart: Chart | null = null;
  private isInitialized = false;
  private themeObserver: MutationObserver | null = null;
  private currentThemeIsDark: boolean | null = null;

  constructor() {
    // Use effect to react to signal changes (more idiomatic than ngOnChanges for signals)
    effect(() => {
      // Read all signals to track them
      const data = this.data();
      const options = this.options();
      const colors = this.colors();

      // Only update if chart is already initialized
      if (this.isInitialized && data) {
        this.updateChart();
      }
    });
  }

  private isDarkTheme(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark') ||
           document.body.classList.contains('layout--dark');
  }

  // Default chart options
  private getDefaultOptions(): WaterfallChartOptions {
    const isDarkTheme = this.isDarkTheme();
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
    const ticksColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : '#6b7280';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false  // Waterfall charts typically don't need legends
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            label: (context) => {
              const dataPoint = this.data()[context.dataIndex];
              if (dataPoint) {
                const sign = dataPoint.value >= 0 ? '+' : '';
                return `${dataPoint.label}: ${sign}${dataPoint.value}`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: gridColor,
            lineWidth: 1
          },
          ticks: {
            display: true,
            color: ticksColor,
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            },
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          display: true,
          beginAtZero: true,
          grid: {
            display: true,
            color: gridColor,
            lineWidth: 1
          },
          ticks: {
            display: true,
            color: ticksColor,
            font: {
              size: 11,
              family: 'Inter, system-ui, sans-serif'
            }
          }
        }
      },
      animation: {
        duration: 750
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      }
    };
  }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.isInitialized = true;
    this.setupThemeObserver();
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.disconnectThemeObserver();
  }

  private setupThemeObserver(): void {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    this.currentThemeIsDark = this.isDarkTheme();

    this.themeObserver = new MutationObserver(() => {
      const newThemeIsDark = this.isDarkTheme();
      if (newThemeIsDark !== this.currentThemeIsDark) {
        this.currentThemeIsDark = newThemeIsDark;
        this.updateChart();
      }
    });

    // Observe class changes on both html and body elements
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    this.themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  private disconnectThemeObserver(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
  }

  // T009: Implement Chart.js floating bar initialization
  private initializeChart(): void {
    if (!this.waterfallChartCanvas?.nativeElement || !this.data()) {
      return;
    }

    this.destroyChart();

    const canvas = this.waterfallChartCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Transform data to floating bar format
    const chartData = this.buildChartData();

    // Merge default options with provided options
    const chartOptions = this.mergeOptions(this.getDefaultOptions(), this.options());

    this.chart = new Chart(context, {
      type: 'bar',
      data: chartData,
      options: chartOptions as any
    });
  }

  private updateChart(): void {
    if (!this.chart || !this.data()) {
      // If no chart exists yet, try to initialize
      if (this.waterfallChartCanvas?.nativeElement && this.data()) {
        this.initializeChart();
      }
      return;
    }

    // Transform data to floating bar format
    const chartData = this.buildChartData();

    // Update chart data
    this.chart.data = chartData;

    // Update chart options
    const chartOptions = this.mergeOptions(this.getDefaultOptions(), this.options());
    this.chart.options = chartOptions as any;

    // Update chart
    this.chart.update('resize');
  }

  // T010: Implement automatic color assignment
  private buildChartData(): WaterfallChartData {
    const dataPoints = this.data();
    if (!dataPoints || dataPoints.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Use the transform utility which handles colors automatically
    return transformToWaterfallData(dataPoints, this.colors());
  }

  private mergeOptions(
    defaultOptions: WaterfallChartOptions,
    userOptions: WaterfallChartOptions
  ): WaterfallChartOptions {
    const merged: WaterfallChartOptions = {
      ...defaultOptions,
      ...userOptions
    };

    // Merge plugins if both exist
    if (defaultOptions.plugins && userOptions.plugins) {
      merged.plugins = {
        ...defaultOptions.plugins,
        ...userOptions.plugins
      };
    }

    // Deep merge scales to preserve theme-aware grid/ticks colors
    if (defaultOptions.scales && userOptions.scales) {
      merged.scales = { ...defaultOptions.scales };

      // Deep merge each axis
      for (const axis of ['x', 'y'] as const) {
        const defaultAxis = (defaultOptions.scales as any)?.[axis];
        const userAxis = (userOptions.scales as any)?.[axis];

        if (defaultAxis && userAxis) {
          (merged.scales as any)[axis] = {
            ...defaultAxis,
            ...userAxis,
            // Preserve grid settings from defaults unless explicitly overridden
            grid: {
              ...defaultAxis.grid,
              ...userAxis.grid
            },
            // Preserve ticks settings from defaults unless explicitly overridden
            ticks: {
              ...defaultAxis.ticks,
              ...userAxis.ticks
            }
          };
        } else if (userAxis) {
          (merged.scales as any)[axis] = userAxis;
        }
      }
    }

    return merged;
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  /** Get the underlying Chart.js instance */
  public getChartInstance(): Chart | null {
    return this.chart;
  }

  /** Export chart as base64 image */
  public exportAsImage(format: 'png' | 'jpeg' = 'png'): string | null {
    if (!this.chart) {
      return null;
    }
    return this.chart.toBase64Image(`image/${format}`, 1.0);
  }

  /** Download chart as image file */
  public downloadChart(filename: string = 'waterfall-chart', format: 'png' | 'jpeg' = 'png'): void {
    const dataUrl = this.exportAsImage(format);
    if (!dataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
  }
}
