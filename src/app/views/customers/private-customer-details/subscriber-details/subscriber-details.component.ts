import { Component, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  Subscriber,
  SimInfo,
  SubscriberDataService,
  SimLocations
} from '@shared';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { EventStatusComponent } from './event-status/event-status.component';
import { TransactionOrdersTableComponent } from '../transaction-orders-table/transaction-orders-table.component';
import { PurchasedProductsComponent } from './purchased-products/purchased-products.component';
import { Observable, combineLatest, of } from 'rxjs';
import { BundlesComponent } from './bundles/bundles.component';
import { map, catchError } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
    selector: 'app-subscriber-details',
    templateUrl: './subscriber-details.component.html',
    styleUrls: ['./subscriber-details.component.scss'],
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatTableModule,
        EventStatusComponent,
        TransactionOrdersTableComponent,
        PurchasedProductsComponent,
        BundlesComponent,
        TranslateModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriberDetailsComponent implements OnInit {
  subscriberDataService = inject(SubscriberDataService);

  @Input() subscriber: Subscriber;

  simView$: Observable<{ simDetails: SimInfo; locations: SimLocations[] }>;

  ngOnInit(): void {
    this.simView$ = combineLatest([
      this.subscriberDataService.getSimDetails({ id: this.subscriber.simId }),
      this.subscriberDataService.getSimLocations(this.subscriber.simId)
    ]).pipe(
      map(([simDetails, locations]) => ({ simDetails, locations })),
      catchError(() => {
        console.warn('Error happened while fetching data, presenting mocked data');
        return of({ simDetails: {} as SimInfo, locations: [] });
      })
    );
  }
}
