import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { TimelineComponent, TimelineEvent } from '../../../shared';

@Component({
  selector: 'app-private-customer-details',
  templateUrl: './private-customer-details.component.html',
  styleUrls: ['./private-customer-details.component.scss'],
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatTabsModule, TimelineComponent],
  standalone: true
})
export class PrivateCustomerDetailsComponent {
  customer = {
    name: 'Aaron Brown',
    billingAddress: '22, Winchester avenue, Beach Haven, Auckland, 0626, New Zealand',
    shippingAddress: '22, Winchester avenue, Beach Haven, Auckland, 0626, New Zealand',
    additionalAddress: '48, Miller\'s drive, Christchurch, New Zealand',
    currencyCode: 'USD',
    portalStatus: 'Disabled',
    portalLanguage: 'English',
    unusedCredits: '$0.000',
    outstandingReceivables: '$880.000',
    paymentDuePeriod: 'Due on Receipt',
    contactPersons: [],
    activities: [
      { date: '2017-05-30T07:53:00', description: 'Invoice added: Expense of $123 billed.' },
      { date: '2017-05-12T01:35:00', description: 'Payment received: $11,760 applied to invoice.' }
    ]
  };

  timelineEvents: TimelineEvent[] = [
    {
      date: new Date('2017-05-30T07:53:00'),
      description: 'Invoice added: Expense of amount $123 billed as invoice INV-000230 by Patricia Boyle.',
      detailsLink: 'https://example.com/invoice-details'
    },
    {
      date: new Date('2017-05-12T01:35:00'),
      description: 'Payment received: $11,760 received and applied for INV-000186 by Patricia Boyle.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    },
    {
      date: new Date('2017-05-10T11:15:00'),
      description: 'Invoice updated: Invoice details were changed.'
    }
  ];
}
