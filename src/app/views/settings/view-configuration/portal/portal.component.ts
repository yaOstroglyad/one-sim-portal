import { Component } from '@angular/core';
import { HeaderModule } from '../../../../shared';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portal',
  template: `
    test
  `,
  standalone: true,
  imports: [
    CommonModule,
    HeaderModule,
    TranslateModule
  ]
})
export class PortalComponent {
  // Логика будет добавлена позже
} 