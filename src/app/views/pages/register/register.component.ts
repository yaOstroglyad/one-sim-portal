import { Component } from '@angular/core';
import { RegistrationConfig } from './registration.config';
import { FormGroup } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { FormGeneratorComponent } from '@shared';

@Component({
    standalone: true,
    selector: 'app-register',
    imports: [TranslateModule, MatButtonModule, FormGeneratorComponent],
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
