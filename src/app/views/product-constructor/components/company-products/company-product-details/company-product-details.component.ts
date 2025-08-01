import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { CompanyProduct } from '../../../models';

@Component({
  selector: 'app-company-product-details',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './company-product-details.component.html',
  styleUrls: ['./company-product-details.component.scss']
})
export class CompanyProductDetailsComponent {
  @Input() companyProduct: CompanyProduct | null = null;

  getStatusColor(active: boolean): string {
    return active ? 'success' : 'danger';
  }

  getStatusIcon(active: boolean): string {
    return active ? 'cilCheckCircle' : 'cilX';
  }

  getCoverageTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'country': return 'cilLocationPin';
      case 'region': return 'cilMap';
      default: return 'cilGlobe';
    }
  }

  getUsageUnitIcon(type: string): string {
    switch (type) {
      case 'data': return 'cilDataTransferDown';
      case 'voice': return 'cilPhone';
      case 'sms': return 'cilEnvelopeClosed';
      default: return 'cilCircle';
    }
  }

  formatUsageUnit(unit: any): string {
    if (unit.value === -1) {
      return `Unlimited ${unit.type}`;
    }
    return `${unit.value} ${unit.unitType}`;
  }

  formatPrice(): string {
    if (!this.companyProduct) return '';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.companyProduct.currency
    });
    return formatter.format(this.companyProduct.price);
  }

  formatValidityPeriod(): string {
    if (!this.companyProduct?.validityPeriod) return '';
    
    const { period, timeUnit } = this.companyProduct.validityPeriod;
    return `${period} ${timeUnit}`;
  }
}