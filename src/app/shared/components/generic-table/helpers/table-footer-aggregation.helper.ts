import { TableConfig, AggregationType } from '@shared/models';

/**
 * Helper class for table footer aggregations
 * Handles calculation and formatting of aggregated values
 */
export class TableFooterAggregationHelper {
  /**
   * Calculate aggregation value for a specific column
   * @param data - Array of data items
   * @param columnKey - The column key to aggregate
   * @param type - Aggregation type (sum, avg, count, min, max)
   * @returns Aggregated value
   */
  static calculateAggregation(data: any[], columnKey: string, type: AggregationType): number {
    if (!data || data.length === 0) {
      return 0;
    }

    const values = data
      .map(item => {
        const value = item[columnKey];
        // Handle string numbers (like "10.25")
        return typeof value === 'string' ? parseFloat(value) : (value || 0);
      })
      .filter(v => !isNaN(v));

    switch (type) {
      case AggregationType.Sum:
        return values.reduce((sum, val) => sum + val, 0);
      case AggregationType.Average:
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
      case AggregationType.Count:
        return values.length;
      case AggregationType.Min:
        return values.length > 0 ? Math.min(...values) : 0;
      case AggregationType.Max:
        return values.length > 0 ? Math.max(...values) : 0;
      default:
        return 0;
    }
  }

  /**
   * Get aggregation value for display in footer
   * Hybrid approach: Uses customValues if provided, otherwise calculates aggregations
   * @param data - Array of data items
   * @param columnKey - The column key to aggregate
   * @param config - Table configuration
   * @returns Formatted aggregation value or empty string
   */
  static getAggregationValue(data: any[], columnKey: string, config: TableConfig): string {
    if (!config.footer?.enabled) {
      return '';
    }

    // Priority 1: Use custom values if provided (for complex cases like currency conversion)
    if (config.footer.customValues && config.footer.customValues[columnKey]) {
      return config.footer.customValues[columnKey];
    }

    // Priority 2: Calculate simple aggregations
    if (!config.footer.aggregations) {
      return '';
    }

    const aggregation = config.footer.aggregations.find(agg => agg.columnKey === columnKey);
    if (!aggregation) {
      return '';
    }

    const value = this.calculateAggregation(data, columnKey, aggregation.type);
    return aggregation.formatFn ? aggregation.formatFn(value) : value.toString();
  }

  /**
   * Get tooltip text for footer cell
   * @param columnKey - The column key
   * @param config - Table configuration
   * @returns Tooltip text or undefined
   */
  static getAggregationTooltip(columnKey: string, config: TableConfig): string | undefined {
    if (!config.footer?.enabled || !config.footer.customTooltips) {
      return undefined;
    }

    return config.footer.customTooltips[columnKey];
  }
}
