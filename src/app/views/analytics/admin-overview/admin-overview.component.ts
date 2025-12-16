import { Component, ChangeDetectionStrategy } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '@shared';

@Component({
  standalone: true,
  selector: 'app-admin-overview',
  imports: [TranslateModule, IconComponent],
  template: `
    <div class="admin-overview-container">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <app-icon [icon]="'chart-line'"></app-icon>
        </div>
        <h2>{{ 'analytics.adminOverview.title' | translate }}</h2>
        <p>{{ 'analytics.adminOverview.description' | translate }}</p>
        <div class="feature-list">
          <div class="feature-item">
            <span class="feature-icon">
              <app-icon [icon]="'check-circle'"></app-icon>
            </span>
            <span>Multi-tenant analytics across all customers</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">
              <app-icon [icon]="'check-circle'"></app-icon>
            </span>
            <span>Revenue and performance metrics</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">
              <app-icon [icon]="'check-circle'"></app-icon>
            </span>
            <span>Customer comparison and insights</span>
          </div>
        </div>
        <div class="coming-soon">
          <span class="badge">Coming Soon</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-overview-container {
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
      width: 80px;
      height: 80px;
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

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1.5rem 0;
      align-items: flex-start;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #6b7280;
      font-size: 0.9375rem;
    }

    .feature-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      color: var(--os-color-success);
    }

    .coming-soon {
      margin-top: 1.5rem;
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
export class AdminOverviewComponent {}
