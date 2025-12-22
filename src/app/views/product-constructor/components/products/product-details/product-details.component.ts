import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

import { DetailSectionComponent } from '@shared/components/detail-section';
import { DetailRowComponent } from '@shared/components/detail-row';
import { StatusBadgeComponent } from '@shared/components/status-badge';
import { UsageUnitsGridComponent } from '@shared/components/usage-units-grid';
import { CoverageIconPipe } from '@shared/pipes';
import { formatValidityPeriod } from '@shared/utils';

import { Product } from '../../../models';

/**
 * Product details view component.
 * Displays product information in a structured card layout.
 */
@Component({
  standalone: true,
  selector: 'app-product-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    DetailSectionComponent,
    DetailRowComponent,
    StatusBadgeComponent,
    UsageUnitsGridComponent,
    CoverageIconPipe
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent {
  /** Product to display */
  readonly product = input<Product | null>(null);

  /** Formatted validity period */
  readonly formattedValidity = computed(() => {
    const product = this.product();
    return product?.validityPeriod ? formatValidityPeriod(product.validityPeriod) : '';
  });
}
