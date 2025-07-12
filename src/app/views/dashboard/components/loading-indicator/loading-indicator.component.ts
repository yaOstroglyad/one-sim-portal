import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingStatus } from '../../models/dashboard.types';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './loading-indicator.component.html',
  styleUrls: ['./loading-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorComponent {
  @Input() status: LoadingStatus = { state: 'loading' };
  @Input() fullScreen = false;
  @Input() message?: string;
}