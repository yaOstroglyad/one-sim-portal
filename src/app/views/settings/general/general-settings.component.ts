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
import { WhitelabelSettingsService } from '@shared';
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
            <div class="info-box">
              <h5 class="info-heading">{{ 'settings.general.info.title' | translate }}</h5>
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
    styles: [`
      .card {
        background-color: var(--layout-content-bg);
        border: 1px solid var(--layout-content-border);
        border-radius: 0.375rem;
      }

      .card-header {
        background-color: var(--layout-frame-bg);
        border-bottom: 1px solid var(--layout-content-border);
        color: var(--layout-content-text);
        padding: 1rem 1.5rem;
        font-weight: 600;
      }

      .card-body {
        padding: 1.5rem;
      }

      .info-box {
        padding: 1rem 1.25rem;
        border-radius: 0.375rem;
        background-color: rgba(var(--os-color-info-rgb), 0.1);
        border: 1px solid rgba(var(--os-color-info-rgb), 0.2);
        color: var(--layout-content-text);

        .info-heading {
          color: var(--os-color-info);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        p {
          margin-bottom: 0.75rem;
          color: var(--layout-content-text);
        }

        ul {
          margin: 0;
          padding-left: 1.25rem;

          li {
            margin-bottom: 0.25rem;
            color: var(--layout-content-text);
          }
        }
      }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralSettingsComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;

  private readonly notification = inject(NotificationService);
  private readonly settingsService = inject(WhitelabelSettingsService);
  private readonly authService = inject(AuthService);
  private readonly accountsService = inject(AccountsDataService);

  public formConfig$: Observable<FormConfig>;
  public isFormValid = false;
  public isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

  ngOnInit(): void {
    this.formConfig$ = this.settingsService.get().pipe(
      map(settings => {
        return getGeneralSettingsFormConfig(
          settings,
          this.accountsService,
          this.isAdmin,
          this.settingsService
        );
      }),
      catchError(() => {
        this.notification.error('errors.settingsLoadFailed');
        return of(getGeneralSettingsFormConfig(
          null,
          this.accountsService,
          this.isAdmin,
          this.settingsService
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
        ? this.settingsService.update(payload)
        : this.settingsService.create(payload);

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
