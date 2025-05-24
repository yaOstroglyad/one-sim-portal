import {
	ChangeDetectorRef,
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ADMIN_PERMISSION,
	AuthService,
	FormGeneratorModule
} from 'src/app/shared';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import {
	getPortalFormConfig,
	getPortalSettingsRequest
} from './portal.utils';
import {
	MatSnackBar,
	MatSnackBarModule
} from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ViewConfigurationService } from '../view-configuration.service';
import {
  concat,
  Observable,
  of
} from 'rxjs';
import {
	map,
	catchError,
} from 'rxjs/operators';
import { FormConfig } from 'src/app/shared';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VisualService } from 'src/app/shared/services/visual.service';

@Component({
	selector: 'app-portal',
	templateUrl: './portal.component.html',
	styleUrls: ['./portal.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		FormGeneratorModule,
		PortalPreviewComponent,
		TranslateModule,
		MatSnackBarModule,
		MatButtonModule,
		MatDividerModule,
		MatFormFieldModule
	]
})
export class PortalComponent implements OnInit {
	@ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;

	private readonly isAdmin: boolean;

	public formConfig$: Observable<FormConfig>;
	public isFormValid = false;
	public formValues: any = {};
  public defaultFormConfig: FormConfig;


  constructor(
		private snackBar: MatSnackBar,
		private viewConfigService: ViewConfigurationService,
		private authService: AuthService,
		private accountsService: AccountsDataService,
		private visualService: VisualService,
		private cdr: ChangeDetectorRef
	) {
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	}

  ngOnInit() {
    const defaultVC = this.viewConfigService.getDefaultConfig('admin portal');
    this.defaultFormConfig = getPortalFormConfig(
      defaultVC,
      this.accountsService,
      this.isAdmin,
      this.viewConfigService
    );

    const load$ = this.viewConfigService
      .getViewConfigByApplicationType('admin portal')
      .pipe(
        map(vc => {
          if (vc.viewConfig) {
            this.formValues = { ...this.formValues, ...vc.viewConfig };
            this.cdr.markForCheck();
          }
          return getPortalFormConfig(vc, this.accountsService, this.isAdmin, this.viewConfigService);
        }),
        catchError(() => of(this.defaultFormConfig))
      );

    this.formConfig$ = concat(of(this.defaultFormConfig), load$);
  }

	handleFormChanges(form: any): void {
		this.isFormValid = form.valid;
		this.formValues = form.value;
	}

	save(): void {
		if (!this.formGenerator.form.valid) return;

		const values = this.formGenerator.form.value;
		const payload = getPortalSettingsRequest(values);

		this.viewConfigService.save(payload).subscribe({
			next: () => {
				this.snackBar.open('Settings saved successfully', 'Close', {
					duration: 3000,
					panelClass: 'app-notification-success'
				});
				if (!this.isAdmin) {
					this.visualService.applyVisualConfig({...values, language: 'en'});
				}
			}
		});
	}
}
