import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retail-preview',
  templateUrl: './retail-preview.component.html',
  styleUrls: ['./retail-preview.component.scss'],
  standalone: true,
  imports: [CommonModule],
  host: {
    '[attr.dir]': 'dir'
  }
})
export class RetailPreviewComponent implements OnInit {
  @Input() logoUrl: string = 'assets/img/brand/1esim-logo.png';
  @Input() buttonColor: string = '#f89c2e';
  @Input() headlineText: string = 'Welcome to Our Retail Portal';
  @Input() dir: 'ltr' | 'rtl' = 'ltr';

  readonly SVG_WIDTH = 1200;
  readonly PADDING = 100;

  ngOnInit() {
    if (!this.dir) {
      this.dir = document.documentElement.getAttribute('dir') as 'ltr' | 'rtl' || 'ltr';
    }
  }

  get textAnchor(): string {
    return this.dir === 'rtl' ? 'end' : 'start';
  }

  get logoX(): number {
    return this.dir === 'rtl' ? this.SVG_WIDTH - this.PADDING - 120 : this.PADDING;
  }

  get textX(): number {
    return this.dir === 'rtl' ? this.SVG_WIDTH - this.PADDING : this.PADDING;
  }

  get searchX(): number {
    return this.dir === 'rtl' ? this.SVG_WIDTH - this.PADDING - 300 : this.PADDING;
  }

  get searchIconX(): number {
    return this.dir === 'rtl' ? this.SVG_WIDTH - this.PADDING - 25 : this.PADDING + 25;
  }

  get cardWidth(): number {
    return 260;
  }

  get cardGap(): number {
    return 20;
  }

  get cardTransforms(): string[] {
    const startX = this.dir === 'rtl'
      ? this.SVG_WIDTH - this.PADDING - this.cardWidth
      : this.PADDING;

    const step = this.cardWidth + this.cardGap;
    const y = 340;

    if (this.dir === 'rtl') {
      return [
        `translate(${startX}, ${y})`,
        `translate(${startX - step}, ${y})`,
        `translate(${startX - step * 2}, ${y})`
      ];
    }

    return [
      `translate(${startX}, ${y})`,
      `translate(${startX + step}, ${y})`,
      `translate(${startX + step * 2}, ${y})`
    ];
  }

  get cardContentX(): number {
    return this.dir === 'rtl' ? this.cardWidth - 140 : 20;
  }
}
