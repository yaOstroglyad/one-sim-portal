import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, FormGeneratorModule } from 'src/app/shared';
import { RetailPreviewComponent } from './retail-preview/retail-preview.component';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { getRetailFormConfig, getRetailSettingsRequest } from './retail.utils';
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
  selector: 'app-retail',
  templateUrl: './retail.component.html',
  styleUrls: ['./retail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorModule,
    RetailPreviewComponent,
    TranslateModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class RetailComponent implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  ngOnInit(): void {
    this.formValues = {
      primaryColor: '#f89c2e',
      secondaryColor: '#fef6f0',
      logoUrl: 'assets/img/brand/1esim-logo.png',
      faviconUrl: 'assets/img/brand/1esim-logo-small.png',
      headlineText: 'Welcome to Our Retail Portal'
    };

    this.formConfig$ = this.viewConfigService.getViewConfigByApplicationType('retailer').pipe(
      map(config => {
        if (config && config.viewConfig) {
          this.formValues = {
            ...this.formValues,
            ...config.viewConfig
          };
          this.cdr.detectChanges();
        }
        return getRetailFormConfig(
          config,
          this.accountsService,
          this.isAdmin
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

        return of(getRetailFormConfig(
          null,
          this.accountsService,
          this.isAdmin
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
      const settings = getRetailSettingsRequest(this.formGenerator.form.value);
      this.viewConfigService.save(settings).subscribe({
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
