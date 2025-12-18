import {
	ChangeDetectorRef,
	Component,
	OnInit,
	ViewChild,
	inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
	ADMIN_PERMISSION,
	AuthService,
	FormGeneratorComponent
} from 'src/app/shared';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';
import {
	getPortalFormConfig,
	getPortalSettingsRequest
} from './portal.utils';
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
import { AccountsDataService } from 'src/app/shared/services/data/accounts-data.service';
import { NotificationService } from '@shared/services/ui/notification.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VisualService } from 'src/app/shared/services/ui/visual.service';

@Component({
    standalone: true,
    selector: 'app-portal',
    templateUrl: './portal.component.html',
    styleUrls: ['./portal.component.scss'],
    imports: [
        CommonModule,
        FormGeneratorComponent,
        PortalPreviewComponent,
        TranslateModule,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule
    ]
})
export class PortalComponent implements OnInit {
	@ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;

	private readonly notification = inject(NotificationService);
	private readonly viewConfigService = inject(ViewConfigurationService);
	private readonly authService = inject(AuthService);
	private readonly accountsService = inject(AccountsDataService);
	private readonly visualService = inject(VisualService);
	private readonly cdr = inject(ChangeDetectorRef);

	private readonly isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

	public formConfig$: Observable<FormConfig>;
	public isFormValid = false;
	public formValues: any = {};
	public defaultFormConfig: FormConfig;

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
				this.notification.success('notifications.settingsSaved');
				if (!this.isAdmin) {
					this.visualService.applyVisualConfig({...values, language: 'en'});
				}
			},
			error: () => {
				this.notification.error('errors.settingsSaveFailed');
			}
		});
	}
}
