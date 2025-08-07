import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

import { ActiveTariffOffer, Currency } from '../../../models';
import { TariffOfferService } from '../../../../../shared/services/tariff-offer.service';

export interface ModifyTariffOfferDialogData {
  tariffOffer: ActiveTariffOffer;
}

@Component({
  selector: 'app-modify-tariff-offer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modify-tariff-offer-dialog.component.html',
  styleUrls: ['./modify-tariff-offer-dialog.component.scss']
})
export class ModifyTariffOfferDialogComponent implements OnInit {
  modifyForm: FormGroup;
  loading = false;
  error: string | null = null;
  
  currencyOptions = [
    { value: 'usd', label: 'USD' },
    { value: 'eur', label: 'EUR' },
    { value: 'gbp', label: 'GBP' },
    { value: 'jpy', label: 'JPY' }
  ];
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModifyTariffOfferDialogData,
    public dialogRef: MatDialogRef<ModifyTariffOfferDialogComponent>,
    private fb: FormBuilder,
    private tariffOfferService: TariffOfferService
  ) {
    this.modifyForm = this.createForm();
  }
  
  ngOnInit(): void {
    if (this.data.tariffOffer) {
      this.modifyForm.patchValue({
        price: this.data.tariffOffer.price,
        currency: this.data.tariffOffer.currency
      });
    }
  }
  
  private createForm(): FormGroup {
    return this.fb.group({
      price: [0, [Validators.required, Validators.min(0.01)]],
      currency: ['usd', [Validators.required]]
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  onSave(): void {
    if (!this.modifyForm.valid || !this.data.tariffOffer) {
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    const formValue = this.modifyForm.value;
    
    // Create new tariff offer request with updated price/currency but without ID
    const createRequest = {
      productId: this.data.tariffOffer.productId,
      providerProductId: this.data.tariffOffer.serviceProvider.id,
      price: formValue.price,
      currency: formValue.currency as Currency
    };
    
    this.tariffOfferService.createTariffOffer(createRequest).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Create updated ActiveTariffOffer object
        const updatedOffer: ActiveTariffOffer = {
          ...this.data.tariffOffer,
          id: response.id, // New ID from backend
          price: formValue.price,
          currency: formValue.currency,
          validFrom: new Date().toISOString()
        };
        
        this.dialogRef.close(updatedOffer);
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error creating modified tariff offer:', error);
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
  
  get isFormValid(): boolean {
    return this.modifyForm.valid;
  }
}