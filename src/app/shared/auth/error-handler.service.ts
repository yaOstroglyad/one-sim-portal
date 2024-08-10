import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
	constructor(private router: Router) {}

	handleError(error: any): void {
		const chunkFailedMessage = /Loading chunk [\d]+ failed/;
		if (chunkFailedMessage.test(error.message)) {
			window.location.reload();
		} else {
			console.error('Произошла ошибка:', error);
			// Дополнительная обработка ошибок, если требуется
		}
	}
}
