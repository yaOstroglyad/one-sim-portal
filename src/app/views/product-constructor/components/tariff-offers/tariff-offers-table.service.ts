import { inject, Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ADMIN_PERMISSION,
  AuthService,
  SPECIAL_PERMISSION,
  TableConfig,
  TableConfigAbstractService,
  TemplateType
} from '../../../../shared';
import { TariffOffer } from '../../models/tariff-offer.model';

@Injectable()
export class TariffOffersTableService extends TableConfigAbstractService<TariffOffer> {
  private authService = inject(AuthService);
  private isSpecial = this.authService.hasPermission(SPECIAL_PERMISSION);
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  // Template references
  public priceTemplate: TemplateRef<any>;
  public statusTemplate: TemplateRef<any>;

  public originalDataSubject = new BehaviorSubject<TariffOffer[]>([]);
  public dataList$: Observable<TariffOffer[]> = this.originalDataSubject.asObservable();
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    pagination: {
      enabled: true,
      serverSide: true
    },
    translatePrefix: 'productConstructor.tariffOffers.',
    showCheckboxes: false,
    showEditButton: false,
    showAddButton: this.isAdmin || this.isSpecial,
    showMenu: true,
    columns: [
      {
        visible: false,
        key: 'id',
        header: 'id'
      },
      {
        visible: true,
        key: 'product.name',
        header: 'productName',
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '200px'
      },
      {
        visible: true,
        key: 'providerProduct.serviceProvider.name',
        header: 'providerName',
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '150px'
      },
      {
        visible: true,
        key: 'price',
        header: 'price',
        templateType: TemplateType.Custom,
        sortable: true,
        minWidth: '120px',
        customTemplate: () => this.priceTemplate
      },
      {
        visible: true,
        key: 'currency',
        header: 'currency',
        templateType: TemplateType.Text,
        sortable: true,
        minWidth: '100px'
      },
      {
        visible: false,
        key: 'createdAt',
        header: 'createdAt',
        templateType: TemplateType.Date,
        sortable: true,
        minWidth: '120px'
      }
    ]
  });

  public tableConfig$ = this.tableConfigSubject.asObservable();

  public setTemplates(priceTemplate: TemplateRef<any>, statusTemplate: TemplateRef<any>): void {
    this.priceTemplate = priceTemplate;
    this.statusTemplate = statusTemplate;
    this.tableConfigSubject.next(this.tableConfigSubject.value);
  }

  public updateColumnVisibility(selectedColumns: Set<string>): void {
    const currentConfig = this.tableConfigSubject.value;
    const updatedColumns = currentConfig.columns.map(column => ({
      ...column,
      visible: selectedColumns.has(column.key)
    }));
    
    this.tableConfigSubject.next({
      ...currentConfig,
      columns: updatedColumns
    });
  }
}