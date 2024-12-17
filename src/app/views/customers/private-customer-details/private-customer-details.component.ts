import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomersDataService, TimelineComponent, TimelineEvent, DataObject } from '../../../shared';
import { Observable, Subscriber } from 'rxjs';
import { SubscriberDetailsComponent } from './subscriber-details/subscriber-details.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-private-customer-details',
  templateUrl: './private-customer-details.component.html',
  styleUrls: ['./private-customer-details.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatTabsModule,
    TimelineComponent,
    SubscriberDetailsComponent
  ],
  standalone: true
})
export class PrivateCustomerDetailsComponent implements OnInit {
  customerDetailsView$: Observable<DataObject>;
  route = inject(ActivatedRoute);
  customerDataService = inject(CustomersDataService);
  ngOnInit(): void {
    const customerId = this.route.snapshot.paramMap.get('id');
    this.customerDetailsView$ = this.customerDataService.getCustomerDetails(customerId);
  }
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

  trackBySubscriber(index: number, subscriber: any): string {
    return subscriber.id;
  }
}
