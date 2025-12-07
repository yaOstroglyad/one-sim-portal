import { Injectable, signal } from '@angular/core';
import { DashboardPeriod } from '../models/dashboard.types';
import { getDefaultPeriod } from '@shared';

/**
 * Shared state service for dashboard
 * Manages period and accountId that are used by all tab services
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  // Period management with Signals
  private readonly selectedPeriodSignal = signal<DashboardPeriod>(getDefaultPeriod());
  public readonly period = this.selectedPeriodSignal.asReadonly();

  // Account ID for filtering data (used by admins)
  private readonly accountIdSignal = signal<string | null>(null);
  public readonly accountId = this.accountIdSignal.asReadonly();

  /**
   * Update selected period
   */
  setPeriod(period: DashboardPeriod): void {
    this.selectedPeriodSignal.set(period);
  }

  /**
   * Get current period value
   */
  getCurrentPeriod(): DashboardPeriod {
    return this.selectedPeriodSignal();
  }

  /**
   * Set account ID for filtering (used by admins)
   */
  setAccountId(accountId: string | null): void {
    this.accountIdSignal.set(accountId);
  }

  /**
   * Get current account ID
   */
  getAccountId(): string | null {
    return this.accountIdSignal();
  }

  /**
   * Map frontend period preset to backend PeriodType enum
   * Backend supports: DAY, WEEK, MONTH, CUSTOM
   */
  mapPeriodToApiEnum(preset?: string): string {
    const mapping: Record<string, string> = {
      'today': 'DAY',
      'last7days': 'WEEK',
      'currentMonth': 'MONTH',
      'last3months': 'CUSTOM',
      'custom': 'CUSTOM'
    };
    return mapping[preset || 'custom'] || 'CUSTOM';
  }
}
