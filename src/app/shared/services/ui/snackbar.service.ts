import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({providedIn: 'root'})
export class SnackbarService {
	matSnackBar = inject(MatSnackBar);

	showMessage(message: string, action = 'Close', duration = 5000, panelClass: string = '') {
		this.matSnackBar.open(message, action, {
			duration,
			panelClass
		});
	}
}
