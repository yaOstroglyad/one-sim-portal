import { Component, OnInit, ViewChild, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, FormGeneratorComponent } from 'src/app/shared';
import { getGeneralSettingsFormConfig, getCompanySettingsRequest } from './general-settings.utils';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, catchError, map, of } from 'rxjs';
import { FormConfig } from 'src/app/shared';
import { AccountsDataService } from 'src/app/shared/services/data/accounts-data.service';
import { WhiteLabelDataService } from 'src/app/shared/services/data/white-label-data.service';
import { NotificationService } from '@shared/services/ui/notification.service';

@Component({
    standalone: true,
    selector: 'app-general-settings',
    imports: [
        CommonModule,
        FormGeneratorComponent,
        TranslateModule,
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
            @if (formConfig$ | async; as formConfig) {
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
            }
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

  private readonly notification = inject(NotificationService);
  private readonly whiteLabelService = inject(WhiteLabelDataService);
  private readonly authService = inject(AuthService);
  private readonly accountsService = inject(AccountsDataService);

  public formConfig$: Observable<FormConfig>;
  public isFormValid = false;
  public isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

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
      catchError(() => {
        this.notification.error('errors.settingsLoadFailed');
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
          this.notification.success('notifications.settingsSaved');
        },
        error: () => {
          this.notification.error('errors.settingsSaveFailed');
        }
      });
    }
  }
}
