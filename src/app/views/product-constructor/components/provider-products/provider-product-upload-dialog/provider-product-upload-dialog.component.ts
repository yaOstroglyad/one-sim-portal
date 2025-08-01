import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ProviderProductService } from '../../../services';
import { FileUploadComponent, FileUploadConfig } from '../../../../../shared';

export interface ProviderProductUploadDialogData {
  // Empty interface since we don't need any input data
}

@Component({
  selector: 'app-provider-product-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
    FileUploadComponent
  ],
  templateUrl: './provider-product-upload-dialog.component.html',
  styleUrls: ['./provider-product-upload-dialog.component.scss']
})
export class ProviderProductUploadDialogComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadComponent') fileUploadComponent!: FileUploadComponent;
  
  private unsubscribe$ = new Subject<void>();
  
  uploadSuccess = false;
  uploadError = false;
  isUploading = false;
  
  uploadConfig: FileUploadConfig = {
    acceptedFormats: ['.csv', '.xlsx', '.xls'],
    showUploadButton: true,
    autoUpload: false,
    dropZoneText: '',
    supportedFormatsText: '',
    chooseFileButtonText: '',
    uploadButtonText: ''
  };

  constructor(
    public dialogRef: MatDialogRef<ProviderProductUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProviderProductUploadDialogData,
    private providerProductService: ProviderProductService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeUploadConfig();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initializeUploadConfig(): void {
    this.uploadConfig = {
      acceptedFormats: ['.csv', '.xlsx', '.xls'],
      showUploadButton: true,
      autoUpload: false,
      dropZoneText: this.translateService.instant('providerProduct.uploadDialog.dropZoneMessage'),
      supportedFormatsText: this.translateService.instant('providerProduct.uploadDialog.supportedFormats'),
      chooseFileButtonText: this.translateService.instant('providerProduct.uploadDialog.chooseFileButton'),
      uploadButtonText: this.translateService.instant('providerProduct.uploadDialog.uploadButton')
    };
  }

  onFileSelected(file: File): void {
    // File selection is handled by the shared component
    console.log('File selected:', file.name);
  }

  onUploadRequested(file: File): void {
    this.isUploading = true;
    this.uploadError = false;
    this.uploadSuccess = false;
    
    // Update the shared component state
    this.fileUploadComponent.setUploadingState(true);
    
    this.providerProductService.uploadProviderProducts(file)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: () => {
        this.isUploading = false;
        this.uploadSuccess = true;
        this.fileUploadComponent.setUploadSuccess(true);
      },
      error: (error) => {
        this.isUploading = false;
        this.uploadError = true;
        this.fileUploadComponent.setUploadError(true, 'Upload failed. Please try again.');
        console.error('Upload error:', error);
      }
    });
  }

  onFileCleared(): void {
    this.uploadSuccess = false;
    this.uploadError = false;
    this.isUploading = false;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    this.dialogRef.close(this.uploadSuccess);
  }
}