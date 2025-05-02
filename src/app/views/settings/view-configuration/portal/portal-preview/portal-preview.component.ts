import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-portal-preview',
	templateUrl: './portal-preview.component.html',
	styleUrls: ['./portal-preview.component.scss'],
  standalone: true,
  imports: [CommonModule, MatFormFieldModule]
})
export class PortalPreviewComponent implements OnChanges {
  @Input() primaryColor: string = '#f89c2e';
  @Input() secondaryColor: string = '#fef6f0';
  @Input() logoUrl: string = 'assets/img/brand/1esim-logo.png';

  effectiveLogoUrl: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.logoUrl) {
      this.updateLogoUrl();
    }

    if (!this.effectiveLogoUrl) {
      this.updateLogoUrl();
    }
  }

  private updateLogoUrl(): void {
    if (!this.logoUrl) {
      this.effectiveLogoUrl = 'assets/img/brand/1esim-logo.png';
      return;
    }

    // Используем URL как есть
    this.effectiveLogoUrl = this.logoUrl;
  }
}
