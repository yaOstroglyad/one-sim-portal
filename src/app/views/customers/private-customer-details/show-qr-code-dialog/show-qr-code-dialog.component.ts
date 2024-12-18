import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormGeneratorModule } from '../../../../shared/components/form-generator/form-generator.module';
import { MatButtonModule } from '@angular/material/button';
import { QrCodeComponent } from '../../../../shared/components/qr-code/qr-code.component';

@Component({
  selector: 'app-show-qr-code-dialog',
  templateUrl: './show-qr-code-dialog.component.html',
  styleUrls: ['./show-qr-code-dialog.component.scss'],
  imports: [
    FormGeneratorModule,
    MatButtonModule,
    MatDialogModule,
    QrCodeComponent
  ],
  standalone: true
})
export class ShowQrCodeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    public dialogRef: MatDialogRef<ShowQrCodeDialogComponent>
  ) {
    console.log('data', data);
  }

  close(): void {
    this.dialogRef.close();
  }
}
