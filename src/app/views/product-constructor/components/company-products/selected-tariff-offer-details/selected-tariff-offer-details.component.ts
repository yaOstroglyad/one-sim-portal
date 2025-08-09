import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonDirective } from '@coreui/angular';
import { MatDialog } from '@angular/material/dialog';
import { ActiveTariffOffer } from '../../../models';
import { ModifyPriceDialogComponent, ModifyPriceDialogData, ModifyPriceResult } from '../modify-price-dialog/modify-price-dialog.component';

@Component({
  selector: 'app-selected-tariff-offer-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonDirective
  ],
  templateUrl: './selected-tariff-offer-details.component.html',
  styleUrls: ['./selected-tariff-offer-details.component.scss']
})
export class SelectedTariffOfferDetailsComponent implements OnInit, OnChanges {
  @Input() tariffOffer: ActiveTariffOffer | null = null;
  @Input() showTitle: boolean = true;
  @Input() showEditButton: boolean = false;
  @Input() infoMessage: string = 'This price will be used as the base price for this company product.';
  
  @Output() editRequested = new EventEmitter<ActiveTariffOffer>();
  @Output() tariffOfferUpdated = new EventEmitter<ActiveTariffOffer>();
  
  // Store original values to show comparison
  originalPrice: number = 0;
  originalCurrency: string = '';
  
  // Properties instead of getters for better performance
  hasModifiedPrice: boolean = false;
  markupPercentage: number = 0;
  
  constructor(private dialog: MatDialog) {}
  
  ngOnInit(): void {
    this.initializeOriginalValues();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tariffOffer'] && this.tariffOffer) {
      // Only reset original values if this is the first time tariffOffer is set
      // or if the offer has completely changed (different ID)
      if (!this.originalPrice || 
          (changes['tariffOffer'].previousValue?.id !== this.tariffOffer.id)) {
        this.initializeOriginalValues();
      } else {
        // Just update the comparison if it's the same offer but with different price
        this.updatePriceComparison();
      }
    }
  }
  
  private initializeOriginalValues(): void {
    if (this.tariffOffer) {
      this.originalPrice = this.tariffOffer.price;
      this.originalCurrency = this.tariffOffer.currency;
      this.updatePriceComparison();
    }
  }
  
  private updatePriceComparison(): void {
    if (!this.tariffOffer) {
      this.hasModifiedPrice = false;
      this.markupPercentage = 0;
      return;
    }
    
    this.hasModifiedPrice = this.tariffOffer.price !== this.originalPrice || 
                           this.tariffOffer.currency !== this.originalCurrency;
    
    if (this.originalPrice === 0) {
      this.markupPercentage = 0;
    } else {
      this.markupPercentage = ((this.tariffOffer.price - this.originalPrice) / this.originalPrice) * 100;
    }
  }
  
  onEditClick(): void {
    if (this.tariffOffer) {
      const dialogRef = this.dialog.open(ModifyPriceDialogComponent, {
        width: '500px',
        data: { tariffOffer: this.tariffOffer } as ModifyPriceDialogData
      });
      
      dialogRef.afterClosed().subscribe((result: ModifyPriceResult) => {
        if (result) {
          // Store original values if this is the first modification
          if (!this.hasModifiedPrice) {
            this.originalPrice = this.tariffOffer!.price;
            this.originalCurrency = this.tariffOffer!.currency;
          }
          
          // Create updated tariff offer with new price and currency
          const updatedTariffOffer: ActiveTariffOffer = {
            ...this.tariffOffer!,
            price: result.price,
            currency: result.currency
          };
          
          // Update the local tariffOffer for immediate UI update
          this.tariffOffer = updatedTariffOffer;
          
          // Update comparison properties
          this.updatePriceComparison();
          
          this.tariffOfferUpdated.emit(updatedTariffOffer);
        }
      });
    }
  }
}