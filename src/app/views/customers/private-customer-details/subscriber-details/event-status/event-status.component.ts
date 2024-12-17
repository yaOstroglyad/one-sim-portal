import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Subscriber, SubscriberDataService, SubscriberStatusEvent } from '../../../../../shared';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

export const MOCK_STATUS_EVENTS: SubscriberStatusEvent[] = [
  {
    eventTimestamp: '2024-12-14T10:00:00Z',
    notificationPoint: 'Email',
    tac: 'tac',
    status: 'Delivered'
  },
  {
    eventTimestamp: '2024-12-14T11:00:00Z',
    notificationPoint: 'SMS',
    tac: 'tac',
    status: 'Failed'
  },
  {
    eventTimestamp: '2024-12-14T12:00:00Z',
    notificationPoint: 'Push Notification',
    tac: 'tac',
    status: 'Pending'
  }
];

@Component({
  selector: 'app-event-status',
  templateUrl: './event-status.component.html',
  styleUrls: ['./event-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatTableModule,
    DatePipe,
    NgClass,
    AsyncPipe,
    NgIf
  ]
})
export class EventStatusComponent implements OnInit {
  subscriberDataService = inject(SubscriberDataService);
  @Input() subscriber: Subscriber;

  displayedColumns: string[] = [
    'eventTimestamp',
    'notificationPoint',
    'status'
  ];
  subscriberEventsView$: Observable<SubscriberStatusEvent[]>;

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }


  ngOnInit(): void {
    console.log('this.subscriber', this.subscriber);
    this.subscriberEventsView$ = this.subscriberDataService.getSimStatusEvents(this.subscriber.simId);
  }
}
