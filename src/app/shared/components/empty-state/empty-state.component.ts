import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  standalone: true,
  imports: [
    NgIf,
    CommonModule
  ],
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() message: string;
  @Input() imageSrc?: string;
  @Input() hasAction: boolean = false;
}
