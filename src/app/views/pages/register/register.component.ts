import { Component } from '@angular/core';
import { RegistrationConfig } from './registration.config';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
	RegistrationConfig = RegistrationConfig;
	isFormValid: any;

	constructor(private translate: TranslateService) {
		this.translateLabels();
	}

	handleFormChanges(form: FormGroup): void {
		this.isFormValid = form.valid;
	}

	private translateLabels(): void {
		this.RegistrationConfig.fields.forEach(field => {
			this.translate.get(field.label).subscribe((translatedLabel: string) => {
				field.label = translatedLabel;
			});
		});
	}
}
