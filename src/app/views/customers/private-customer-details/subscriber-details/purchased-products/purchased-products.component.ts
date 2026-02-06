import {
  Component,
  inject,
  Input,
  OnInit,
  AfterViewInit,
  TemplateRef,
  ViewChild,
  DestroyRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  ProductPurchase,
  Subscriber,
  PurchasedProductsDataService,
  convertUsage, // ✅ CHANGED: нужен для mapProducts
} from "@shared";
import { PurchasedProductsTableService } from "@shared/services/data/purchased-products-table.service";
import { GenericTableComponent } from "@shared";
import { NgClass } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { map } from "rxjs/operators";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  standalone: true,
  selector: "app-purchased-products",
  templateUrl: "./purchased-products.component.html",
  imports: [GenericTableComponent, NgClass, TranslateModule],
  styleUrls: ["./purchased-products.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchasedProductsComponent implements OnInit, AfterViewInit {
  purchasedProductsDataService = inject(PurchasedProductsDataService);
  tableService = inject(PurchasedProductsTableService);
  private readonly destroyRef = inject(DestroyRef);

  config$ = this.tableService.getTableConfig();
  data$ = this.tableService.dataList$;

  @Input() subscriber!: Subscriber;

  @ViewChild("statusTpl", { static: true }) statusTpl!: TemplateRef<any>;
  @ViewChild("priceTpl", { static: true }) priceTpl!: TemplateRef<any>;
  @ViewChild("totalBalanceTpl", { static: true })
  totalBalanceTpl!: TemplateRef<any>;
  @ViewChild("remainingBalanceTpl", { static: true })
  remainingBalanceTpl!: TemplateRef<any>;

  ngOnInit(): void {
    this.purchasedProductsDataService
      .getPurchasedProducts({ subscriberId: this.subscriber.id })
      .pipe(
        map((activeProducts: ProductPurchase[]) =>
          this.mapProducts(activeProducts),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.tableService.updateTableData(data));
  }

  private mapProducts(products: ProductPurchase[]): ProductPurchase[] {
    return products.map((product) => ({
      ...product,
      usage: {
        ...product.usage,
        balance: (product.usage?.balance ?? []).map(convertUsage),
      },
      usageStartedAt: product.usage?.startedAt,
      usageExpiredAt: product.usage?.expiredAt,
    }));
  }

  ngAfterViewInit(): void {
    this.tableService.setTemplates({
      status: this.statusTpl,
      price: this.priceTpl,
      totalBalance: this.totalBalanceTpl,
      remainingBalance: this.remainingBalanceTpl,
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
        return "status-active";
      case "expired":
        return "status-expired";
      default:
        return "";
    }
  }

  public getUnitType(usage: any): string {
    return usage.balance[0].unitType === "Gigabyte"
      ? "GB"
      : usage.balance[0].unitType;
  }
}
