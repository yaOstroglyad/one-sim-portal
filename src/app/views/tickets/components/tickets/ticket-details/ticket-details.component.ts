import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { BadgeComponent } from '@coreui/angular';

import { Ticket } from '../../../models';
import { CardComponent } from '@shared';

@Component({
    selector: 'app-ticket-details',
    standalone: true,
    imports: [
        TranslateModule,
        DatePipe,
        BadgeComponent,
        CardComponent
    ],
    templateUrl: './ticket-details.component.html',
    styleUrls: ['./ticket-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TicketDetailsComponent {
  ticket = input.required<Ticket>();

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'primary';
      case 'IN_PROGRESS': return 'info';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'dark';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'LOW': return 'secondary';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'dark';
      case 'URGENT': return 'danger';
      default: return 'secondary';
    }
  }

  getCategoryTranslationKey(category: string): string {
    const categoryMap: Record<string, string> = {
      'GENERAL_INQUIRY': 'tickets.categoryValues.generalInquiry',
      'TECHNICAL_ISSUE': 'tickets.categoryValues.technicalIssue',
      'BILLING_QUESTION': 'tickets.categoryValues.billingQuestion',
      'FEATURE_REQUEST': 'tickets.categoryValues.featureRequest',
      'BUG_REPORT': 'tickets.categoryValues.bugReport',
      'ACCOUNT_ISSUE': 'tickets.categoryValues.accountIssue',
      'INTEGRATION_SUPPORT': 'tickets.categoryValues.integrationSupport',
      'PERFORMANCE_ISSUE': 'tickets.categoryValues.performanceIssue',
      'SECURITY_CONCERN': 'tickets.categoryValues.securityConcern',
      'DATA_REQUEST': 'tickets.categoryValues.dataRequest',
      'COMPLIANCE_INQUIRY': 'tickets.categoryValues.complianceInquiry',
      'OTHER': 'tickets.categoryValues.other'
    };
    return categoryMap[category] || `tickets.categoryValues.${category.toLowerCase()}`;
  }
}
