import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { LoadingStatus } from '../../models/dashboard.types';

@Component({
    standalone: true,
    selector: 'app-loading-indicator',
    imports: [TranslateModule],
    templateUrl: './loading-indicator.component.html',
    styleUrls: ['./loading-indicator.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorComponent {
  @Input() status: LoadingStatus = { state: 'loading' };
  @Input() fullScreen = false;
  @Input() message?: string;
}