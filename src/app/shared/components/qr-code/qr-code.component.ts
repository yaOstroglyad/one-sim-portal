import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as QRCode from 'qrcode';
import { AsyncPipe, NgIf } from '@angular/common';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-qr-code',
  template: `
    <div class="text-center" [class.no-height]="!qrCodeValue">
      <canvas #qrCanvas></canvas>
    </div>
    <app-empty-state
      *ngIf="!qrCodeValue"
      [title]="'No QR code for the subscriber'"
      [imageSrc]="'assets/img/empty-states/file-not-found.svg'">
    </app-empty-state>
  `,
  standalone: true,
  imports: [
    AsyncPipe,
    EmptyStateComponent,
    NgIf
  ],
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
