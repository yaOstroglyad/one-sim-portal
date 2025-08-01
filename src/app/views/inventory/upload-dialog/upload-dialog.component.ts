import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { UploadResourceService } from './upload-resource.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileUploadComponent, FileUploadConfig } from '../../../shared';

@Component({
	selector: 'app-upload-dialog',
	templateUrl: './upload-dialog.component.html',
	styleUrls: ['./upload-dialog.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		TranslateModule,
		FileUploadComponent
	]
})
export class UploadDialogComponent implements OnInit, OnDestroy {
	@ViewChild('fileUploadComponent') fileUploadComponent!: FileUploadComponent;
	
	public unsubscribe$: Subject<void> = new Subject<void>();
	serviceProviderId: string;
	orderDescription: string;
	uploadSuccess: boolean = false;
	uploadError: boolean = false;
	isUploading: boolean = false;
	currentFile: File | null = null;

	uploadConfig: FileUploadConfig = {
		acceptedFormats: ['.csv', '.xlsx', '.xls'],
		showUploadButton: false,
		autoUpload: true,
		dropZoneText: '',
		supportedFormatsText: '',
		chooseFileButtonText: ''
	};

	constructor(
		public dialogRef: MatDialogRef<UploadDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private uploadResourceService: UploadResourceService
	) {}

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
    }

	ngOnInit(): void {
		this.serviceProviderId = this.data.serviceProviderId;
		this.orderDescription = this.data.orderDescription;
		this.initializeUploadConfig();
	}

	private initializeUploadConfig(): void {
		this.uploadConfig = {
			acceptedFormats: ['.csv', '.xlsx', '.xls'],
			showUploadButton: false,
			autoUpload: true,
			dropZoneText: 'uploadDialog.dropZoneMessage',
			supportedFormatsText: 'uploadDialog.supportedFormats',
			chooseFileButtonText: 'uploadDialog.chooseFileButton'
		};
	}

	onFileSelected(file: File): void {
		// Auto-upload is enabled, so this will trigger upload automatically
		this.currentFile = file;
		console.log('File selected:', file.name);
	}

	onUploadRequested(file: File): void {
		this.isUploading = true;
		this.uploadError = false;
		this.uploadSuccess = false;

		// Update shared component state
		this.fileUploadComponent.setUploadingState(true);

		this.uploadResourceService.uploadFile(
			file,
			this.serviceProviderId,
			this.orderDescription
		)
		.pipe(takeUntil(this.unsubscribe$))
		.subscribe({
			next: (res) => {
				this.isUploading = false;
				this.uploadSuccess = true;
				this.fileUploadComponent.setUploadSuccess(true);
			},
			error: (err) => {
				this.isUploading = false;
				this.uploadError = true;
				this.fileUploadComponent.setUploadError(true, 'Upload failed. Please try again.');
				console.error('Upload error:', err);
			}
		});
	}

	onFileCleared(): void {
		this.uploadSuccess = false;
		this.uploadError = false;
		this.isUploading = false;
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.dialogRef.close(this.uploadSuccess);
	}
}
