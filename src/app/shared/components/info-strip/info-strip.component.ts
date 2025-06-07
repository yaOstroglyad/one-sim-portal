import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type InfoStripType = 'primary' | 'warning' | 'alert';

@Component({
  selector: 'app-info-strip',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './info-strip.component.html',
  styleUrls: ['./info-strip.component.scss']
})
export class InfoStripComponent {
  @Input() icon: string = 'info';
  @Input() text: string = '';
  @Input() type: InfoStripType = 'primary';
} 