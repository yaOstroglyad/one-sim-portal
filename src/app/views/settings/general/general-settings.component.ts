import { ChangeDetectorRef, Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, FormGeneratorModule } from 'src/app/shared';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { getGeneralSettingsFormConfig, getCompanySettingsRequest } from './general-settings.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, catchError, map, of } from 'rxjs';
import { FormConfig } from 'src/app/shared';
import { AccountsDataService } from 'src/app/shared/services/accounts-data.service';
import { WhiteLabelDataService } from 'src/app/shared/services/white-label-data.service';

@Component({
  selector: 'app-general-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorModule,
    TranslateModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDividerModule
  ],
  template: `
    <div class="content-container card">
      <div class="card-header">
        {{ 'settings.general.title' | translate }}
      </div>
      <div class="card-body">
        <div class="d-flex">
          <div class="w-50 mt-1 me-4">
            <ng-container *ngIf="formConfig$ | async as formConfig">
              <app-form-generator
                [config]="formConfig"
                (formChanges)="handleFormChanges($event)">
              </app-form-generator>
              <div class="d-flex justify-content-start">
                <button
                  mat-flat-button
                  color="primary"
                  [disabled]="!isFormValid"
                  (click)="save()">
                  {{ 'common.save' | translate }}
                </button>
              </div>
            </ng-container>
          </div>
          <div class="w-50 ms-4">
            <div class="alert alert-info">
              <h5 class="alert-heading">{{ 'settings.general.info.title' | translate }}</h5>
              <p>{{ 'settings.general.info.description' | translate }}</p>
              <ul>
                <li>{{ 'settings.general.info.senderEmail' | translate }}</li>
                <li>{{ 'settings.general.info.logo' | translate }}</li>
                <li>{{ 'settings.general.info.supportLinks' | translate }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;

  public formConfig$: Observable<FormConfig>;
  public isFormValid = false;
  public isAdmin = false;

  constructor(
    private snackBar: MatSnackBar,
    private whiteLabelService: WhiteLabelDataService,
    private authService: AuthService,
    private accountsService: AccountsDataService,
  ) {
    this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  }

  ngOnInit(): void {
    this.formConfig$ = this.whiteLabelService.companySettings().pipe(
      map(settings => {
        return getGeneralSettingsFormConfig(
          settings,
          this.accountsService,
          this.isAdmin,
          this.whiteLabelService
        );
      }),
      catchError(error => {
        console.error('Ошибка при получении настроек:', error);
        this.snackBar.open('Ошибка при загрузке настроек. Используются дефолтные значения.', 'Закрыть', {
          duration: 3000
        });

        return of(getGeneralSettingsFormConfig(
          null,
          this.accountsService,
          this.isAdmin,
          this.whiteLabelService
        ));
      })
    );
  }

  handleFormChanges(form: any): void {
    this.isFormValid = form.valid;
  }

  save(): void {
    if (this.formGenerator.form.valid) {
      const formValues = this.formGenerator.form.value;
      const payload = getCompanySettingsRequest(formValues);

      const saveOperation = formValues.id
        ? this.whiteLabelService.updateCompanySettings(payload)
        : this.whiteLabelService.createCompanySettings(payload);

      saveOperation.subscribe({
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
