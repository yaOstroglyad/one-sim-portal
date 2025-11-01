import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { transformHttpError } from '../utils';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

	constructor(
		private snackBar: MatSnackBar,
		private zone: NgZone
	) {}

	handleError(error: any): void {
		this.zone.run(() => {
			let message = 'An unexpected error occurred';

			// Use shared error transformation for HTTP errors
			if (error instanceof HttpErrorResponse) {
				const apiError = transformHttpError(error);
				message = apiError.message;
			} else if (error && error.message) {
				message = error.message;
			}

			this.snackBar.open(
				message,
				'Close',
				{
					duration: 3000,
					panelClass: 'app-notification-error'
				}
			);
		});

		console.error('GlobalErrorHandler caught:', error);
	}
}
