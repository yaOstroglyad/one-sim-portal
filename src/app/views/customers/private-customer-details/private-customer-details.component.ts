import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-private-customer-details',
  templateUrl: './private-customer-details.component.html',
  styleUrls: ['./private-customer-details.component.scss'],
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, MatListModule, MatTabsModule],
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
}
