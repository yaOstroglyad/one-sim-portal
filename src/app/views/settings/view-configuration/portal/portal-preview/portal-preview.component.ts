import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portal-preview',
  templateUrl: './portal-preview.component.html',
  styleUrls: ['./portal-preview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class PortalPreviewComponent {
  @Input() primaryColor: string = '#f89c2e';   // оранжевый по умолчанию
  @Input() secondaryColor: string = '#fef6f0'; // светло-оранжевый по умолчанию
  @Input() logoUrl: string = 'assets/img/brand/1esim-logo.png'; // дефолтный логотип
  
  menuItems = ['Customers', 'Orders', 'Products', 'Inventory', 'Settings'];
} 