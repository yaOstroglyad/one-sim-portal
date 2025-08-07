import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ButtonDirective } from '@coreui/angular';
import { MatDialog } from '@angular/material/dialog';
import { ActiveTariffOffer } from '../../../models';
import { ModifyTariffOfferDialogComponent, ModifyTariffOfferDialogData } from '../modify-tariff-offer-dialog/modify-tariff-offer-dialog.component';

@Component({
  selector: 'app-selected-tariff-offer-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IconDirective,
    ButtonDirective
  ],
  templateUrl: './selected-tariff-offer-details.component.html',
  styleUrls: ['./selected-tariff-offer-details.component.scss']
})
export class SelectedTariffOfferDetailsComponent {
  @Input() tariffOffer: ActiveTariffOffer | null = null;
  @Input() showTitle: boolean = true;
  @Input() showEditButton: boolean = false;
  @Input() infoMessage: string = 'This price will be used as the base price for this company product.';
  
  @Output() editRequested = new EventEmitter<ActiveTariffOffer>();
  @Output() tariffOfferUpdated = new EventEmitter<ActiveTariffOffer>();
  
  constructor(private dialog: MatDialog) {}
  
  onEditClick(): void {
    if (this.tariffOffer) {
      const dialogRef = this.dialog.open(ModifyTariffOfferDialogComponent, {
        width: '500px',
        data: { tariffOffer: this.tariffOffer } as ModifyTariffOfferDialogData
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // result is the updated ActiveTariffOffer
          this.tariffOfferUpdated.emit(result);
        }
      });
    }
  }
}