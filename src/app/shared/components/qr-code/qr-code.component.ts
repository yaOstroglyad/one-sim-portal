import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  template: `
    <div>
      <canvas #qrCanvas></canvas>
    </div>
  `,
  standalone: true,
  styleUrls: ['./qr-code.component.scss']
})
export class QrCodeComponent implements OnInit {
  @ViewChild('qrCanvas', { static: true }) qrCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() qrCodeValue: string = null;

  ngOnInit(): void {
    if(this.qrCodeValue) {
      this.generateQRCode(this.qrCodeValue);
    }
  }

  generateQRCode(data: string): void {
    QRCode.toCanvas(this.qrCanvas.nativeElement, data, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      } else {
        console.log('QR code generated!');
      }
    });
  }
}
