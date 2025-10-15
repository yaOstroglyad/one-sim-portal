import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { MobileBundle } from '../../../models';

@Component({
  standalone: true,
    selector: 'app-bundle-details',
    imports: [CommonModule, IconDirective],
    templateUrl: './bundle-details.component.html',
    styleUrls: ['./bundle-details.component.scss']
})
export class BundleDetailsComponent {
  @Input() bundle: MobileBundle | null = null;

  getUsageUnitColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'data': return 'primary';
      case 'voice': return 'success';
      case 'sms': return 'info';
      default: return 'medium';
    }
  }

  getUsageUnitIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'data': return 'cilDataTransferDown';
      case 'voice': return 'cilPhone';
      case 'sms': return 'cilEnvelopeClosed';
      default: return 'cilApplicationsSettings';
    }
  }

  formatUsageUnit(unit: any): string {
    return `${unit.value} ${unit.unitType}`;
  }
}
