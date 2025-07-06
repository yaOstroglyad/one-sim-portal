import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import Chart, { ChartConfiguration, ChartOptions } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

export interface BarChartData {
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

export type BarChartOptions = ChartOptions<'bar'>;

@Component({
  selector: 'os-bar-chart',
  templateUrl: './os-bar-chart.component.html',
  styleUrls: ['./os-bar-chart.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule
  ]
})
export class OsBarChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('barChartCanvas') private barChartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() data: BarChartData | null = null;
  @Input() options: BarChartOptions = {};
  @Input() width: number | string = '100%';
  @Input() height: number | string = 400;
  @Input() chartType: 'bar' | 'horizontalBar' = 'bar';
  @Input() responsive: boolean = true;
  @Input() maintainAspectRatio: boolean = false;
  @Input() theme: 'light' | 'dark' = 'light';

  private chart: Chart | null = null;
  private unsubscribe$ = new Subject<void>();

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

  constructor(
    private cdr: ChangeDetectorRef,
    private localStorageService: LocalStorageService
  ) {
    // Get primary color from view configuration
    const viewConfig = this.localStorageService.retrieve('viewConfig');
    if (viewConfig?.primaryColor) {
      this.colors.primary = viewConfig.primaryColor;
    }
    
    // Try to get colors from CSS variables if available
    this.loadColorsFromCSS();
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateChart();
    }
    if (changes['options'] && !changes['options'].firstChange) {
      this.updateChart();
    }
    if (changes['chartType'] && !changes['chartType'].firstChange) {
      this.initializeChart();
    }
    if (changes['theme'] && !changes['theme'].firstChange) {
      this.updateChartTheme();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeChart(): void {
    if (!this.barChartCanvas?.nativeElement || !this.data) {
      return;
    }

    this.destroyChart();

    const canvas = this.barChartCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Merge default options with provided options
    const chartOptions = this.mergeOptions(this.defaultOptions, this.options);

    // Set chart type specific options
    if (this.chartType === 'horizontalBar') {
      chartOptions.indexAxis = 'y';
    }

    // Apply theme-specific styling
    this.applyThemeToData();

    this.chart = new Chart(context, {
      type: 'bar',
      data: this.data,
      options: chartOptions as any
    });

    this.cdr.detectChanges();
  }

  private updateChart(): void {
    if (!this.chart || !this.data) {
      return;
    }

    // Apply theme-specific styling
    this.applyThemeToData();

    // Update chart data
    this.chart.data = this.data;

    // Update chart options
    const chartOptions = this.mergeOptions(this.defaultOptions, this.options);
    if (this.chartType === 'horizontalBar') {
      chartOptions.indexAxis = 'y';
    }

    this.chart.options = chartOptions as any;

    // Update chart
    this.chart.update('resize');
    this.cdr.detectChanges();
  }

  private updateChartTheme(): void {
    if (!this.chart) {
      return;
    }

    this.applyThemeToData();
    this.chart.update('resize');
    this.cdr.detectChanges();
  }

  private applyThemeToData(): void {
    if (!this.data) {
      return;
    }

    // Apply default colors if not provided
    this.data.datasets.forEach((dataset, index) => {
      if (!dataset.backgroundColor) {
        dataset.backgroundColor = this.getDefaultColor(index);
      }
      if (!dataset.borderColor) {
        dataset.borderColor = this.getDefaultBorderColor(index);
      }
      if (dataset.borderWidth === undefined) {
        dataset.borderWidth = 1;
      }
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

  private getDefaultBorderColor(index: number): string {
    // Generate darker shade for border
    const baseColor = this.getDefaultColor(index);
    return this.darkenColor(baseColor, 20);
  }

  private darkenColor(color: string, percent: number): string {
    // Convert hex to RGB, darken, and convert back
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const factor = (100 - percent) / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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
    if (this.chart && this.data) {
      this.applyThemeToData();
      this.chart.update();
      this.cdr.detectChanges();
    }
  }

  public getCurrentColors(): typeof this.colors {
    return { ...this.colors };
  }
}