import { Component, Input } from '@angular/core';

import { Region } from '../../../models';

@Component({
    standalone: true,
    selector: 'app-region-details',
    imports: [],
    templateUrl: './region-details.component.html',
    styleUrls: ['./region-details.component.scss']
})
export class RegionDetailsComponent {
  @Input() region: Region | null = null;
}