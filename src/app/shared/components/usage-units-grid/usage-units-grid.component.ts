import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { formatUsageUnit, UsageUnitFormatInput } from '@shared/utils';

/**
 * Usage unit interface matching the product-constructor model
 */
export interface UsageUnitInput {
  value: number;
  type: string;
  unitType?: string;
}

/**
 * Processed usage unit for display
 */
interface ProcessedUsageUnit {
  type: string;
  typeDisplay: string;
  icon: string;
  formattedValue: string;
}

/**
 * Grid display of usage units (data, voice, SMS).
 * Shows each unit as a card with icon, type, and value.
 *
 * @example
 * ```html
 * <app-usage-units-grid [units]="product.usageUnits"></app-usage-units-grid>
 * ```
 */
@Component({
  standalone: true,
  selector: 'app-usage-units-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  templateUrl: './usage-units-grid.component.html',
  styleUrls: ['./usage-units-grid.component.scss']
})
export class UsageUnitsGridComponent {
  /** Usage units array */
  readonly units = input<UsageUnitInput[]>([]);

  /** Empty state message */
  readonly emptyMessage = input<string>('No usage units available');

  /** Processed units for display */
  readonly processedUnits = computed<ProcessedUsageUnit[]>(() => {
    const units = this.units();
    if (!units || units.length === 0) {
      return [];
    }

    return units.map(unit => ({
      type: unit.type || '',
      typeDisplay: this.capitalizeFirst(unit.type),
      icon: this.getIcon(unit.type),
      formattedValue: formatUsageUnit(unit as UsageUnitFormatInput)
    }));
  });

  private capitalizeFirst(str: string | null | undefined): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getIcon(type: string | null | undefined): string {
    if (!type) return 'circle';
    const iconMap: Record<string, string> = {
      data: 'cloud_download',
      voice: 'phone',
      sms: 'email'
    };
    return iconMap[type.toLowerCase()] ?? 'circle';
  }
}
