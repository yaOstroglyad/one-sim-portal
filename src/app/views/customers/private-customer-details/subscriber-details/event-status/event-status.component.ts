import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';
import { Subscriber, SubscriberDataService, SubscriberStatusEvent, EmptyStateComponent } from '../../../../../shared';
import { MatTableModule } from '@angular/material/table';
import { Observable } from 'rxjs';

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
		NgIf,
		EmptyStateComponent
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
		this.subscriberEventsView$ = this.subscriberDataService.getSimStatusEvents(this.subscriber.simId);
	}
}
