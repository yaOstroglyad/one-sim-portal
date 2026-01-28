import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  TableConfig,
  TableConfigAbstractService,
  TemplateType,
  TransactionOrder
} from '@shared';

@Injectable({
  providedIn: 'root'
})
export class TransactionOrdersTableService extends TableConfigAbstractService<TransactionOrder> {
  productPriceTemplate: TemplateRef<any>;
  public originalDataSubject = new BehaviorSubject<TransactionOrder[]>([]);
  public dataList$: Observable<TransactionOrder[]> = this.originalDataSubject.asObservable();
  public tableConfigSubject = new BehaviorSubject<TableConfig>({
  pagination: {
    enabled: false,
    serverSide: false
  },
  translatePrefix: 'transactionOrdersTable.',
  showCheckboxes: false,
  showAddButton: false,
  showEditButton: false,
  showMenu: false,
  columns: [
    { visible: true, key: 'type', header: 'type' },
    { visible: true, key: 'status', header: 'status' },
    { visible: true, key: 'productName', header: 'productName' },
{
  visible: true,
  key: 'price', 
  header: 'productPrice',
  templateType: TemplateType.Custom,
  customTemplate: () => this.productPriceTemplate
},
    { visible: true, key: 'paymentMethod', header: 'paymentMethod' },
    { visible: true, templateType: TemplateType.Date, key: 'createdAt', header: 'createdAt' },
    { visible: true, key: 'createdBy', header: 'createdBy' },
    { visible: true, templateType: TemplateType.Date, key: 'updatedAt', header: 'updatedAt' },
    { visible: true, key: 'updatedBy', header: 'updatedBy' },
    { visible: true, key: 'externalTransactionId', header: 'externalTransactionId' },
    { visible: true, key: 'triggerType', header: 'triggerType' }
  ]
});

  constructor() {
    super();
  }
  public updateTableData(data: TransactionOrder[]): void {
    this.originalDataSubject.next(data);
  }
  public setProductPriceTemplate(template: TemplateRef<any>): void {
    this.productPriceTemplate = template;
    this.tableConfigSubject.next({
    ...this.tableConfigSubject.value
  });
  }
}
