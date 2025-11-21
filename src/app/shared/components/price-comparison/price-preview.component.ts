import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { PricePreviewViewModel } from '@shared/utils';

/**
 * Shared component for displaying price change preview
 * Shows old price → new price with percentage change
 * Used in ModifyTariffOfferDialog, ModifyPriceDialog, and SelectedTariffOfferDetails
 */
@Component({
  standalone: true,
  selector: 'app-price-preview',
  templateUrl: './price-preview.component.html',
  styleUrls: ['./price-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule]
})
export class PricePreviewComponent {
  /**
   * Price preview data to display
   */
  readonly preview = input.required<PricePreviewViewModel>();
}
