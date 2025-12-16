import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from '@shared';
import { BundleLeftover } from '../models/bundle-leftover.model';
import { BundleLeftoversStrategy } from '../strategies/bundle-leftovers.strategy';

/**
 * Table configuration service for Bundle Leftovers Report
 * Extends TableConfigAbstractService to provide consistent table functionality
 */
@Injectable({
  providedIn: 'root'
})
export class BundleLeftoversTableService extends TableConfigAbstractService<BundleLeftover> {
  private readonly strategy = inject(BundleLeftoversStrategy);

  public originalDataSubject = new BehaviorSubject<BundleLeftover[]>([]);
  public dataList$: Observable<BundleLeftover[]> = this.originalDataSubject.asObservable();

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'analytics.reports.bundleLeftovers.',
    showCheckboxes: false,
    showEditButton: false,
    showMenu: false,
    footer: this.strategy.getFooterConfig?.() || undefined,
    columns: [
      {
        visible: true,
        key: 'company',
        header: 'company'
      },
      {
        visible: true,
        key: 'purchaseDate',
        header: 'purchaseDate',
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/yyyy'
      },
      {
        visible: true,
        key: 'expirationDate',
        header: 'expirationDate',
        templateType: TemplateType.Date,
        dateFormat: 'dd/MM/yyyy'
      },
      {
        visible: true,
        key: 'bundle',
        header: 'bundle'
      },
      {
        visible: true,
        key: 'subscriber',
        header: 'subscriber'
      },
      {
        visible: true,
        key: 'iccid',
        header: 'iccid'
      },
      {
        visible: true,
        key: 'purchaseId',
        header: 'purchaseId'
      },
      {
        visible: true,
        key: 'bundleStatus',
        header: 'bundleStatus'
      },
      {
        visible: true,
        key: 'bundlePrice',
        header: 'bundlePrice'
      },
      {
        visible: true,
        key: 'priceCurrency',
        header: 'priceCurrency'
      },
      {
        visible: true,
        key: 'initialVolumeMb',
        header: 'initialVolumeMb'
      },
      {
        visible: true,
        key: 'unusedVolumeMb',
        header: 'unusedVolumeMb'
      },
      {
        visible: true,
        key: 'percentLeftovers',
        header: 'percentLeftovers'
      },
      {
        visible: false,
        key: 'providerPriceMb',
        header: 'providerPriceMb'
      },
      {
        visible: true,
        key: 'leftovers',
        header: 'leftovers'
      }
    ]
  });

  constructor() {
    super();
  }
}
