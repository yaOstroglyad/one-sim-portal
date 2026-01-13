import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  DashboardResponse,
  DashboardPeriod,
  ExecutiveTabData,
  SubscriberSummaryResponse,
  PeriodStatusesResponse,
  BundleSubscribersResponse
} from '../models/dashboard.types';
import { FinanceAnalytics } from '../models/finance.types';
import { TrafficUsagePeriodResponse } from '../models/traffic.types';

import { DashboardStateService } from './dashboard-state.service';
import { ExecutiveDataService } from './executive-data.service';
import { SubscribersDataService } from './subscribers-data.service';
import { TrafficDataService } from './traffic-data.service';
import { FinanceDataService } from './finance-data.service';

/**
 * Facade service for dashboard data
 * Delegates to specialized services for each tab
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly stateService = inject(DashboardStateService);
  private readonly executiveService = inject(ExecutiveDataService);
  private readonly subscribersService = inject(SubscribersDataService);
  private readonly trafficService = inject(TrafficDataService);
  private readonly financeService = inject(FinanceDataService);

  // Expose state signals for backward compatibility
  public readonly period = this.stateService.period;
  public readonly accountId = this.stateService.accountId;
  public readonly isReady = this.stateService.isReady;

  // ===== Executive Tab =====

  getExecutiveData(): Observable<DashboardResponse<ExecutiveTabData>> {
    return this.executiveService.getExecutiveData();
  }

  // ===== Subscribers Tab =====

  getSubscriberSummary(): Observable<SubscriberSummaryResponse> {
    return this.subscribersService.getSubscriberSummary();
  }

  getNetworkStatuses(): Observable<PeriodStatusesResponse> {
    return this.subscribersService.getNetworkStatuses();
  }

  getBundleSubscribers(): Observable<BundleSubscribersResponse> {
    return this.subscribersService.getBundleSubscribers();
  }

  getBundleStatuses(): Observable<PeriodStatusesResponse> {
    return this.subscribersService.getBundleStatuses();
  }

  // ===== Traffic Tab =====

  getTrafficData(): Observable<TrafficUsagePeriodResponse | null> {
    return this.trafficService.getTrafficData();
  }

  // ===== Finance Tab =====

  getFinanceData(): Observable<DashboardResponse<FinanceAnalytics>> {
    return this.financeService.getFinanceData();
  }

  // ===== State Management =====

  setPeriod(period: DashboardPeriod): void {
    this.stateService.setPeriod(period);
  }

  getCurrentPeriod(): DashboardPeriod {
    return this.stateService.getCurrentPeriod();
  }

  setAccountId(accountId: string | null): void {
    this.stateService.setAccountId(accountId);
  }
}
