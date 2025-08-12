import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveTariffOffer, Currency } from '../../../models';
import { ProductsDataService } from '../../../../../shared';

export interface ModifyPriceDialogData {
  tariffOffer: ActiveTariffOffer;
}

export interface ModifyPriceResult {
  price: number;
  currency: Currency;
}

@Component({
  selector: 'app-modify-price-dialog',
  standalone: true,
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
  styleUrls: ['./modify-price-dialog.component.scss']
})
export class ModifyPriceDialogComponent implements OnInit {
  modifyForm: FormGroup;
  currencyOptions$: Observable<Array<{ value: string; label: string }>>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModifyPriceDialogData,
    public dialogRef: MatDialogRef<ModifyPriceDialogComponent>,
    private fb: FormBuilder,
    private productsDataService: ProductsDataService
  ) {
    this.modifyForm = this.createForm();
    this.loadCurrencyOptions();
  }

  ngOnInit(): void {
    if (this.data.tariffOffer) {
      this.modifyForm.patchValue({
        price: this.data.tariffOffer.price,
        currency: this.data.tariffOffer.currency
      });
    }
  }

  private loadCurrencyOptions(): void {
    this.currencyOptions$ = this.productsDataService.getCurrencies().pipe(
      map((currencies: string[]) => currencies.map((currency: string) => ({
        value: currency,
        label: currency
      })))
    );
  }

  private createForm(): FormGroup {
    return this.fb.group({
      price: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.modifyForm.valid || !this.data.tariffOffer) {
      return;
    }

    const formValue = this.modifyForm.value;

    // Create result object with new price and currency
    const result: ModifyPriceResult = {
      price: formValue.price,
      currency: formValue.currency as Currency
    };

    this.dialogRef.close(result);
  }

  get isFormValid(): boolean {
    return this.modifyForm.valid;
  }
}
