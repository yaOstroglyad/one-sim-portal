import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-skeleton.component.html',
  styleUrls: ['./sidebar-skeleton.component.scss']
})
export class SidebarSkeletonComponent {
  @Input() itemsCount: number = 8;

  get items(): number[] {
    return Array(this.itemsCount).fill(0).map((_, i) => i);
  }
}
