import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from 'src/app/shared';

@Component({
  selector: 'app-view-configuration',
  template: `
    <app-header class="os-header-sticky">
      <h2>{{ 'viewConfiguration.title' | translate }}</h2>
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
export class ViewConfigurationComponent {
  // Логика будет добавлена позже
} 