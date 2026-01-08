import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
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
  /** Number of top items to show when "Top N" is clicked */
  readonly defaultTopN = input<number>(3);
  /** Whether to show legend controls (Top N, Show All, Hide All buttons) */
  readonly showLegendControls = input<boolean>(true);

  /** Emits when legend item visibility changes */
  readonly legendItemsChange = output<ChartLegendItem[]>();

  /** Internal state tracking toggled (hidden) legend items by index */
  private readonly toggledIndices = signal<Set<number>>(new Set());

  /** Computed legend items with merged hidden state for template */
  readonly displayLegendItems = computed(() => {
    const items = this.legendItems();
    const toggled = this.toggledIndices();

    return items.map((item, index) => ({
      ...item,
      hidden: toggled.has(index) ? !item.hidden : !!item.hidden
    }));
  });

  private chart: Chart | null = null;
  private initialized = false;
  private themeObserver: MutationObserver | null = null;
  private currentThemeIsDark: boolean | null = null;
  /** Store original data values for restoring when showing hidden bars */
  private originalDataValues: (number | null)[][] = [];
  /** Store original labels for restoring when showing hidden bars */
  private originalLabels: string[] = [];

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

  private getDefaultOptions(): BarChartOptions {
    const isDarkTheme = this.isDarkTheme();
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
    const ticksColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : '#6b7280';
    const legendColor = isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : '#374151';

    return {
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
            color: legendColor,
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
            minRotation: 0,
            autoSkip: false,
            callback: function(value: string | number, index: number) {
              const label = this.getLabelForValue(index);
              if (typeof label === 'string' && label.length > 15) {
                return label.substring(0, 12) + '...';
              }
              return label;
            }
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

  private isDarkTheme(): boolean {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark') ||
           document.body.classList.contains('layout--dark');
  }

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
    const chartOptions = this.mergeOptions(this.getDefaultOptions(), this.options());

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

    // Store original data values for single-dataset charts
    this.storeOriginalValues();

    // Apply initial visibility from legend items
    this.applyInitialVisibility();

    this.cdr.detectChanges();
  }

  /**
   * Store original data values and labels for restoring when showing hidden bars
   */
  private storeOriginalValues(): void {
    if (!this.chart) return;

    this.originalDataValues = this.chart.data.datasets.map(dataset =>
      (dataset.data as (number | null)[]).slice()
    );
    this.originalLabels = (this.chart.data.labels as string[] || []).slice();
  }

  /**
   * Check if this is a single-dataset chart with category-based legend
   * (legend items map to data point indices, not datasets)
   */
  private isSingleDatasetCategoryChart(): boolean {
    if (!this.chart) return false;

    const datasets = this.chart.data.datasets;
    const legendItems = this.legendItems();

    // Single dataset with legend items matching data point count
    return datasets.length === 1 &&
           legendItems.length > 0 &&
           legendItems.length === (datasets[0].data?.length || 0);
  }

  /**
   * Apply initial visibility state from legend items
   * Handles both multi-dataset charts and single-dataset category charts
   */
  private applyInitialVisibility(): void {
    if (!this.chart) return;

    const items = this.legendItems();
    if (!items.length) return;

    if (this.isSingleDatasetCategoryChart()) {
      // Single dataset: hide individual data points by setting to null and clear labels
      const dataset = this.chart.data.datasets[0];
      const labels = this.chart.data.labels as string[];
      items.forEach((item, index) => {
        if (item.hidden) {
          (dataset.data as (number | null)[])[index] = null;
          if (labels && labels[index] !== undefined) {
            labels[index] = '';
          }
        }
      });
    } else {
      // Multi-dataset: hide entire datasets
      const datasets = this.chart.data.datasets;
      items.forEach((item) => {
        if (item.hidden) {
          datasets.forEach((dataset, datasetIndex) => {
            if (dataset.label?.includes(item.label)) {
              const meta = this.chart!.getDatasetMeta(datasetIndex);
              meta.hidden = true;
            }
          });
        }
      });
    }

    this.chart.update();
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

    // Re-store original values when data changes
    this.storeOriginalValues();

    // Reset toggled state when data changes
    this.toggledIndices.set(new Set());

    // Update chart options
    const chartOptions = this.mergeOptions(this.getDefaultOptions(), this.options());
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

    // Re-apply initial visibility from legend items
    this.applyInitialVisibility();

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
   * Handle legend item click - toggle visibility of related data
   * Handles both multi-dataset charts and single-dataset category charts
   */
  onLegendItemClick(event: { index: number; item: ChartLegendItem }): void {
    if (!this.chart) return;

    if (this.isSingleDatasetCategoryChart()) {
      // Single dataset: toggle individual data point and label
      const dataset = this.chart.data.datasets[0];
      const dataArray = dataset.data as (number | null)[];
      const labels = this.chart.data.labels as string[];
      const originalValue = this.originalDataValues[0]?.[event.index];
      const originalLabel = this.originalLabels[event.index];

      if (dataArray[event.index] === null) {
        // Show: restore original value and label
        dataArray[event.index] = originalValue ?? 0;
        if (labels) labels[event.index] = originalLabel ?? '';
      } else {
        // Hide: set to null and clear label
        dataArray[event.index] = null;
        if (labels) labels[event.index] = '';
      }
    } else {
      // Multi-dataset: toggle entire datasets matching the label
      const clickedLabel = event.item.label;
      this.chart.data.datasets.forEach((dataset, datasetIndex) => {
        if (dataset.label?.includes(clickedLabel)) {
          const meta = this.chart!.getDatasetMeta(datasetIndex);
          meta.hidden = !meta.hidden;
        }
      });
    }

    // Update internal toggled state
    this.toggledIndices.update(set => {
      const newSet = new Set(set);
      if (newSet.has(event.index)) {
        newSet.delete(event.index);
      } else {
        newSet.add(event.index);
      }
      return newSet;
    });

    // Emit updated legend items to parent
    this.legendItemsChange.emit(this.displayLegendItems());

    this.chart.update();
    this.cdr.detectChanges();
  }

  /**
   * Show all data points/datasets
   */
  onShowAll(): void {
    if (!this.chart) return;

    const items = this.legendItems();

    if (this.isSingleDatasetCategoryChart()) {
      // Single dataset: restore all original values and labels
      const dataset = this.chart.data.datasets[0];
      const labels = this.chart.data.labels as string[];
      const originalValues = this.originalDataValues[0] || [];
      originalValues.forEach((value, index) => {
        (dataset.data as (number | null)[])[index] = value;
        if (labels) labels[index] = this.originalLabels[index] ?? '';
      });
    } else {
      // Multi-dataset: show all datasets
      this.chart.data.datasets.forEach((_, datasetIndex) => {
        this.chart!.getDatasetMeta(datasetIndex).hidden = false;
      });
    }

    // Reset toggled indices - track which items were originally hidden
    const newToggledSet = new Set<number>();
    items.forEach((item, index) => {
      if (item.hidden) {
        newToggledSet.add(index);
      }
    });
    this.toggledIndices.set(newToggledSet);

    this.legendItemsChange.emit(this.displayLegendItems());
    this.chart.update();
    this.cdr.detectChanges();
  }

  /**
   * Hide all data points/datasets
   */
  onHideAll(): void {
    if (!this.chart) return;

    const items = this.legendItems();

    if (this.isSingleDatasetCategoryChart()) {
      // Single dataset: set all values to null and clear labels
      const dataset = this.chart.data.datasets[0];
      const dataArray = dataset.data as (number | null)[];
      const labels = this.chart.data.labels as string[];
      dataArray.forEach((_, index) => {
        dataArray[index] = null;
        if (labels) labels[index] = '';
      });
    } else {
      // Multi-dataset: hide all datasets
      this.chart.data.datasets.forEach((_, datasetIndex) => {
        this.chart!.getDatasetMeta(datasetIndex).hidden = true;
      });
    }

    // Update toggled indices - track which items were originally visible
    const newToggledSet = new Set<number>();
    items.forEach((item, index) => {
      if (!item.hidden) {
        newToggledSet.add(index);
      }
    });
    this.toggledIndices.set(newToggledSet);

    this.legendItemsChange.emit(this.displayLegendItems());
    this.chart.update();
    this.cdr.detectChanges();
  }

  /**
   * Show only top N data points/datasets by value (reset to initial state)
   */
  onShowTopN(): void {
    if (!this.chart) return;

    const items = this.legendItems();
    const topN = this.defaultTopN();

    // Find top N indices by value
    const sortedByValue = items
      .map((item, index) => ({ index, value: item.value ?? 0 }))
      .sort((a, b) => b.value - a.value);
    const topIndices = new Set(sortedByValue.slice(0, topN).map(i => i.index));

    if (this.isSingleDatasetCategoryChart()) {
      // Single dataset: show only top N data points and labels
      const dataset = this.chart.data.datasets[0];
      const labels = this.chart.data.labels as string[];
      const originalValues = this.originalDataValues[0] || [];
      items.forEach((_, index) => {
        const shouldBeVisible = topIndices.has(index);
        (dataset.data as (number | null)[])[index] = shouldBeVisible ? originalValues[index] : null;
        if (labels) labels[index] = shouldBeVisible ? (this.originalLabels[index] ?? '') : '';
      });
    } else {
      // Multi-dataset: hide/show datasets
      items.forEach((item, index) => {
        const shouldBeVisible = topIndices.has(index);
        this.chart!.data.datasets.forEach((dataset) => {
          if (dataset.label?.includes(item.label)) {
            const datasetIndex = this.chart!.data.datasets.indexOf(dataset);
            this.chart!.getDatasetMeta(datasetIndex).hidden = !shouldBeVisible;
          }
        });
      });
    }

    // Reset toggled indices
    this.toggledIndices.set(new Set());

    this.legendItemsChange.emit(this.displayLegendItems());
    this.chart.update();
    this.cdr.detectChanges();
  }
}
