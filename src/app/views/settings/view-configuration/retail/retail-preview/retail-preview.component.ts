import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retail-preview',
  templateUrl: './retail-preview.component.html',
  styleUrls: ['./retail-preview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RetailPreviewComponent {
  @Input() logoUrl: string = 'assets/img/brand/1esim-logo.png';
  @Input() buttonColor: string = '#f89c2e';
  @Input() headlineText: string = 'Welcome to Our Retail Portal';
}
