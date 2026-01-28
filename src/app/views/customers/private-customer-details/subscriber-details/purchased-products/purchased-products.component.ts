import { Component, inject, Input, OnInit, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import {
  ProductPurchase,
  Subscriber,
  PurchasedProductsDataService,
  EmptyStateComponent,
  convertUsage
} from '@shared';
import { PurchasedProductsTableService } from '@shared/services/data/purchased-products-table.service';
import { GenericTableComponent } from '@shared';
import { AsyncPipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-purchased-products',
  templateUrl: './purchased-products.component.html',
  imports: [
    GenericTableComponent,
    NgClass,
    AsyncPipe,
    EmptyStateComponent,
    TranslateModule
  ],
  styleUrls: ['./purchased-products.component.scss']
})

export class PurchasedProductsComponent implements OnInit, AfterViewInit {
  purchasedProductsView$: Observable<ProductPurchase[]>;
  purchasedProductsDataService = inject(PurchasedProductsDataService);
  tableService = inject(PurchasedProductsTableService);

  config$ = this.tableService.getTableConfig();
  data$ = this.tableService.dataList$;

  @Input() subscriber!: Subscriber;

  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild('priceTpl', { static: true }) priceTpl!: TemplateRef<any>;
  @ViewChild('totalBalanceTpl', { static: true }) totalBalanceTpl!: TemplateRef<any>;
  @ViewChild('remainingBalanceTpl', { static: true }) remainingBalanceTpl!: TemplateRef<any>;


  ngOnInit(): void {
    this.purchasedProductsView$ = this.purchasedProductsDataService
      .getPurchasedProducts({ subscriberId: this.subscriber.id })
      .pipe(
     map((activeProducts: ProductPurchase[]) =>
  activeProducts.map(product => ({
    ...product,
    usage: {
      ...product.usage,
      balance: product.usage.balance.map(balance => convertUsage(balance))
    },
    usageStartedAt: product.usage?.startedAt,
    usageExpiredAt: product.usage?.expiredAt
  }))
)
      );

    this.purchasedProductsView$.subscribe(data => this.tableService.updateTableData(data));
  }

  ngAfterViewInit(): void {	
    this.tableService.setTemplates({
      status: this.statusTpl,
      price: this.priceTpl,
      totalBalance: this.totalBalanceTpl,
      remainingBalance: this.remainingBalanceTpl
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'expired':
        return 'status-expired';
      default:
        return '';
    }
  }

  public getUnitType(usage: any): string {
    return usage.balance[0].unitType === 'Gigabyte' ? 'GB' : usage.balance[0].unitType;
  }
}
