import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QrCodeComponent } from '@shared';
import { TranslateModule } from '@ngx-translate/core';
import { CopyToClipboardDirective } from '@shared/directives/copy-to-clipboard.directive';
import { printQrCode } from '@shared/utils/dom';

@Component({
  standalone: true,
    selector: 'app-show-qr-code-dialog',
    templateUrl: './show-qr-code-dialog.component.html',
    styleUrls: ['./show-qr-code-dialog.component.scss'],
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        QrCodeComponent,
        TranslateModule,
        CopyToClipboardDirective
    ]
})
export class ShowQrCodeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ShowQrCodeDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Print QR code using shared utility
   * Opens new window with only QR code for printing
   */
  handlePrintQrCode(): void {
    const qrCodeValue = this.data?.qrCode;
    const iccid = this.data?.iccid;

    if (!qrCodeValue || !iccid) {
      console.warn('Cannot print QR code: missing qrCode or iccid data');
      return;
    }

    printQrCode({
      qrCodeValue,
      iccid,
      title: `eSIM QR Code - ${iccid}`
    });
  }
}
