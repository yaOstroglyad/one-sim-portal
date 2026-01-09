import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDateForAPI, TableFooterConfig, CurrencyPriceCalculatorUtils } from '@shared';
import { TrafficUsage, TrafficUsageWithMetadata } from '../models/traffic-usage.model';
import { ReportStrategy, ReportLoadParams } from '../models/report-strategy.interface';
import { TrafficUsageDataService } from '../services/traffic-usage-data.service';
import { TRAFFIC_USAGE_EXCEL_MAPPING } from '../utils';

/**
 * Strategy for Traffic Usage Report
 * Handles data loading, export configuration for traffic usage
 */
@Injectable({
  providedIn: 'root'
})
export class TrafficUsageStrategy implements ReportStrategy<TrafficUsage> {
  private readonly dataService = inject(TrafficUsageDataService);

  /**
   * Load traffic usage data from API
   * Returns records array with metadata attached containing API totals
   */
  loadData(params: ReportLoadParams): Observable<TrafficUsage[]> {
    const apiParams = {
      dateFrom: formatDateForAPI(params.period.startDate),
      dateTo: formatDateForAPI(params.period.endDate),
      accountId: params.accountId
    };

    return this.dataService.getTrafficUsage(apiParams).pipe(
      map(response => {
        const enhancedData: TrafficUsageWithMetadata = response.records as TrafficUsageWithMetadata;
        enhancedData.__metadata = {
          currency: response.currency,
          totalCostSum: response.totalCostSum
        };
        return enhancedData;
      })
    );
  }

  /**
   * Get column mapping for Excel export
   */
  getExportMapping(): Record<keyof TrafficUsage, string> {
    return TRAFFIC_USAGE_EXCEL_MAPPING;
  }

  /**
   * Get description translation key
   */
  getDescriptionKey(): string {
    return 'analytics.reports.trafficUsage.description';
  }

  /**
   * Get export file name prefix
   */
  getExportFilePrefix(): string {
    return 'traffic_usage';
  }

  /**
   * Get sheet name translation key
   */
  getSheetNameKey(): string {
    return 'analytics.reports.trafficUsage.title';
  }

  /**
   * Get empty state title translation key
   */
  getEmptyStateTitleKey(): string {
    return 'analytics.reports.trafficUsage.emptyState.title';
  }

  /**
   * Get empty state description translation key
   */
  getEmptyStateDescriptionKey(): string {
    return 'analytics.reports.trafficUsage.emptyState.description';
  }

  /**
   * Get footer configuration for Traffic Usage table
   * Shows sum of Total Cost
   */
  getFooterConfig(): TableFooterConfig {
    return {
      enabled: true,
      label: 'Total'
    };
  }

  /**
   * Calculate footer values using API totals from metadata
   * API provides totalCostSum which is the sum of all totalCost values
   */
  calculateFooterValues(data: TrafficUsage[]): { values: Record<string, string>, tooltips?: Record<string, string> } {
    const metadata = (data as TrafficUsageWithMetadata).__metadata;

    if (metadata) {
      const formatWithCurrency = (amount: number, currency: string): string => {
        return CurrencyPriceCalculatorUtils.formatPrice(amount, currency);
      };

      return {
        values: {
          totalCost: formatWithCurrency(metadata.totalCostSum, metadata.currency)
        },
        tooltips: {
          totalCost: 'Total from API'
        }
      };
    }

    console.warn('API totals metadata not found in data array, using empty values');
    return {
      values: {
        totalCost: '0.00'
      }
    };
  }

  /**
   * Get list of numeric fields for Excel export
   * Only these fields will be converted from strings to numbers
   */
  getNumericFields(): (keyof TrafficUsage)[] {
    return ['usageMb', 'totalCost', 'costPerMb'];
  }
}
