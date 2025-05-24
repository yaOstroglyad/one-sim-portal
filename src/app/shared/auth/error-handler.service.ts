import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {

	constructor(
		private snackBar: MatSnackBar,
		private zone: NgZone
	) {}

	handleError(error: any): void {
		this.zone.run(() => {
			let message = 'An unexpected error occurred';

			if (error instanceof HttpErrorResponse) {
				if (error.error?.message) {
					message = typeof error.error.message === 'string'
						? error.error.message
						: JSON.stringify(error.error.message);
				} else {
					message = error.message;
				}
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
