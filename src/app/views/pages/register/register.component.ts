import { Component } from '@angular/core';
import { RegistrationConfig } from './registration.config';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
	RegistrationConfig = RegistrationConfig;

	constructor() {}

}
