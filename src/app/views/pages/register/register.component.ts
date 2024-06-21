import { Component } from '@angular/core';
import { RegistrationConfig } from './registration.config';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
	RegistrationConfig = RegistrationConfig;
	isFormValid: any;

	constructor() {}

	handleFormChanges(form: FormGroup): void {
		this.isFormValid = form.valid;
	}
}
