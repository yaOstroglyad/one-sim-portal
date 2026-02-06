import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TableConfig, TemplateType, ProductPurchase, TableConfigAbstractService } from '@shared';



@Injectable({ providedIn: 'root' })
export class PurchasedProductsTableService extends TableConfigAbstractService<ProductPurchase> {
  statusTemplate!: TemplateRef<any>;
  priceTemplate!: TemplateRef<any>;
  totalBalanceTemplate!: TemplateRef<any>;
  remainingBalanceTemplate!: TemplateRef<any>;


  public tableConfigSubject = new BehaviorSubject<TableConfig>({
    translatePrefix: 'purchasedProducts.',
    showCheckboxes: false,
    showAddButton: false,
    showEditButton: false,
    showMenu: false,
    pagination: { enabled: false, serverSide: false },
    columns: [
      { visible: true, key: 'productName', header: 'productName' },

      { visible: true, key: 'status', header: 'status', templateType: TemplateType.Custom,
        customTemplate: () => this.statusTemplate },

      { visible: true, key: 'price', header: 'price', templateType: TemplateType.Custom,
        customTemplate: () => this.priceTemplate },

      { visible: true, key: 'totalBalance', header: 'totalBalance', templateType: TemplateType.Custom,
        customTemplate: () => this.totalBalanceTemplate },

      { visible: true, key: 'remainingBalance', header: 'remainingBalance', templateType: TemplateType.Custom,
        customTemplate: () => this.remainingBalanceTemplate },

      { visible: true, key: 'purchasedAt', header: 'purchasedAt', templateType: TemplateType.Date },
      { visible: true, key: 'usageStartedAt', header: 'usageStartedAt', templateType: TemplateType.Date },
      { visible: true, key: 'usageExpiredAt', header: 'usageExpiredAt', templateType: TemplateType.Date },
      { visible: true, key: 'updatedAt', header: 'updatedAt', templateType: TemplateType.Date },
      { visible: true, key: 'updatedBy', header: 'updatedBy' }
    ]
  });


  constructor() { super(); }

  updateTableData(data: ProductPurchase[]): void {
    this.originalDataSubject.next(data);
  }

  setTemplates(tpls: {
    status: TemplateRef<any>;
    price: TemplateRef<any>;
    totalBalance: TemplateRef<any>;
    remainingBalance: TemplateRef<any>;
  }): void {
    this.statusTemplate = tpls.status;
    this.priceTemplate = tpls.price;
    this.totalBalanceTemplate = tpls.totalBalance;
    this.remainingBalanceTemplate = tpls.remainingBalance;
  }
}
