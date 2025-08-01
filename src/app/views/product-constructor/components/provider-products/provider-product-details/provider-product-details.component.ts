import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ProviderProduct } from '../../../models';

@Component({
  selector: 'app-provider-product-details',
  standalone: true,
  imports: [CommonModule, IconDirective],
  templateUrl: './provider-product-details.component.html',
  styleUrls: ['./provider-product-details.component.scss']
})
export class ProviderProductDetailsComponent {
  @Input() providerProduct: ProviderProduct | null = null;

  // Expose Object to template
  Object = Object;

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

  getProviderDataKeys(data: any): string[] {
    if (!data || data.empty) return [];
    return Object.keys(data).filter(key => key !== 'empty');
  }

  formatDataValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}