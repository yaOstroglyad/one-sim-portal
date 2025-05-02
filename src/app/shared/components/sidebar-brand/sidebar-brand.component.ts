import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandFull } from '../../model/brandFull';
import { BrandNarrow } from '../../model/brandNarrow';

@Component({
  selector: 'app-sidebar-brand',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-brand.component.html',
  styleUrls: ['./sidebar-brand.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
//TODO доделать сайдбренд, чтоб он отображал brandNarrow на сжатие сайдбара
export class SidebarBrandComponent {
  @Input() brandFull: BrandFull;
  @Input() brandNarrow: BrandNarrow;
}
