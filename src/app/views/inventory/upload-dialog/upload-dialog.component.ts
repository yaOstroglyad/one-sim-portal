import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UploadResourceService } from './upload-resource.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-upload-dialog',
	templateUrl: './upload-dialog.component.html',
	styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit, OnDestroy {
	public unsubscribe$: Subject<void> = new Subject<void>();
	serviceProviderId: string;
	orderDescription: string;
	uploadSuccess: boolean = false;
	uploadError: boolean = false;
	file: File;

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

		const files = event.dataTransfer.files;
		if (files.length > 0) {
			this.file = files[0];
			this.uploadFile();
		}
	}

	onFileSelected(event: any): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length) {
			this.file = input.files[0];
			this.uploadFile();
		}
	}

	private uploadFile(): void {
		if (!this.file) return;

		this.uploadResourceService.uploadFile(
			this.file,
			this.serviceProviderId,
			this.orderDescription
		)
			.pipe(takeUntil(this.unsubscribe$))
			.subscribe({
			next: (res) => {
				this.uploadSuccess = true;
			},
			error: (err) => {
				this.uploadError = true;
			}
		});
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.dialogRef.close(this.uploadSuccess);
	}
}
