import { Injectable, inject } from '@angular/core';
import { ReportStrategy } from '../models/report-strategy.interface';
import { ReportTabId } from '../models/report-tab.model';
import { BundlePurchasesStrategy } from '../strategies/bundle-purchases.strategy';
import { BundleLeftoversStrategy } from '../strategies/bundle-leftovers.strategy';
import { TrafficUsageStrategy } from '../strategies/traffic-usage.strategy';

/**
 * Factory service for creating report strategies
 * Implements Factory pattern to provide the correct strategy based on tab ID
 *
 * This service centralizes strategy creation and ensures
 * only one instance of each strategy exists (singleton pattern)
 */
@Injectable({
  providedIn: 'root'
})
export class ReportStrategyService {
  private readonly bundlePurchasesStrategy = inject(BundlePurchasesStrategy);
  private readonly bundleLeftoversStrategy = inject(BundleLeftoversStrategy);
  private readonly trafficUsageStrategy = inject(TrafficUsageStrategy);

  /**
   * Get strategy instance for the given tab ID
   * @param tabId - ID of the active report tab
   * @returns Strategy instance for the tab
   * @throws Error if tab ID is not recognized
   */
  getStrategy(tabId: string): ReportStrategy {
    switch (tabId) {
      case ReportTabId.BUNDLE_PURCHASES:
        return this.bundlePurchasesStrategy;

      case ReportTabId.BUNDLE_LEFTOVERS:
        return this.bundleLeftoversStrategy;

      case ReportTabId.TRAFFIC_USAGE:
        return this.trafficUsageStrategy;

      default:
        throw new Error(`Unknown report tab ID: ${tabId}`);
    }
  }

  /**
   * Check if a tab has an implemented strategy
   * Useful for disabling tabs that are not ready yet
   * @param tabId - ID of the report tab
   * @returns true if strategy is fully implemented
   */
  isStrategyImplemented(tabId: string): boolean {
    switch (tabId) {
      case ReportTabId.BUNDLE_PURCHASES:
        return true;

      case ReportTabId.BUNDLE_LEFTOVERS:
        return true;

      case ReportTabId.TRAFFIC_USAGE:
        return true;

      default:
        return false;
    }
  }
}
