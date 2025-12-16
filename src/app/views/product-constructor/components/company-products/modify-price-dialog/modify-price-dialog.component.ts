import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, Signal } from '@angular/core';

import { FormGroup, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonModule } from '@coreui/angular';

import {
  ProductsDataService,
  UserRoleService,
  FormGeneratorComponent,
  FormConfig,
  InfoStripComponent,
  PriceInfoDisplayComponent,
  PricePreviewComponent
} from '@shared';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { UIConfigFactory, ModifyPriceDialogConfig } from '../factories';
import {
  ModifyPriceDialogData,
  ModifyPriceDialogViewModel,
} from './models/modify-price-dialog.model';
import { ModifyPriceDialogPresenter } from './services/modify-price-dialog.presenter';
import { DialogMode, getDialogMode, getDialogTitle, getSaveButtonText, getInfoMessage } from './models/dialog-mode.model';
import { DialogSaveStrategy, createDialogSaveStrategy } from './services/dialog-save.strategy';
import { PriceFormConfigUtils, PriceFormValidators } from '../utils';
import { CompanyProductPriceService } from '../../../services';

@Component({
  standalone: true,
  selector: 'app-modify-price-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    ButtonModule,
    FormGeneratorComponent,
    InfoStripComponent,
    LoaderComponent,
    PriceInfoDisplayComponent,
    PricePreviewComponent
],
  templateUrl: './modify-price-dialog.component.html',
  styleUrls: ['./modify-price-dialog.component.scss'],
  providers: [
    ModifyPriceDialogPresenter
  ]
})
export class ModifyPriceDialogComponent implements OnInit, OnDestroy {
  modifyForm: FormGroup;
  formConfig: FormConfig;
  viewModel: Signal<ModifyPriceDialogViewModel> | null = null;
  uiConfig: ModifyPriceDialogConfig;

  // Dialog mode and derived values
  mode: DialogMode;
  dialogTitle: string;
  saveButtonText: string;
  infoMessage: string;

  // Signals for loading/error states
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Strategy for save operation
  private saveStrategy: DialogSaveStrategy;

  // Injected dependencies
  private readonly destroy$ = new Subject<void>();
  private readonly data = inject<ModifyPriceDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ModifyPriceDialogComponent>);
  private readonly productsDataService = inject(ProductsDataService);
  private readonly priceService = inject(CompanyProductPriceService);
  private readonly presenter = inject(ModifyPriceDialogPresenter);
  private readonly uiConfigFactory = inject(UIConfigFactory);
  private readonly userRoleService = inject(UserRoleService);

  ngOnInit(): void {
    this.mode = getDialogMode(this.data.mode);
    this.dialogTitle = getDialogTitle(this.mode);
    this.saveButtonText = getSaveButtonText(this.mode);
    this.infoMessage = getInfoMessage(this.mode);

    const userRole = this.userRoleService.getCurrentUserRole();
    this.uiConfig = this.uiConfigFactory.createModifyPriceDialogConfig(userRole);

    this.saveStrategy = createDialogSaveStrategy(this.mode, this.priceService);

    this.createFormConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFormConfig(): void {
    const excludeTariffId = this.data.existingTariff?.id;
    const defaultCurrency = this.data.tariffOffer?.currency || 'USD';
    const defaultPrice = 0;

    // Get currencies from ProductsDataService using unified utils
    const currencyOptions$ = PriceFormConfigUtils.createCurrencyOptions(this.productsDataService);

    this.formConfig = PriceFormConfigUtils.createModifyPriceFormConfig(
      this.data.minValidFromDate,
      this.data.existingTariffs || [],
      excludeTariffId,
      defaultPrice,
      defaultCurrency,
      currencyOptions$,
      true // includeValidFrom (non-legacy mode)
    );

    if (this.mode === DialogMode.Edit && this.data.existingTariff) {
      const initialValues = PriceFormConfigUtils.getInitialValuesFromTariff(this.data.existingTariff);
      this.formConfig.fields.forEach(field => {
        if (initialValues[field.name] !== undefined) {
          field.value = initialValues[field.name];
        }
      });
    }
  }

  onFormChanges(form: FormGroup): void {
    const isFirstInit = !this.modifyForm;
    this.modifyForm = form;

    if (this.mode === DialogMode.Create && this.data.tariffOffer && isFirstInit) {
      if (!this.modifyForm.contains('tariffOfferId')) {
        this.modifyForm.addControl('tariffOfferId', new FormControl(this.data.tariffOffer.id));
      }
    }

    if (isFirstInit) {
      this.setupViewModel();
    }
  }

  private setupViewModel(): void {
    this.viewModel = this.presenter.createViewModel(
      this.modifyForm,
      this.data,
      this.uiConfig
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.modifyForm?.valid) {
      PriceFormValidators.markFormGroupTouched(this.modifyForm);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.saveStrategy(this.modifyForm, this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.loading.set(false);

          // Close dialog with result (even if empty/null - backend may return 200 with no body)
          // The parent component will refresh the table regardless
          this.dialogRef.close(result || {});
        },
        error: (error) => {
          this.loading.set(false);
          this.error.set(this.getErrorMessage(error));
        }
      });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
