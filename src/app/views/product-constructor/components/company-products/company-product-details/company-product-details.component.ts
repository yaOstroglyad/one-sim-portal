import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { CompanyProduct } from '../../../models';

@Component({
  selector: 'app-company-product-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconDirective],
  templateUrl: './company-product-details.component.html',
  styleUrls: ['./company-product-details.component.scss']
})
export class CompanyProductDetailsComponent implements OnChanges {
  @Input() companyProduct: CompanyProduct | null = null;

  // Pre-computed values for template
  statusColor: string = '';
  statusIcon: string = '';
  statusText: string = '';
  coverageTypeIcon: string = '';
  formattedPrice: string = '';
  formattedValidityPeriod: string = '';
  processedUsageUnits: Array<{
    type: string;
    icon: string;
    formattedValue: string;
    typeDisplay: string;
  }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyProduct'] && this.companyProduct) {
      this.precomputeValues();
    }
  }

  private precomputeValues(): void {
    if (!this.companyProduct) {
      this.resetValues();
      return;
    }

    // Status-related values
    this.statusColor = this.getStatusColor(this.companyProduct.active);
    this.statusIcon = this.getStatusIcon(this.companyProduct.active);
    this.statusText = this.companyProduct.active ? 'Active' : 'Inactive';

    // Coverage icon
    this.coverageTypeIcon = this.companyProduct.serviceCoverage ? 
      this.getCoverageTypeIcon(this.companyProduct.serviceCoverage.type) : '';

    // Formatted values
    this.formattedPrice = this.formatPrice();
    this.formattedValidityPeriod = this.formatValidityPeriod();

    // Process usage units
    this.processedUsageUnits = this.companyProduct.usageUnits?.map(unit => ({
      type: unit?.type || '',
      icon: this.getUsageUnitIcon(unit?.type),
      formattedValue: this.formatUsageUnit(unit),
      typeDisplay: unit?.type ? (unit.type.charAt(0).toUpperCase() + unit.type.slice(1)) : ''
    })) || [];
  }

  private resetValues(): void {
    this.statusColor = '';
    this.statusIcon = '';
    this.statusText = '';
    this.coverageTypeIcon = '';
    this.formattedPrice = '';
    this.formattedValidityPeriod = '';
    this.processedUsageUnits = [];
  }

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
    if (!unit) return '';
    
    if (unit.value === -1) {
      return `Unlimited ${unit.type || ''}`;
    }
    return `${unit.value || 0} ${unit.unitType || ''}`;
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