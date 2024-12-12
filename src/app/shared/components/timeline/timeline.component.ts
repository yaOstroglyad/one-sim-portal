import { Component, Input } from '@angular/core';
import { DatePipe, NgForOf, NgIf } from '@angular/common';

export interface TimelineEvent {
  date: Date;
  description: string;
  detailsLink?: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    DatePipe
  ],
  standalone: true
})
export class TimelineComponent {
  @Input() events: TimelineEvent[] = [];
}
