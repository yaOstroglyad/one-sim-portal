import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  inject
} from '@angular/core';
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import {
  EmptyStateComponent,
  GenericTableComponent,
  Subscriber,
  SubscriberDataService,
  SubscriberStatusEvent
} from '@shared';

import { EventStatusTableService } from '@shared/services/data/event-status-table.service';

@Component({
  standalone: true,
  selector: 'app-event-status',
  templateUrl: './event-status.component.html',
  styleUrls: ['./event-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GenericTableComponent,
    DatePipe,
    NgClass,
    AsyncPipe,
    EmptyStateComponent,
    TranslateModule
  ]
})

export class EventStatusComponent implements OnInit, AfterViewInit {
  private readonly subscriberDataService = inject(SubscriberDataService);
  readonly eventStatusTableService = inject(EventStatusTableService);

  @Input() subscriber!: Subscriber;

  @ViewChild('eventTimestampTpl') eventTimestampTpl!: TemplateRef<any>;
  @ViewChild('statusTpl') statusTpl!: TemplateRef<any>;

  subscriberEventsView$!: Observable<SubscriberStatusEvent[]>;

  getStatusClass(status: string): string {
    switch ((status ?? '').toLowerCase()) {
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
    this.subscriberEventsView$ = this.subscriberDataService
      .getSimStatusEvents(this.subscriber.simId)
      .pipe(tap((data) => this.eventStatusTableService.updateTableData(data)));
  }

  ngAfterViewInit(): void {
    this.eventStatusTableService.setTemplates({
      eventTimestamp: this.eventTimestampTpl,
      status: this.statusTpl
    });
  }
}
