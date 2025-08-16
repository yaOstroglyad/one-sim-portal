import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductsDataService, UserRoleService } from '../../../../../shared';
import { UIConfigFactory, ModifyPriceDialogConfig } from '../factories';
import { 
  ModifyPriceDialogData, 
  ModifyPriceDialogViewModel 
} from './models/modify-price-dialog.model';
import { FormUtils, CurrencyOption } from './utils/form.utils';
import { ModifyPriceDialogPresenter } from './services/modify-price-dialog.presenter';

@Component({
  selector: 'app-modify-price-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './modify-price-dialog.component.html',
  styleUrls: ['./modify-price-dialog.component.scss'],
  providers: [ModifyPriceDialogPresenter]
})
export class ModifyPriceDialogComponent implements OnInit, OnDestroy {
  modifyForm: FormGroup;
  currencyOptions$: Observable<CurrencyOption[]>;
  viewModel$: Observable<ModifyPriceDialogViewModel>;
  uiConfig: ModifyPriceDialogConfig;

  private readonly destroy$ = new Subject<void>();
  private readonly uiConfigFactory = inject(UIConfigFactory);
  private readonly userRoleService = inject(UserRoleService);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModifyPriceDialogData,
    public dialogRef: MatDialogRef<ModifyPriceDialogComponent>,
    private readonly fb: FormBuilder,
    private readonly productsDataService: ProductsDataService,
    private readonly presenter: ModifyPriceDialogPresenter
  ) {
    this.initializeComponent();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupViewModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.createForm();
    this.loadCurrencyOptions();
    this.initializeUIConfig();
  }

  private createForm(): void {
    this.modifyForm = FormUtils.createModifyPriceForm(this.fb);
  }

  private loadCurrencyOptions(): void {
    this.currencyOptions$ = FormUtils.loadCurrencyOptions(this.productsDataService);
  }

  private initializeUIConfig(): void {
    const userRole = this.userRoleService.getCurrentUserRole();
    this.uiConfig = this.uiConfigFactory.createModifyPriceDialogConfig(userRole);
  }

  private initializeForm(): void {
    if (this.data.tariffOffer) {
      FormUtils.initializeFormWithTariffOffer(this.modifyForm, this.data.tariffOffer);
    }
  }

  private setupViewModel(): void {
    this.viewModel$ = this.presenter.createViewModel(
      this.modifyForm, 
      this.data, 
      this.uiConfig
    ).pipe(
      takeUntil(this.destroy$)
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const result = this.presenter.extractResult(this.modifyForm);
    
    if (result) {
      this.dialogRef.close(result);
    }
  }

  get isFormValid(): boolean {
    return this.modifyForm.valid;
  }
}
