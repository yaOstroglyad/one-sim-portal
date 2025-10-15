import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnChanges, SimpleChanges, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ButtonDirective } from '@coreui/angular';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ActiveTariffOffer } from '../../../models';
import { ModifyPriceDialogComponent, ModifyPriceDialogData, ModifyPriceResult } from '../modify-price-dialog';
import { UserRoleService } from '../../../../../shared';
import { UIConfigFactory, TariffOfferDetailsConfig } from '../factories';
import {
  SelectedTariffOfferDetailsViewModel,
  SelectedTariffOfferDetailsData,
  PriceModificationResult
} from './models';
import { SelectedTariffOfferDetailsPresenter } from './services';

@Component({
  standalone: true,
    selector: 'app-selected-tariff-offer-details',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatIconModule,
        ButtonDirective
    ],
    providers: [SelectedTariffOfferDetailsPresenter],
    templateUrl: './selected-tariff-offer-details.component.html',
    styleUrls: ['./selected-tariff-offer-details.component.scss']
})
export class SelectedTariffOfferDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tariffOffer: ActiveTariffOffer | null = null;
  @Input() showTitle: boolean = true;
  @Input() showEditButton: boolean = false;
  @Input() infoMessage: string = 'This price will be used as the base price for this company product.';

  @Output() editRequested = new EventEmitter<ActiveTariffOffer>();
  @Output() tariffOfferUpdated = new EventEmitter<ActiveTariffOffer>();

  // View model stream from presenter
  readonly viewModel$: Observable<SelectedTariffOfferDetailsViewModel>;

  // UI configuration
  uiConfig: TariffOfferDetailsConfig;

  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  // Injected services
  private readonly presenter = inject(SelectedTariffOfferDetailsPresenter);
  private readonly dialog = inject(MatDialog);
  private readonly uiConfigFactory = inject(UIConfigFactory);
  private readonly userRoleService = inject(UserRoleService);

  constructor() {
    // Initialize UI configuration based on user role
    const userRole = this.userRoleService.getCurrentUserRole();
    this.uiConfig = this.uiConfigFactory.createTariffOfferDetailsConfig(userRole);

    // Initialize view model stream
    this.viewModel$ = this.presenter.viewModel$;
  }

  ngOnInit(): void {
    this.updatePresenterData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update presenter when any input changes
    if (changes['tariffOffer'] || changes['showTitle'] || changes['showEditButton'] || changes['infoMessage']) {
      this.updatePresenterData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update presenter with current component data
   */
  private updatePresenterData(): void {
    const data: SelectedTariffOfferDetailsData = {
      tariffOffer: this.tariffOffer,
      showTitle: this.showTitle,
      showEditButton: this.showEditButton,
      infoMessage: this.infoMessage
    };

    this.presenter.updateData(data);
  }

  /**
   * Handle edit button click
   */
  onEditClick(): void {
    // Get dialog configuration from presenter
    const dialogConfig = this.presenter.createDialogConfiguration();

    if (!dialogConfig) {
      return;
    }

    // Emit edit requested event
    this.editRequested.emit(dialogConfig.tariffOffer);

    // Create tariff offer for dialog with base price info
    const tariffOfferForDialog = {
      ...dialogConfig.tariffOffer,
      basePrice: dialogConfig.basePrice,
      baseCurrency: dialogConfig.baseCurrency
    };

    // Open dialog
    const dialogRef = this.dialog.open(ModifyPriceDialogComponent, {
      width: '500px',
      data: {
        tariffOffer: tariffOfferForDialog
      } as ModifyPriceDialogData
    });

    // Handle dialog result
    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ModifyPriceResult) => {
        if (result) {
          this.handlePriceModification({
            price: result.price,
            currency: result.currency
          });
        }
      });
  }

  /**
   * Handle price modification from dialog
   */
  private handlePriceModification(modification: PriceModificationResult): void {
    const updatedTariffOffer = this.presenter.handlePriceModification(modification);

    if (updatedTariffOffer) {
      // Update local input for immediate UI response
      this.tariffOffer = updatedTariffOffer;

      // Emit the updated tariff offer
      this.tariffOfferUpdated.emit(updatedTariffOffer);
    }
  }

}
