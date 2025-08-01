import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeComponent } from '@coreui/angular';

import { TariffOffer } from '../../../models/tariff-offer.model';

@Component({
  selector: 'app-tariff-offer-details',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    BadgeComponent
  ],
  templateUrl: './tariff-offer-details.component.html',
  styleUrls: ['./tariff-offer-details.component.scss']
})
export class TariffOfferDetailsComponent {
  @Input() tariffOffer!: TariffOffer;

  formatUsageUnit(unit: any): string {
    if (typeof unit === 'string') {
      return unit;
    }
    
    if (unit.amount && unit.type) {
      return `${unit.amount} ${unit.type}`;
    }
    
    return unit.name || unit.toString();
  }
}