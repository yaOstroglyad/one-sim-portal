import { Component } from '@angular/core';
import { HeaderModule } from '../../../../shared';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portal',
  template: `
    <app-header class="os-header-sticky">
      <h2>{{ 'portal.title' | translate }}</h2>
    </app-header>
    <div class="p-3">
      <!-- Здесь будет контент -->
    </div>
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