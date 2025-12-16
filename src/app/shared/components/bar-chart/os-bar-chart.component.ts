import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import Chart, { ChartOptions } from 'chart.js/auto';

import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from 'ngx-webstorage';
import { ChartLegendComponent, ChartLegendItem } from '../chart-legend';

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderRadius?: number | { topLeft?: number; topRight?: number; bottomLeft?: number; bottomRight?: number };
    barThickness?: number;
    maxBarThickness?: number;
    stack?: string;
  }[];
}

export type BarChartOptions = ChartOptions<'bar'>;

@Component({
  standalone: true,
  selector: 'os-bar-chart',
  templateUrl: './os-bar-chart.component.html',
  styleUrls: ['./os-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    ChartLegendComponent
]
})
export class OsBarChartComponent implements AfterViewInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly barChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChartCanvas');

  // Signal inputs
  readonly data = input<BarChartData | null>(null);
  readonly options = input<BarChartOptions>({});
  readonly width = input<number | string>('100%');
  readonly height = input<number | string>(400);
  readonly chartType = input<'bar' | 'horizontalBar'>('bar');
  readonly theme = input<'light' | 'dark'>('light');

  /** Legend items for custom legend display */
  readonly legendItems = input<ChartLegendItem[]>([]);
  /** Maximum height for legend before scrolling (in pixels) */
  readonly legendMaxHeight = input<number>(80);
  /** Whether to show legend (if legendItems provided) */
  readonly showLegend = input<boolean>(true);

  /** Emits when legend item visibility changes */
  readonly legendItemsChange = output<ChartLegendItem[]>();

  private chart: Chart | null = null;
  private initialized = false;

  // Color palette from project configuration
  private colors = {
    primary: '#f9a743',
    secondary: '#3dc2ff',
    success: '#2dd36f',
    danger: '#eb445a',
    warning: '#ffc409',
    info: '#3dc2ff',
    light: '#f4f5f8',
    medium: '#92949c',
    dark: '#222428',
    // Tailwind colors
    red: '#ef4444',
    orange: '#f97316',
    amber: '#f59e0b',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    blue: '#3b82f6',
    indigo: '#6366f1',
    violet: '#8b5cf6',
    purple: '#a855f7',
    fuchsia: '#d946ef',
    pink: '#ec4899',
    rose: '#f43f5e',
    zinc: '#71717a'
  };

  private readonly defaultOptions: BarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: '#e5e7eb',
          lineWidth: 1
        },
        ticks: {
          display: true,
          color: '#6b7280',
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
          color: '#e5e7eb',
          lineWidth: 1
        },
        ticks: {
          display: true,
          color: '#6b7280',
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

  constructor() {
    // Get primary color from view configuration
    const viewConfig = this.localStorageService.retrieve('viewConfig');
    if (viewConfig?.primaryColor) {
      this.colors.primary = viewConfig.primaryColor;
    }

    // Try to get colors from CSS variables if available
    this.loadColorsFromCSS();

    // Effect to react to input changes (replaces ngOnChanges)
    effect(() => {
      const data = this.data();
      const options = this.options();
      const chartType = this.chartType();
      const theme = this.theme();

      // Only update after component is initialized
      if (this.initialized) {
        if (data) {
          this.updateChart();
        }
      }
    });
  }

  private loadColorsFromCSS(): void {
    if (typeof document !== 'undefined') {
      const style = getComputedStyle(document.documentElement);

      // Map CSS variables to our color palette
      const cssVarMap = {
        primary: '--os-color-primary',
        secondary: '--os-color-secondary',
        success: '--os-color-success',
        danger: '--os-color-danger',
        warning: '--os-color-warning',
        info: '--os-color-info',
        light: '--os-color-light',
        medium: '--os-color-medium',
        dark: '--os-color-dark'
      };

      Object.entries(cssVarMap).forEach(([colorName, cssVar]) => {
        const cssValue = style.getPropertyValue(cssVar).trim();
        if (cssValue && cssValue !== '') {
          (this.colors as any)[colorName] = cssValue;
        }
      });
    }
  }

  ngAfterViewInit(): void {
    this.initializeChart();
    this.initialized = true;
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private initializeChart(): void {
    const canvas = this.barChartCanvas()?.nativeElement;
    const data = this.data();

    if (!canvas || !data) {
      return;
    }

    this.destroyChart();

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Merge default options with provided options
    const chartOptions = this.mergeOptions(this.defaultOptions, this.options());

    // Set chart type specific options
    if (this.chartType() === 'horizontalBar') {
      chartOptions.indexAxis = 'y';
    }

    // Auto-disable native legend when custom legendItems are provided
    if (this.legendItems().length > 0 && chartOptions.plugins) {
      chartOptions.plugins = {
        ...chartOptions.plugins,
        legend: { display: false }
      };
    }

    // Apply theme-specific styling
    this.applyThemeToData(data);

    this.chart = new Chart(context, {
      type: 'bar',
      data: data,
      options: chartOptions as any
    });

    this.cdr.detectChanges();
  }

  private updateChart(): void {
    const data = this.data();

    if (!this.chart || !data) {
      // If no chart exists but we have data, initialize
      if (data && this.barChartCanvas()?.nativeElement) {
        this.initializeChart();
      }
      return;
    }

    // Apply theme-specific styling
    this.applyThemeToData(data);

    // Update chart data
    this.chart.data = data;

    // Update chart options
    const chartOptions = this.mergeOptions(this.defaultOptions, this.options());
    if (this.chartType() === 'horizontalBar') {
      chartOptions.indexAxis = 'y';
    }

    // Auto-disable native legend when custom legendItems are provided
    if (this.legendItems().length > 0 && chartOptions.plugins) {
      chartOptions.plugins = {
        ...chartOptions.plugins,
        legend: { display: false }
      };
    }

    this.chart.options = chartOptions as any;

    // Update chart
    this.chart.update('resize');
    this.cdr.detectChanges();
  }

  private applyThemeToData(data: BarChartData): void {
    // Apply default colors if not provided
    data.datasets.forEach((dataset, index) => {
      if (!dataset.backgroundColor) {
        dataset.backgroundColor = this.getDefaultColor(index);
      }
      if (dataset.borderWidth === undefined) {
        dataset.borderWidth = 0;
      }
      // Only apply default borderRadius if not already set (preserve object values for stacked charts)
      if (dataset.borderRadius === undefined) {
        dataset.borderRadius = 4;
      }
    });
  }

  private getDefaultColor(index: number): string {
    const colorKeys = [
      'primary',
      'secondary',
      'success',
      'info',
      'warning',
      'danger',
      'blue',
      'green',
      'orange',
      'purple',
      'pink',
      'cyan'
    ];
    const colorKey = colorKeys[index % colorKeys.length];
    return this.colors[colorKey as keyof typeof this.colors];
  }

  private mergeOptions(defaultOptions: BarChartOptions, userOptions: BarChartOptions): BarChartOptions {
    // Simple merge for Chart.js options, avoiding deep type conflicts
    const merged: BarChartOptions = {
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

    // Merge scales if both exist
    if (defaultOptions.scales && userOptions.scales) {
      merged.scales = {
        ...defaultOptions.scales,
        ...userOptions.scales
      };
    }

    return merged;
  }

  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  public getChartInstance(): Chart | null {
    return this.chart;
  }

  public exportAsImage(format: 'png' | 'jpeg' = 'png'): string | null {
    if (!this.chart) {
      return null;
    }

    return this.chart.toBase64Image(`image/${format}`, 1.0);
  }

  public downloadChart(filename: string = 'chart', format: 'png' | 'jpeg' = 'png'): void {
    const dataUrl = this.exportAsImage(format);
    if (!dataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.download = `${filename}.${format}`;
    link.href = dataUrl;
    link.click();
  }

  public updateColors(newColors: Partial<typeof this.colors>): void {
    Object.assign(this.colors, newColors);
    const data = this.data();
    if (this.chart && data) {
      this.applyThemeToData(data);
      this.chart.update();
      this.cdr.detectChanges();
    }
  }

  public getCurrentColors(): typeof this.colors {
    return { ...this.colors };
  }

  /**
   * Handle legend item click - toggle visibility of related datasets
   */
  onLegendItemClick(event: { index: number; item: ChartLegendItem }): void {
    if (!this.chart) return;

    const clickedLabel = event.item.label;
    const datasets = this.chart.data.datasets;

    // Find all datasets that match this legend item (same color/group)
    datasets.forEach((dataset, datasetIndex) => {
      // Match by label containing the group name
      if (dataset.label?.includes(clickedLabel)) {
        const meta = this.chart!.getDatasetMeta(datasetIndex);
        meta.hidden = !meta.hidden;
      }
    });

    // Emit updated legend items to parent (do not mutate input)
    const updatedItems = this.legendItems().map((item, index) => {
      if (index === event.index) {
        return { ...item, hidden: !item.hidden };
      }
      return item;
    });
    this.legendItemsChange.emit(updatedItems);

    this.chart.update();
    this.cdr.detectChanges();
  }
}
