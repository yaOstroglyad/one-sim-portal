import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-html-dialog',
  templateUrl: './html-dialog.component.html',
  styleUrls: ['./html-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule
  ]
})
export class HtmlDialogComponent {
  @ViewChild('htmlDialog') htmlDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('htmlInput') htmlInput!: ElementRef<HTMLTextAreaElement>;
  
  @Output() htmlInserted = new EventEmitter<string>();
  @Output() dialogCanceled = new EventEmitter<void>();

  open(): void {
    this.htmlInput.nativeElement.value = '';
    this.htmlDialog.nativeElement.showModal();
  }

  close(): void {
    this.htmlDialog.nativeElement.close();
  }

  insertHtml(): void {
    const html = this.htmlInput.nativeElement.value;
    this.htmlInserted.emit(html);
    this.close();
  }

  cancelHtmlInsert(): void {
    this.dialogCanceled.emit();
    this.close();
  }
} 