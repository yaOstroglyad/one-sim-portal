import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ADMIN_PERMISSION, AuthService, FormGeneratorComponent } from 'src/app/shared';
import { RetailPreviewComponent } from './retail-preview/retail-preview.component';
import { getRetailFormConfig, getRetailSettingsRequest } from './retail.utils';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { APPLICATION_TYPES, WhitelabelConfigService } from '@shared';
import { Observable, catchError, map, of } from 'rxjs';
import { FormConfig } from 'src/app/shared';
import { AccountsDataService } from 'src/app/shared/services/data/accounts-data.service';
import { NotificationService } from '@shared/services/ui/notification.service';
import { tap } from 'rxjs/operators';
import { MatInputModule } from '@angular/material/input';

@Component({
    standalone: true,
    selector: 'app-retail',
    templateUrl: './retail.component.html',
    styleUrls: ['./retail.component.scss'],
    imports: [
        CommonModule,
        FormGeneratorComponent,
        RetailPreviewComponent,
        TranslateModule,
        MatButtonModule,
        MatDividerModule,
        MatInputModule
    ]
})
export class RetailComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;

  private readonly notification = inject(NotificationService);
  private readonly whitelabelConfigService = inject(WhitelabelConfigService);
  private readonly authService = inject(AuthService);
  private readonly accountsService = inject(AccountsDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  public formConfig$: Observable<FormConfig>;
  public isFormValid = false;
  private isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
  public formValues: any = {};

  ngOnInit(): void {
    this.formValues = {
      primary: '#f9a743',
      'primary-hover': '#eab308',
      'border-neutral': '0, 0%, 50%',
      backdrop: '#272727cc',
      brandName: 'OnlySim',
      heroTitle: "Connect Globally with <span class='text-primary'>OnlySim eSIM</span>",
      heroSubTitle: "Stay connected worldwide with our reliable and affordable eSIM solutions.",
      logoWidth: 120,
      logoHeight: 40,
      logoUrl: 'assets/img/brand/1esim-logo.png',
      faviconUrl: 'assets/img/brand/1esim-logo-small.png',
      supportUrl: 'https://t.me/only_sim_bot'
    };

    this.formConfig$ = this.whitelabelConfigService.getByApplicationType(APPLICATION_TYPES.RETAILER).pipe(
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
          this.isAdmin,
          this.whitelabelConfigService
        );
      }),
      tap(() => {
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      }),
      catchError(() => {
        this.notification.error('errors.settingsLoadFailed');
        return of(getRetailFormConfig(
          null,
          this.accountsService,
          this.isAdmin,
          this.whitelabelConfigService
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
      this.whitelabelConfigService.save(settings).subscribe({
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
