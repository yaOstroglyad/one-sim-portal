import { Component, inject, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  Subscriber,
  SimInfo,
  SubscriberDataService,
  SimLocations,
  ContextualTextComponent,
  ContextMenuItem
} from '@shared';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventStatusComponent } from './event-status/event-status.component';
import { TransactionOrdersTableComponent } from '../transaction-orders-table/transaction-orders-table.component';
import { PurchasedProductsComponent } from './purchased-products/purchased-products.component';
import { Observable, combineLatest, of } from 'rxjs';
import { BundlesComponent } from './bundles/bundles.component';
import { map, catchError } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { GlobalFlyoutService } from '@shared/components/fab-layout';

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
        TranslateModule,
        ContextualTextComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriberDetailsComponent implements OnInit {
  private readonly subscriberDataService = inject(SubscriberDataService);
  private readonly flyoutService = inject(GlobalFlyoutService);
  private readonly snackBar = inject(MatSnackBar);

  @Input() subscriber: Subscriber;

  simView$: Observable<{ simDetails: SimInfo; locations: SimLocations[] }>;

  // Context menu actions for ICCID
  iccidContextActions: ContextMenuItem[] = [];

  ngOnInit(): void {
    this.simView$ = combineLatest([
      this.subscriberDataService.getSimDetails({ id: this.subscriber.simId }),
      this.subscriberDataService.getSimLocations(this.subscriber.simId)
    ]).pipe(
      map(([simDetails, locations]) => {
        // Initialize ICCID actions with the actual ICCID value
        this.initializeIccidActions(simDetails.iccid);
        return { simDetails, locations };
      }),
      catchError(() => {
        console.warn('Error happened while fetching data, presenting mocked data');
        return of({ simDetails: {} as SimInfo, locations: [] });
      })
    );
  }

  /**
   * Initialize ICCID context menu actions
   */
  private initializeIccidActions(iccid: string): void {
    this.iccidContextActions = [
      {
        id: 'copy-iccid',
        label: 'Copy ICCID',
        icon: 'content_copy',
        action: () => this.copyToClipboard(iccid)
      },
      {
        id: 'open-support-chat',
        label: 'Open Support Chat',
        icon: 'chat',
        action: () => this.openSupportChat(iccid),
        divider: false
      }
    ];
  }

  /**
   * Copy text to clipboard
   */
  private copyToClipboard(text: string): void {
    if (!text) return;

    navigator.clipboard.writeText(text).then(
      () => {
        this.snackBar.open('ICCID copied to clipboard', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      (err) => {
        console.error('Failed to copy ICCID:', err);
        this.snackBar.open('Failed to copy ICCID', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    );
  }

  /**
   * Open Support Chat flyout with ICCID search
   */
  private openSupportChat(iccid: string): void {
    if (!iccid) return;

    this.flyoutService.open({
      featureKey: 'support-chat',
      title: 'flyout.supportchattitle',
      params: { iccid },
      destroyOnClose: true
    });
  }
}
