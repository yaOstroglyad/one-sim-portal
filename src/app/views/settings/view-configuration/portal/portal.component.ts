import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, FormGeneratorModule } from 'src/app/shared';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { getPortalFormConfig, getPortalSettingsRequest } from './portal.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ViewConfigurationService } from '../view-configuration.service';
import { Observable, catchError, map, of } from 'rxjs';
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

  public formConfig$: Observable<FormConfig>;
  public isFormValid = false;
  private isAdmin = false;
  public formValues: any = {};

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

  ngOnInit(): void {
    const currentConfig = this.visualService.getCurrentConfig();

    this.formValues = {
      primaryColor: currentConfig.primaryColor,
      secondaryColor: currentConfig.secondaryColor,
      logoUrl: currentConfig.logoUrl,
      faviconUrl: currentConfig.faviconUrl,
      height: currentConfig.height || 47
    };

    this.formConfig$ = this.viewConfigService.getViewConfigByApplicationType('admin portal').pipe(
      map(config => {
        if (config && config.viewConfig) {
          this.formValues = {
            ...this.formValues,
            ...config.viewConfig
          };
          this.cdr.detectChanges();
        }
        return getPortalFormConfig(
          config,
          this.accountsService,
          this.isAdmin,
          this.viewConfigService
        );
      }),
      catchError(error => {
        console.error('Ошибка при получении конфигурации:', error);
        this.snackBar.open('Ошибка при загрузке настроек. Используются дефолтные значения.', 'Закрыть', {
          duration: 3000
        });

        return of(getPortalFormConfig(
          null,
          this.accountsService,
          this.isAdmin,
          this.viewConfigService
        ));
      })
    );
  }

  handleFormChanges(form: any): void {
    this.isFormValid = form.valid;
    this.formValues = form.value;
  }

  save(): void {
    if (this.formGenerator.form.valid) {
      const formValues = { ...this.formGenerator.form.value };

      const payload = getPortalSettingsRequest(formValues);
      this.viewConfigService.save(payload).subscribe({
        next: (response) => {

          const newConfig = {
            primaryColor: formValues.primaryColor,
            secondaryColor: formValues.secondaryColor,
            language: 'en',
            logoUrl: formValues.logoUrl,
            faviconUrl: formValues.faviconUrl,
            height: formValues.height
          };

          if(!this.isAdmin) {
            this.visualService.applyVisualConfig(newConfig);
          }

          this.snackBar.open('Настройки сохранены успешно', 'Закрыть', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Ошибка при сохранении настроек:', error);
          this.snackBar.open('Ошибка при сохранении настроек', 'Закрыть', {
            duration: 3000
          });
        }
      });
    }
  }
}
