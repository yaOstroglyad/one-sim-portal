import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
  signal,
  computed,
  input,
  output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ButtonDirective, BadgeComponent } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { GenericRightPanelComponent } from '../generic-right-panel';
import { TooltipDirective } from '../tooltip';
import {
  SmartFilterConfig,
  FilterChip,
  DEFAULT_SMART_FILTER_CONFIG,
  FilterFieldConfig,
} from './models/smart-filter.interface';
import { SmartFilterValueMapperService } from './services/smart-filter-value-mapper.service';
import { TranslateModule } from '@ngx-translate/core';

type DisplayMode = 'simple' | 'advanced';

@Component({
  standalone: true,
    selector: 'app-smart-filter-header',
    templateUrl: './smart-filter-header.component.html',
    styleUrls: ['./smart-filter-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ButtonDirective,
        BadgeComponent,
        IconDirective,
        GenericRightPanelComponent,
        TooltipDirective,
        TranslateModule
    ]
})
export class SmartFilterHeaderComponent implements OnInit, OnDestroy {
  // Inputs using signal inputs
  formGroup = input.required<FormGroup>();
  config = input<SmartFilterConfig>(DEFAULT_SMART_FILTER_CONFIG);

  // Outputs using output()
  resetFilters = output<void>();
  filtersChanged = output<any>();

  // Content children
  @ContentChild('simpleFilters', { static: true }) simpleFiltersTemplate: TemplateRef<any>;
  @ContentChild('advancedFilters', { static: true }) advancedFiltersTemplate: TemplateRef<any>;

  // Services
  private readonly valueMapperService = inject(SmartFilterValueMapperService);
  private readonly elementRef = inject(ElementRef);

  // State signals
  protected readonly mode = signal<DisplayMode>('simple');
  protected readonly showFilterPanel = signal(false);
  protected readonly activeFilters = signal<FilterChip[]>([]);
  protected readonly filterCount = signal(0);

  // Computed signals
  protected readonly isAdvancedMode = computed(() => this.mode() === 'advanced');
  protected readonly visibleChips = computed(() =>
    this.activeFilters().slice(0, this.config().maxVisibleChips)
  );
  protected readonly hiddenChipsCount = computed(() =>
    Math.max(0, this.activeFilters().length - this.config().maxVisibleChips)
  );
  protected readonly hasOverflowChips = computed(() => this.hiddenChipsCount() > 0);
  protected readonly hasActiveFilters = computed(() => this.activeFilters().length > 0);
  protected readonly hiddenChipsTooltip = computed(() => {
    const hiddenChips = this.activeFilters().slice(this.config().maxVisibleChips);
    return hiddenChips.map(chip => `• ${chip.label}: ${chip.displayValue}`).join('\n');
  });

  // Private state
  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | null = null;
  private readonly MIN_FILTER_WIDTH = 180;
  private readonly GAP_SIZE = 16;

  ngOnInit(): void {
    this.calculateFilterCount();
    this.setupResizeObserver();
    this.determineDisplayMode();
    this.initializeDefaultFilters();
    this.watchFormChanges();

    // Process initial form values to show badges for default filters
    const formGroup = this.formGroup();
    if (formGroup) {
      const initialValues = formGroup.value;
      this.updateActiveFilters(initialValues);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Cleanup resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Cleanup expired cache entries on component destroy
    this.valueMapperService.cleanupExpiredCache();
  }

  private calculateFilterCount(): void {
    const formGroup = this.formGroup();
    if (!formGroup) return;

    const count = this.config().fields.length || Object.keys(formGroup.controls).length;
    this.filterCount.set(count);
  }

  private initializeDefaultFilters(): void {
    const formGroup = this.formGroup();
    if (!formGroup) return;

    this.config().fields.forEach(fieldConfig => {
      const control = formGroup.controls[fieldConfig.key];
      if (control && fieldConfig.defaultValue !== undefined && !control.value) {
        control.setValue(fieldConfig.defaultValue);
      }
    });
  }

  private setupResizeObserver(): void {
    // ResizeObserver для отслеживания изменения ширины
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        this.determineDisplayMode(entry.contentRect.width);
      }
    });

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  private determineDisplayMode(containerWidth?: number): void {
    // Если ширина не передана, получаем текущую ширину
    if (containerWidth === undefined) {
      containerWidth = this.elementRef.nativeElement.offsetWidth;
    }

    // Вычисляем, сколько фильтров может поместиться в одну строку
    const availableWidth = containerWidth - this.GAP_SIZE;
    const filterWithGap = this.MIN_FILTER_WIDTH + this.GAP_SIZE;
    const maxFiltersPerRow = Math.floor(availableWidth / filterWithGap);

    // Если все фильтры помещаются - Simple Mode, иначе Advanced
    const newMode: DisplayMode = maxFiltersPerRow >= this.filterCount() ? 'simple' : 'advanced';
    this.mode.set(newMode);
  }

  private watchFormChanges(): void {
    const formGroup = this.formGroup();
    if (!formGroup) return;

    formGroup.valueChanges
      .pipe(
        debounceTime(this.config().globalSettings?.debounceTime || 700),
        takeUntil(this.destroy$)
      )
      .subscribe(async values => {
        await this.updateActiveFilters(values);
        this.filtersChanged.emit(values);
      });
  }

  private async updateActiveFilters(formValues: any): Promise<void> {
    const activeFiltersPromises = Object.entries(formValues)
      .filter(([key, value]) => this.shouldShowFilter(key, value))
      .map(async ([key, value]) => {
        const fieldConfig = this.getFieldConfig(key);
        const displayValue = await this.formatDisplayValue(value, fieldConfig);

        const tooltip = this.generateTooltip(fieldConfig, value, displayValue);

        return {
          key,
          label: fieldConfig?.label || key,
          value,
          displayValue,
          config: fieldConfig,
          removable: this.isFilterRemovable(fieldConfig),
          color: fieldConfig?.chipConfig?.color || 'primary',
          tooltip,
          priority: fieldConfig?.chipConfig?.priority || 100
        } as FilterChip;
      });

    const filters = await Promise.all(activeFiltersPromises);

    // Сортируем по приоритету (меньше число = выше приоритет)
    const sortedFilters = filters.sort((a, b) => a.priority - b.priority);
    this.activeFilters.set(sortedFilters);
  }

  private shouldShowFilter(key: string, value: any): boolean {
    // Пропускаем пустые значения
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const fieldConfig = this.getFieldConfig(key);

    // Скрытые фильтры не показываем
    return !fieldConfig?.hidden;
  }

  private getFieldConfig(key: string): FilterFieldConfig | undefined {
    return this.config().fields.find(field => field.key === key);
  }

  private isFilterRemovable(fieldConfig?: FilterFieldConfig): boolean {
    if (fieldConfig?.alwaysActive || fieldConfig?.required) {
      return false;
    }

    if (fieldConfig?.chipConfig?.removable !== undefined) {
      return fieldConfig.chipConfig.removable;
    }

    return true; // По умолчанию можно удалить
  }

  private generateTooltip(fieldConfig?: FilterFieldConfig, value?: any, displayValue?: string): string | undefined {
    const tooltipConfig = fieldConfig?.chipConfig?.tooltip;

    if (!tooltipConfig) {
      return undefined;
    }

    if (typeof tooltipConfig === 'function') {
      try {
        return tooltipConfig(value, displayValue);
      } catch (error) {
        console.warn(`Error generating tooltip for filter "${fieldConfig?.key}":`, error);
        return undefined;
      }
    }

    return tooltipConfig; // Статическая строка
  }

  private async formatDisplayValue(value: any, fieldConfig?: FilterFieldConfig): Promise<string> {
    // Handle searchable-select format first
    if (typeof value === 'object' && value?.label) {
      return value.label;
    }

    const mapper = fieldConfig?.valueMapper;
    if (!mapper) {
      return String(value);
    }

    const cacheTTL = this.config().globalSettings?.cacheTTL || 300000;

    return await this.valueMapperService.mapValue(
      value,
      mapper,
      this.config().services,
      cacheTTL
    );
  }

  public openFilters(): void {
    this.showFilterPanel.set(true);
  }

  public closeFilters(): void {
    this.showFilterPanel.set(false);
  }

  public onResetFilters(): void {
    const formGroup = this.formGroup();
    const config = this.config();

    if (config.globalSettings?.resetToDefaults) {
      // Сброс к дефолтным значениям
      config.fields.forEach(fieldConfig => {
        const control = formGroup?.controls[fieldConfig.key];
        if (control) {
          control.setValue(fieldConfig.defaultValue || null);
        }
      });
    } else {
      // Полный сброс
      formGroup?.reset();
    }

    this.resetFilters.emit();
  }

  public removeFilter(filterKey: string): void {
    const fieldConfig = this.getFieldConfig(filterKey);

    // Проверяем, можно ли удалить фильтр
    if (!this.isFilterRemovable(fieldConfig)) {
      return; // Не удаляем обязательные фильтры
    }

    const formGroup = this.formGroup();
    const config = this.config();

    if (formGroup?.controls[filterKey]) {
      // Если есть дефолтное значение и настроена опция сброса к дефолтам
      if (fieldConfig?.defaultValue !== undefined && config.globalSettings?.resetToDefaults) {
        formGroup.controls[filterKey].setValue(fieldConfig.defaultValue);
      } else {
        formGroup.controls[filterKey].setValue(null);
      }
    }
  }
}
