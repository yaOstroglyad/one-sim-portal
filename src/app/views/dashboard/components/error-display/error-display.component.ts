import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardError } from '../../models/dashboard.types';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './error-display.component.html',
  styleUrls: ['./error-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorDisplayComponent {
  @Input() error!: DashboardError;
  @Input() showRetry = true;
  @Input() inline = false;
  
  @Output() retry = new EventEmitter<void>();
  
  get errorIcon(): string {
    switch (this.error.code) {
      case '404':
        return 'icon-search';
      case '401':
      case '403':
        return 'icon-lock';
      case '503':
        return 'icon-clock';
      default:
        return 'icon-alert-circle';
    }
  }
  
  get errorType(): string {
    switch (this.error.code) {
      case '404':
        return 'not-found';
      case '401':
      case '403':
        return 'unauthorized';
      case '503':
        return 'service-unavailable';
      default:
        return 'generic';
    }
  }
  
  onRetry(): void {
    this.retry.emit();
  }
}