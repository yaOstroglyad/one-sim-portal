import { Component, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { CompanyProduct, CompanyProductPrice } from '../../../models';
import { CompanyProductPriceService } from '../../../services';
import { CompanyProductPricesTableComponent } from '../company-product-prices-table';

@Component({
    standalone: true,
    selector: 'app-company-product-details',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
      CommonModule,
      MatIconModule,
      CompanyProductPricesTableComponent
    ],
    templateUrl: './company-product-details.component.html',
    styleUrls: ['./company-product-details.component.scss']
})
export class CompanyProductDetailsComponent implements OnChanges, OnDestroy {
  @Input() companyProduct: CompanyProduct | null = null;

  // Signals for retail prices
  readonly prices = signal<CompanyProductPrice[]>([]);
  readonly pricesLoading = signal(false);

  private readonly destroy$ = new Subject<void>();
  private readonly companyProductPriceService = inject(CompanyProductPriceService);

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
      // Load retail prices when company product changes
      this.loadPrices(this.companyProduct.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPrices(companyProductId: string): void {
    this.pricesLoading.set(true);

    this.companyProductPriceService.getPrices(companyProductId)
      .pipe(takeUntil(this.destroy$))
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
    return active ? 'check_circle' : 'cancel';
  }

  getCoverageTypeIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'country': return 'location_on';
      case 'region': return 'map';
      default: return 'public';
    }
  }

  getUsageUnitIcon(type: string): string {
    switch (type) {
      case 'data': return 'cloud_download';
      case 'voice': return 'phone';
      case 'sms': return 'email';
      default: return 'circle';
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