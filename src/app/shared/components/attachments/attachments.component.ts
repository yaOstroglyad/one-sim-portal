import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { ButtonDirective } from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { Attachment, AttachmentsConfiguration, UploadAttachmentRequest } from '../../models';

@Component({
    standalone: true,
    selector: 'app-attachments',
    imports: [
    TranslateModule,
    ButtonDirective,
    IconDirective
],
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttachmentsComponent implements OnInit {
  @Input() attachments: Attachment[] = [];
  @Input() config: AttachmentsConfiguration;
  @Input() loading: boolean = false;
  
  @Output() fileUploaded = new EventEmitter<UploadAttachmentRequest>();
  @Output() fileDownloaded = new EventEmitter<Attachment>();

  isUploading = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Component initialization
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.config.allowUpload) {
      const file = input.files[0];
      
      // Validate file
      if (this.isValidFile(file)) {
        this.uploadFile(file);
      }
      
      // Reset input
      input.value = '';
    }
  }

  private isValidFile(file: File): boolean {
    // Check file size
    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      // TODO: Show error message
      console.error('File size exceeds maximum allowed size');
      return false;
    }
    
    // Check MIME type
    if (this.config.allowedMimeTypes && this.config.allowedMimeTypes.length > 0) {
      if (!this.config.allowedMimeTypes.includes(file.type)) {
        // TODO: Show error message
        console.error('File type not allowed');
        return false;
      }
    }
    
    return true;
  }

  private uploadFile(file: File): void {
    this.isUploading = true;
    
    const request: UploadAttachmentRequest = {
      entityId: this.config.entityId,
      entityType: this.config.entityType,
      file: file
    };

    this.fileUploaded.emit(request);
    
    // Reset uploading state after emission
    setTimeout(() => {
      this.isUploading = false;
      this.cdr.markForCheck();
    }, 100);
  }

  downloadAttachment(attachment: Attachment): void {
    if (this.config.allowDownload) {
      this.fileDownloaded.emit(attachment);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'cil-file';
    if (mimeType.startsWith('video/')) return 'cil-file';
    if (mimeType.startsWith('audio/')) return 'cil-file';
    if (mimeType.includes('pdf')) return 'cil-file';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'cil-file';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'cil-spreadsheet';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'cil-file';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'cil-folder';
    if (mimeType.includes('text')) return 'cil-notes';
    
    return 'cil-file';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByAttachmentId(index: number, attachment: Attachment): string {
    return attachment.id;
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  get uploadHint(): string {
    return this.config?.uploadHint || 'attachments.uploadHint';
  }
}
