import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploadResourceService } from '../upload-resource.service';

@Component({
	selector: 'app-upload-dialog',
	templateUrl: './upload-dialog.component.html',
	styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent {
	uploadSuccess: boolean = false;
	uploadError: boolean = false;
	file: File;

	constructor(public dialogRef: MatDialogRef<UploadDialogComponent>,
							@Inject(MAT_DIALOG_DATA) public data: { uploadResourceService: UploadResourceService, selectionResult: any }) {
		console.log('data', this.data);
	}
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');
  }

	onFileDropped(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();

    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			this.file = files[0];
			this.uploadFile();
		}
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.dialogRef.close();
	}

	onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length) {
			this.file = input.files[0];
			this.uploadFile();
		}
	}

	private uploadFile(): void {
		if (!this.file) return;

		this.data.uploadResourceService.uploadFile(this.file).subscribe(
			(success) => {
				this.uploadSuccess = true;
			},
			error => {
				this.uploadError = true;
			}
		);
	}
}
