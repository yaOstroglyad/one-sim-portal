import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface TimelineEvent {
  date: Date;
  description: string;
  detailsLink?: string;
}

@Component({
    standalone: true,
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    imports: [
    DatePipe
]
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
}
