import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';
import { IconDirective } from '@coreui/icons-angular';

import { FormGeneratorComponent, FormConfig } from '../../../../../shared';
import { TariffOffer } from '../../../models';
import { TariffOfferService } from '../../../../../shared/services/tariff-offer.service';
import { ProductService } from '../../../services/product.service';
import { ProviderProductService } from '../../../services/provider-product.service';
import { 
  getTariffOfferFormConfig,
  getTariffOfferCreateRequest,
  getTariffOfferUpdateRequest,
  getCurrencySymbol
} from './tariff-offer-form.utils';

@Component({
  selector: 'app-tariff-offer-form',
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorComponent,
    IconDirective
  ],
  templateUrl: './tariff-offer-form.component.html',
  styleUrls: ['./tariff-offer-form.component.scss']
})
export class TariffOfferFormComponent implements OnInit, OnChanges {
  @Input() tariffOffer: TariffOffer | null = null;
  @Input() hideActions = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  formConfig: FormConfig;
  tariffOfferForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private tariffOfferService: TariffOfferService,
    private productService: ProductService,
    private providerProductService: ProviderProductService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tariffOffer']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.formConfig = getTariffOfferFormConfig(
      this.tariffOffer,
      this.isEditing,
      this.productService,
      this.providerProductService
    );
  }

  get isEditing(): boolean {
    return !!this.tariffOffer;
  }

  onFormChanges(form: FormGroup): void {
    this.tariffOfferForm = form;
  }

  onSubmit(): void {
    if (!this.tariffOfferForm?.valid || this.loading) return;

    this.loading = true;
    this.error = null;

    const formValue = this.tariffOfferForm.value;
    
    const operation$ = this.isEditing
      ? this.tariffOfferService.updateTariffOffer(
          this.tariffOffer!.id, 
          getTariffOfferUpdateRequest(formValue)
        )
      : this.tariffOfferService.createTariffOffer(
          getTariffOfferCreateRequest(formValue)
        );

    operation$.pipe(take(1)).subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error saving tariff offer:', error);
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
    const action = this.isEditing ? 'update' : 'create';
    return `Failed to ${action} tariff offer. Please try again.`;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  getCurrencySymbol(): string {
    const currency = this.tariffOfferForm?.get('currency')?.value;
    return getCurrencySymbol(currency);
  }

}