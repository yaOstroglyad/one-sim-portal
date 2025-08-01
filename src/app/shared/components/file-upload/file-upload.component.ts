import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { IconDirective } from '@coreui/icons-angular';

export interface FileUploadConfig {
  acceptedFormats: string[];
  maxFileSize?: number; // in bytes
  dropZoneText?: string;
  supportedFormatsText?: string;
  chooseFileButtonText?: string;
  uploadButtonText?: string;
  showUploadButton?: boolean;
  autoUpload?: boolean;
}

export interface FileUploadState {
  file: File | null;
  isUploading: boolean;
  uploadSuccess: boolean;
  uploadError: boolean;
  errorMessage?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    TranslateModule,
    IconDirective
  ],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() config: FileUploadConfig = {
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
    dropZoneText: 'Drag and drop a file here, or click to browse',
    supportedFormatsText: 'Supported formats: CSV, Excel (.xlsx, .xls)',
    chooseFileButtonText: 'Choose File',
    uploadButtonText: 'Upload',
    showUploadButton: true,
    autoUpload: false
  };

  @Input() disabled = false;
  
  @Output() fileSelected = new EventEmitter<File>();
  @Output() uploadRequested = new EventEmitter<File>();
  @Output() fileCleared = new EventEmitter<void>();

  state: FileUploadState = {
    file: null,
    isUploading: false,
    uploadSuccess: false,
    uploadError: false
  };

  get acceptedFormatsString(): string {
    return this.config.acceptedFormats.join(',');
  }

  get shouldShowChooseButton(): boolean {
    return !this.state.file && !this.state.isUploading && !this.state.uploadSuccess;
  }

  get shouldShowUploadButton(): boolean {
    return this.config.showUploadButton && 
           this.state.file && 
           !this.state.isUploading && 
           !this.state.uploadSuccess && 
           !this.state.uploadError;
  }

  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');
  }

  onFileDropped(event: DragEvent): void {
    if (this.disabled) return;
    
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelected(event: any): void {
    if (this.disabled) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.handleFileSelection(input.files[0]);
      // Clear the input so the same file can be selected again
      input.value = '';
    }
  }

  private handleFileSelection(file: File): void {
    // Validate file type
    if (!this.isValidFileType(file)) {
      this.state.uploadError = true;
      this.state.errorMessage = `Invalid file type. Supported formats: ${this.config.acceptedFormats.join(', ')}`;
      return;
    }

    // Validate file size
    if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
      this.state.uploadError = true;
      this.state.errorMessage = `File size exceeds maximum allowed size of ${this.formatFileSize(this.config.maxFileSize)}`;
      return;
    }

    // Reset error state
    this.state.uploadError = false;
    this.state.errorMessage = undefined;
    this.state.file = file;

    this.fileSelected.emit(file);

    if (this.config.autoUpload) {
      this.onUpload();
    }
  }

  private isValidFileType(file: File): boolean {
    const fileName = file.name.toLowerCase();
    return this.config.acceptedFormats.some(format => 
      fileName.endsWith(format.toLowerCase())
    );
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onChooseFile(): void {
    if (this.disabled) return;
    
    const fileInput = document.querySelector('#file-input-' + this.componentId) as HTMLInputElement;
    fileInput?.click();
  }

  onUpload(): void {
    if (!this.state.file || this.disabled) return;
    
    this.uploadRequested.emit(this.state.file);
  }

  onClearFile(): void {
    this.state.file = null;
    this.state.uploadSuccess = false;
    this.state.uploadError = false;
    this.state.errorMessage = undefined;
    this.fileCleared.emit();
  }

  // Public methods to control upload state from parent
  setUploadingState(isUploading: boolean): void {
    this.state.isUploading = isUploading;
  }

  setUploadSuccess(success: boolean): void {
    this.state.uploadSuccess = success;
    this.state.isUploading = false;
    this.state.uploadError = false;
  }

  setUploadError(error: boolean, message?: string): void {
    this.state.uploadError = error;
    this.state.isUploading = false;
    this.state.uploadSuccess = false;
    this.state.errorMessage = message;
  }

  // Generate unique ID for file input
  componentId = Math.random().toString(36).substr(2, 9);
}