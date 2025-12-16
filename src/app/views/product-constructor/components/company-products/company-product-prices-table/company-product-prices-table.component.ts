import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ButtonModule } from '@coreui/angular';
import { IconComponent, TooltipDirective, BadgeComponent } from '@shared';

import { CompanyProductPrice } from '../../../models';
import { PriceValidationUtils } from './utils/price-validation.utils';

/**
 * Display model for price table rows
 */
interface PriceTableRow extends CompanyProductPrice {
  isEditable: boolean;
  isCurrentPrice: boolean;
  formattedPrice: string;
  formattedDate: string;
  editTooltip: string;
}

/**
 * Dumb component for displaying company product prices table
 * Uses signals for all reactive state
 */
@Component({
  standalone: true,
  selector: 'app-company-product-prices-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ButtonModule,
    IconComponent,
    TooltipDirective,
    BadgeComponent
  ],
  templateUrl: './company-product-prices-table.component.html',
  styleUrls: ['./company-product-prices-table.component.scss']
})
export class CompanyProductPricesTableComponent {
  // Inputs as signals
  readonly prices = input.required<CompanyProductPrice[]>();
  readonly loading = input<boolean>(false);
  readonly editable = input<boolean>(true); // false for details view
  readonly showHeader = input<boolean>(true); // false to hide header section

  // Outputs
  readonly editPrice = output<CompanyProductPrice>();
  readonly addPrice = output<void>();

  // Computed signals
  readonly hasPrices = computed(() => this.prices().length > 0);

  readonly displayedPrices = computed<PriceTableRow[]>(() => {
    const allPrices = this.prices();
    return allPrices.map(price => ({
      ...price,
      isEditable: this.canEditPrice(price),
      isCurrentPrice: PriceValidationUtils.isCurrentPrice(price, allPrices),
      formattedPrice: this.formatPrice(price),
      formattedDate: PriceValidationUtils.formatDate(price.validFrom),
      editTooltip: this.getEditTooltip(price)
    }));
  });

  // Displayed columns
  readonly displayedColumns = computed(() => {
    const baseColumns = ['validFrom', 'price', 'currency'];
    return this.editable()
      ? [...baseColumns, 'actions']
      : baseColumns;
  });

  /**
   * Handle edit button click
   */
  onEdit(price: CompanyProductPrice): void {
    if (this.canEditPrice(price)) {
      this.editPrice.emit(price);
    }
  }

  /**
   * Handle add button click
   */
  onAdd(): void {
    this.addPrice.emit();
  }

  /**
   * Check if price can be edited (only future prices)
   */
  private canEditPrice(price: CompanyProductPrice): boolean {
    return PriceValidationUtils.isFuturePrice(price.validFrom);
  }

  /**
   * Format price with currency
   */
  private formatPrice(price: CompanyProductPrice): string {
    return `${price.price} ${price.currency.toUpperCase()}`;
  }

  /**
   * Get tooltip text for edit button
   */
  private getEditTooltip(price: CompanyProductPrice): string {
    return this.canEditPrice(price)
      ? 'Edit price'
      : 'Cannot edit past or current prices. Only future prices can be modified.';
  }
}
