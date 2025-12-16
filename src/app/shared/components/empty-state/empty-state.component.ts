import { Component, Input } from '@angular/core';
@Component({
    standalone: true,
    selector: 'app-empty-state',
    templateUrl: './empty-state.component.html',
    imports: [],
    styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() message: string;
  @Input() imageSrc?: string;
  @Input() hasAction: boolean = false;
}
