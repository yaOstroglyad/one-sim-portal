import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Region } from '../../../models';

@Component({
  selector: 'app-region-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './region-details.component.html',
  styleUrls: ['./region-details.component.scss']
})
export class RegionDetailsComponent {
  @Input() region: Region | null = null;
}