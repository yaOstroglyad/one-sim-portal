import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService } from '@shared';
import { TrafficUsage } from '../models/traffic-usage.model';
import { TrafficUsageStrategy } from '../strategies/traffic-usage.strategy';

/**
 * Table configuration service for Traffic Usage Report
 * Extends TableConfigAbstractService to provide consistent table functionality
 */
@Injectable({
  providedIn: 'root'
})
export class TrafficUsageTableService extends TableConfigAbstractService<TrafficUsage> {
  private readonly strategy = inject(TrafficUsageStrategy);

  public originalDataSubject = new BehaviorSubject<TrafficUsage[]>([]);
  public dataList$: Observable<TrafficUsage[]> = this.originalDataSubject.asObservable();

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'analytics.reports.trafficUsage.',
    showCheckboxes: false,
    showEditButton: false,
    showMenu: false,
    footer: this.strategy.getFooterConfig?.() || undefined,
    columns: [
      {
        visible: true,
        key: 'country',
        header: 'country'
      },
      {
        visible: true,
        key: 'company',
        header: 'company'
      },
      {
        visible: true,
        key: 'usageMb',
        header: 'usageMb'
      },
      {
        visible: true,
        key: 'totalCost',
        header: 'totalCost'
      },
      {
        visible: true,
        key: 'costPerMb',
        header: 'costPerMb'
      }
    ]
  });

  constructor() {
    super();
  }
}
