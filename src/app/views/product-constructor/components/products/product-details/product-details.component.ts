import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeComponent } from '@coreui/angular';

import { Product } from '../../../models';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BadgeComponent
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  @Input() product: Product | null = null;

  ngOnInit(): void {
    // Component initialization logic here
  }

  formatValidity(): string {
    if (this.product?.validityPeriod) {
      return `${this.product.validityPeriod.period} ${this.product.validityPeriod.timeUnit}`;
    }
    return 'N/A';
  }

  formatUsageUnits(): string {
    if (this.product?.bundle?.usageUnits) {
      return this.product.bundle.usageUnits
        .map(unit => `${unit.value} ${unit.unitType} ${unit.type}`)
        .join(', ');
    }
    return 'N/A';
  }

  getStatusColor(): string {
    return this.product?.active ? 'success' : 'danger';
  }

  getStatusText(): string {
    return this.product?.active ? 'Active' : 'Inactive';
  }
}