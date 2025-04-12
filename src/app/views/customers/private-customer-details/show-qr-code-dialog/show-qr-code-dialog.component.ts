import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QrCodeComponent, SubscriberDataService } from '../../../../shared';
import { TranslateModule } from '@ngx-translate/core';
import { CopyToClipboardDirective } from '../../../../shared/directives/copy-to-clipboard.directive';

@Component({
  selector: 'app-show-qr-code-dialog',
  templateUrl: './show-qr-code-dialog.component.html',
  styleUrls: ['./show-qr-code-dialog.component.scss'],
	imports: [
		MatButtonModule,
		MatDialogModule,
		QrCodeComponent,
		TranslateModule,
		CopyToClipboardDirective
	],
  standalone: true
})
export class ShowQrCodeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ShowQrCodeDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
