import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableConfig, TableConfigAbstractService, TemplateType } from '@shared';
import { BundlePurchase } from '../models/bundle-purchase.model';
import { BundlePurchasesStrategy } from '../strategies/bundle-purchases.strategy';

/**
 * Table configuration service for Bundle Purchases Report
 * Extends TableConfigAbstractService to provide consistent table functionality
 */
@Injectable({
  providedIn: 'root'
})
export class BundlePurchasesTableService extends TableConfigAbstractService<BundlePurchase> {
  private readonly strategy = inject(BundlePurchasesStrategy);

  public originalDataSubject = new BehaviorSubject<BundlePurchase[]>([]);
  public dataList$: Observable<BundlePurchase[]> = this.originalDataSubject.asObservable();

  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'analytics.reports.bundlePurchases.',
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
        key: 'purchaseId',
        header: 'purchaseId'
      },
      {
        visible: true,
        key: 'bundleStatus',
        header: 'bundleStatus'
      },
      {
        visible: false,
        key: 'transactionId',
        header: 'transactionId'
      },
      {
        visible: true,
        key: 'transactionStatus',
        header: 'transactionStatus'
      },
      {
        visible: true,
        key: 'iccid',
        header: 'iccid'
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
        key: 'bundleCost',
        header: 'bundleCost'
      },
      {
        visible: true,
        key: 'costCurrency',
        header: 'costCurrency'
      }
    ]
  });

  constructor() {
    super();
  }
}
