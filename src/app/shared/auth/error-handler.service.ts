import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
	constructor() {}

	handleError(error: any): void {
		const chunkFailedMessage = /Loading chunk .*failed.*[.js\\)]/;
		if (chunkFailedMessage.test(error.message)) {
			if (confirm("New version available. Load New Version?")) {
				window.location.reload();
			}
		}
	}
}
