import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, DomainsDataService, FormGeneratorModule } from 'src/app/shared';
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
import { tap } from 'rxjs/operators';

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
    MatDividerModule
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
    private domainsService: DomainsDataService,
    private authService: AuthService,
    private accountsService: AccountsDataService,
    private cdr: ChangeDetectorRef
  ) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  ngOnInit(): void {
    this.formValues = {
      primaryColor: '#f89c2e',
      secondaryColor: '#fef6f0',
      logoUrl: 'assets/img/brand/1esim-logo.png',
      faviconUrl: 'assets/img/brand/1esim-logo-small.png'
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
      tap(() => {
        setTimeout(() => {
          this.cdr.detectChanges();
        });
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
    this.cdr.detectChanges();
  }

  save(): void {
    if (this.formGenerator.form.valid) {
      const payload = getPortalSettingsRequest(this.formGenerator.form.value);
      this.viewConfigService.save(payload).subscribe({
        next: () => {
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
