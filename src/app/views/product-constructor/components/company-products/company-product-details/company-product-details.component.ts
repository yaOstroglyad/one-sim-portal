import { Component, ChangeDetectionStrategy, inject, input, computed, DestroyRef, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { DetailSectionComponent } from '@shared/components/detail-section';
import { DetailRowComponent } from '@shared/components/detail-row';
import { StatusBadgeComponent } from '@shared/components/status-badge';
import { UsageUnitsGridComponent } from '@shared/components/usage-units-grid';
import { CoverageIconPipe } from '@shared/pipes';
import { formatCurrency, formatValidityPeriod } from '@shared/utils';

import { CompanyProduct, CompanyProductPrice } from '../../../models';
import { CompanyProductPriceService } from '../../../services';
import { CompanyProductPricesTableComponent } from '../company-product-prices-table';

/**
 * Company product details view component.
 * Displays company product information with pricing schedule.
 */
@Component({
  standalone: true,
  selector: 'app-company-product-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    DetailSectionComponent,
    DetailRowComponent,
    StatusBadgeComponent,
    UsageUnitsGridComponent,
    CoverageIconPipe,
    CompanyProductPricesTableComponent
  ],
  templateUrl: './company-product-details.component.html',
  styleUrls: ['./company-product-details.component.scss']
})
export class CompanyProductDetailsComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly companyProductPriceService = inject(CompanyProductPriceService);

  /** Company product to display */
  readonly companyProduct = input<CompanyProduct | null>(null);

  /** Prices signal */
  readonly prices = signal<CompanyProductPrice[]>([]);

  /** Loading state for prices */
  readonly pricesLoading = signal(false);

  /** Formatted price */
  readonly formattedPrice = computed(() => {
    const product = this.companyProduct();
    if (!product) return '';
    return formatCurrency(product.price, product.currency);
  });

  /** Formatted validity period */
  readonly formattedValidity = computed(() => {
    const product = this.companyProduct();
    return product?.validityPeriod ? formatValidityPeriod(product.validityPeriod) : '';
  });

  constructor() {
    // Effect to load prices when companyProduct changes
    effect(() => {
      const product = this.companyProduct();
      if (product) {
        this.loadPrices(product.id);
      }
    });
  }

  private loadPrices(companyProductId: string): void {
    this.pricesLoading.set(true);

    this.companyProductPriceService.getPrices(companyProductId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (prices) => {
          this.prices.set(prices);
          this.pricesLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading prices:', error);
          this.pricesLoading.set(false);
        }
      });
  }
}
