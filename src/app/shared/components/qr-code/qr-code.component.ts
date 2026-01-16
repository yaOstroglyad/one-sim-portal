import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';

import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-qr-code',
  template: `
    @if (qrCodeValue()) {
      <div class="qr-wrapper">
        <qrcode
          [qrdata]="qrCodeValue()"
          [width]="256"
          errorCorrectionLevel="M"
        />
      </div>
    } @else {
      <app-empty-state
        [title]="'qrCode.noQrCode' | translate"
        [imageSrc]="'assets/img/empty-states/file-not-found.svg'"
      />
    }
  `,
  imports: [
    QRCodeComponent,
    EmptyStateComponent,
    TranslateModule
  ],
  styleUrls: ['./qr-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeComponent {
  readonly qrCodeValue = input<string | null>(null);
}
