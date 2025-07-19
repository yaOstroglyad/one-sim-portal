import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// Metric card interface (copied from dashboard types)
export interface MetricCard {
  id: string;
  title: string;
  value: number | string;
  format?: 'number' | 'currency' | 'percentage' | 'bytes';
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    label?: string;
  };
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  icon?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './metric-card.component.html',
  styleUrls: ['./metric-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricCardComponent {
  @Input() metric!: MetricCard;
  
  get trendIcon(): string {
    if (!this.metric.change) return '';
    
    switch (this.metric.change.trend) {
      case 'up':
        return 'arrow-up';
      case 'down':
        return 'arrow-down';
      default:
        return 'minus';
    }
  }
  
  get trendClass(): string {
    if (!this.metric.change) return '';
    
    const isPositive = this.metric.change.value > 0;
    const isGood = 
      (this.metric.change.trend === 'up' && isPositive) ||
      (this.metric.change.trend === 'down' && !isPositive);
    
    return isGood ? 'trend-positive' : 'trend-negative';
  }
}