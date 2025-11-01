import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconModule } from '@coreui/icons-angular';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule, TranslateModule, IconModule],
  template: `
    <div class="reports-container">
      <div class="placeholder-content">
        <c-icon name="cilChart" size="4xl" class="placeholder-icon"></c-icon>
        <h2>{{ 'analytics.reports.title' | translate }}</h2>
        <p>{{ 'analytics.reports.description' | translate }}</p>
        <div class="coming-soon">
          <span class="badge">Coming Soon</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      min-height: calc(100vh - 56px);
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 3rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .placeholder-icon {
      color: var(--os-color-primary);
      margin-bottom: 1.5rem;
      opacity: 0.6;
    }

    h2 {
      font-size: 1.75rem;
      font-weight: 600;
      color: #2c2c2c;
      margin: 0 0 0.75rem 0;
    }

    p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 1.5rem 0;
      max-width: 500px;
    }

    .coming-soon {
      margin-top: 1rem;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background-color: var(--os-color-primary);
      color: #ffffff;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {}
