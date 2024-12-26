import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { QrCodeComponent } from '../../../../shared';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-show-qr-code-dialog',
  templateUrl: './show-qr-code-dialog.component.html',
  styleUrls: ['./show-qr-code-dialog.component.scss'],
	imports: [
		MatButtonModule,
		MatDialogModule,
		QrCodeComponent,
		TranslateModule
	],
  standalone: true
})
export class ShowQrCodeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    public dialogRef: MatDialogRef<ShowQrCodeDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
