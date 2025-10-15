import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef
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
  SmartFilterState,
  FilterChip,
  DEFAULT_SMART_FILTER_CONFIG,
  FilterFieldConfig,
} from './models/smart-filter.interface';
import { SmartFilterValueMapperService } from './services/smart-filter-value-mapper.service';
import { TranslateModule } from '@ngx-translate/core';

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
  @Input() formGroup: FormGroup;
  @Input() config: SmartFilterConfig = DEFAULT_SMART_FILTER_CONFIG;

  @Output() resetFilters = new EventEmitter<void>();
  @Output() filtersChanged = new EventEmitter<any>();

  @ContentChild('simpleFilters', { static: true }) simpleFiltersTemplate: TemplateRef<any>;
  @ContentChild('advancedFilters', { static: true }) advancedFiltersTemplate: TemplateRef<any>;

  public state: SmartFilterState = {
    mode: 'simple',
    showFilterPanel: false,
    activeFilters: [],
    filterCount: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private valueMapperService: SmartFilterValueMapperService
  ) {}

  ngOnInit(): void {
    this.calculateFilterCount();
    this.determineDisplayMode();
    this.initializeDefaultFilters();
    this.watchFormChanges();

    // Process initial form values to show badges for default filters
    if (this.formGroup) {
      const initialValues = this.formGroup.value;
      this.updateActiveFilters(initialValues).then(() => {
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Cleanup expired cache entries on component destroy
    this.valueMapperService.cleanupExpiredCache();
  }

  private calculateFilterCount(): void {
    if (!this.formGroup) return;

    this.state.filterCount = this.config.fields.length || Object.keys(this.formGroup.controls).length;
  }

  private initializeDefaultFilters(): void {
    if (!this.formGroup) return;

    this.config.fields.forEach(fieldConfig => {
      const control = this.formGroup.controls[fieldConfig.key];
      if (control && fieldConfig.defaultValue !== undefined && !control.value) {
        control.setValue(fieldConfig.defaultValue);
      }
    });
  }

  private determineDisplayMode(): void {
    this.state.mode = this.state.filterCount > this.config.threshold ? 'advanced' : 'simple';
  }

  private watchFormChanges(): void {
    if (!this.formGroup) return;

    this.formGroup.valueChanges
      .pipe(
        debounceTime(this.config.globalSettings?.debounceTime || 700),
        takeUntil(this.destroy$)
      )
      .subscribe(async values => {
        await this.updateActiveFilters(values);
        this.filtersChanged.emit(values);
        this.cdr.markForCheck();
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

    const activeFilters = await Promise.all(activeFiltersPromises);

    // Сортируем по приоритету (меньше число = выше приоритет)
    this.state.activeFilters = activeFilters.sort((a, b) => a.priority - b.priority);
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
    return this.config.fields.find(field => field.key === key);
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

    const cacheTTL = this.config.globalSettings?.cacheTTL || 300000;

    return await this.valueMapperService.mapValue(
      value,
      mapper,
      this.config.services,
      cacheTTL
    );
  }

  public openFilters(): void {
    this.state.showFilterPanel = true;
    this.cdr.markForCheck();
  }

  public closeFilters(): void {
    this.state.showFilterPanel = false;
    this.cdr.markForCheck();
  }

  public onResetFilters(): void {
    if (this.config.globalSettings?.resetToDefaults) {
      // Сброс к дефолтным значениям
      this.config.fields.forEach(fieldConfig => {
        const control = this.formGroup?.controls[fieldConfig.key];
        if (control) {
          control.setValue(fieldConfig.defaultValue || null);
        }
      });
    } else {
      // Полный сброс
      this.formGroup?.reset();
    }

    this.resetFilters.emit();
  }

  public removeFilter(filterKey: string): void {
    const fieldConfig = this.getFieldConfig(filterKey);

    // Проверяем, можно ли удалить фильтр
    if (!this.isFilterRemovable(fieldConfig)) {
      return; // Не удаляем обязательные фильтры
    }

    if (this.formGroup?.controls[filterKey]) {
      // Если есть дефолтное значение и настроена опция сброса к дефолтам
      if (fieldConfig?.defaultValue !== undefined && this.config.globalSettings?.resetToDefaults) {
        this.formGroup.controls[filterKey].setValue(fieldConfig.defaultValue);
      } else {
        this.formGroup.controls[filterKey].setValue(null);
      }
    }
  }

  // Геттеры для шаблона
  get isAdvancedMode(): boolean {
    return this.state.mode === 'advanced';
  }

  get visibleChips(): FilterChip[] {
    return this.state.activeFilters.slice(0, this.config.maxVisibleChips);
  }

  get hiddenChipsCount(): number {
    return Math.max(0, this.state.activeFilters.length - this.config.maxVisibleChips);
  }

  get hasOverflowChips(): boolean {
    return this.hiddenChipsCount > 0;
  }

  get hiddenChipsTooltip(): string {
    const hiddenChips = this.state.activeFilters.slice(this.config.maxVisibleChips);
    return hiddenChips.map(chip => `• ${chip.label}: ${chip.displayValue}`).join('\n');
  }

  get hasActiveFilters(): boolean {
    return this.state.activeFilters.length > 0;
  }
}
