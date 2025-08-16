import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ActiveTariffOffer } from '../../../../models';
import { ProductsDataService } from '../../../../../../shared/services/products-data.service';
import { 
  SelectedTariffOfferDetailsData,
  SelectedTariffOfferDetailsViewModel,
  OriginalPriceState,
  PendingPriceState,
  PriceModificationResult,
  DialogConfiguration
} from '../models/selected-tariff-offer-details.model';
import { StateManagementUtils } from '../utils/state-management.utils';
import { PriceDisplayUtils, CurrencyAwarePriceComparison } from '../utils/price-display.utils';

/**
 * Presenter service for selected tariff offer details component
 * Handles all business logic and state management
 */
@Injectable()
export class SelectedTariffOfferDetailsPresenter {
  private readonly productsDataService = inject(ProductsDataService);

  // Internal state streams
  private readonly dataSubject = new BehaviorSubject<SelectedTariffOfferDetailsData>({
    tariffOffer: null,
    showTitle: true,
    showEditButton: false,
    infoMessage: 'This price will be used as the base price for this company product.'
  });

  private readonly originalStateSubject = new BehaviorSubject<OriginalPriceState>({
    originalPrice: 0,
    originalCurrency: '',
    isInitialized: false
  });

  private readonly pendingStateSubject = new BehaviorSubject<PendingPriceState>(
    StateManagementUtils.createInitialPendingState()
  );

  // Public streams
  readonly data$ = this.dataSubject.asObservable();
  readonly originalState$ = this.originalStateSubject.asObservable();
  readonly pendingState$ = this.pendingStateSubject.asObservable();

  /**
   * Main view model stream
   */
  readonly viewModel$: Observable<SelectedTariffOfferDetailsViewModel> = combineLatest([
    this.data$,
    this.originalState$,
    this.pendingState$
  ]).pipe(
    distinctUntilChanged((a, b) => this.isViewModelEqual(a, b)),
    switchMap(([data, originalState, pendingState]) => 
      this.createViewModel(data, originalState, pendingState)
    )
  );

  /**
   * Update component data
   */
  updateData(data: Partial<SelectedTariffOfferDetailsData>): void {
    const currentData = this.dataSubject.value;
    const newData = { ...currentData, ...data };
    
    // Check if tariff offer has changed
    if (data.tariffOffer !== undefined && 
        StateManagementUtils.hasTariffOfferChanged(currentData.tariffOffer, data.tariffOffer)) {
      // Reset original state for new tariff offer
      this.resetOriginalState(data.tariffOffer);
      // Clear pending changes
      this.clearPendingChanges();
    } else if (data.tariffOffer !== undefined && data.tariffOffer === currentData.tariffOffer) {
      // Same tariff offer, just update price comparison
      this.updatePriceComparison();
    }
    
    this.dataSubject.next(newData);
  }

  /**
   * Update tariff offer only (for price changes)
   */
  updateTariffOffer(tariffOffer: ActiveTariffOffer | null): void {
    const currentData = this.dataSubject.value;
    const originalState = this.originalStateSubject.value;
    
    // Determine if we should reset original state
    if (StateManagementUtils.shouldResetOriginalState(
      originalState, 
      currentData.tariffOffer, 
      tariffOffer
    )) {
      this.resetOriginalState(tariffOffer);
      this.clearPendingChanges();
    }
    
    this.dataSubject.next({ ...currentData, tariffOffer });
  }

  /**
   * Handle price modification result from dialog
   */
  handlePriceModification(modification: PriceModificationResult): ActiveTariffOffer | null {
    const currentData = this.dataSubject.value;
    
    if (!currentData.tariffOffer) {
      return null;
    }

    // Update pending state
    const newPendingState = StateManagementUtils.updatePendingState(
      this.pendingStateSubject.value,
      currentData.tariffOffer,
      modification
    );
    this.pendingStateSubject.next(newPendingState);

    // Create updated tariff offer
    const updatedTariffOffer = StateManagementUtils.createUpdatedTariffOffer(
      currentData.tariffOffer,
      modification
    );

    // Update data with new tariff offer
    this.dataSubject.next({ ...currentData, tariffOffer: updatedTariffOffer });

    return updatedTariffOffer;
  }

  /**
   * Clear pending changes (called after save)
   */
  clearPendingChanges(): void {
    const clearedState = StateManagementUtils.clearPendingState();
    this.pendingStateSubject.next(clearedState);
  }

  /**
   * Create dialog configuration for price modification
   */
  createDialogConfiguration(): DialogConfiguration | null {
    const data = this.dataSubject.value;
    const originalState = this.originalStateSubject.value;
    
    if (!data.tariffOffer) {
      return null;
    }

    return StateManagementUtils.createDialogConfiguration(data.tariffOffer, originalState);
  }


  /**
   * Private methods
   */

  private resetOriginalState(tariffOffer: ActiveTariffOffer | null): void {
    const newOriginalState = StateManagementUtils.initializeOriginalPriceState(tariffOffer);
    this.originalStateSubject.next(newOriginalState);
  }

  private updatePriceComparison(): void {
    // Trigger recalculation by emitting the same values
    // The switchMap in viewModel$ will handle the recalculation
    const currentData = this.dataSubject.value;
    this.dataSubject.next({ ...currentData });
  }

  private createViewModel(
    data: SelectedTariffOfferDetailsData,
    originalState: OriginalPriceState,
    pendingState: PendingPriceState
  ): Observable<SelectedTariffOfferDetailsViewModel> {
    
    if (!data.tariffOffer) {
      return of(this.createEmptyViewModel(data, originalState, pendingState));
    }

    // Create price display data
    const priceData = PriceDisplayUtils.extractPriceDisplayData(
      data.tariffOffer,
      pendingState.pendingPrice,
      pendingState.pendingCurrency
    );

    // Get currency-aware price comparison
    return PriceDisplayUtils.createCurrencyAwarePriceComparison(
      priceData,
      this.productsDataService,
      'USD'
    ).pipe(
      map(priceComparison => ({
        // Display data
        tariffOffer: data.tariffOffer,
        priceComparison,
        
        // State flags
        showTitle: data.showTitle,
        showEditButton: data.showEditButton,
        infoMessage: data.infoMessage,
        
        // States
        pendingState,
        originalState,
        
        // UI helpers
        canEdit: StateManagementUtils.canEdit(data.tariffOffer, data.showEditButton),
        hasValidTariffOffer: StateManagementUtils.hasValidTariffOffer(data.tariffOffer)
      }))
    );
  }

  private createEmptyViewModel(
    data: SelectedTariffOfferDetailsData,
    originalState: OriginalPriceState,
    pendingState: PendingPriceState
  ): SelectedTariffOfferDetailsViewModel {
    return {
      tariffOffer: null,
      priceComparison: {
        hasModifiedPrice: false,
        difference: null,
        formattedOriginalPrice: '',
        formattedCurrentPrice: '',
        markupDisplay: null,
        showPendingChange: false
      },
      showTitle: data.showTitle,
      showEditButton: data.showEditButton,
      infoMessage: data.infoMessage,
      pendingState,
      originalState,
      canEdit: false,
      hasValidTariffOffer: false
    };
  }

  private isViewModelEqual(
    a: [SelectedTariffOfferDetailsData, OriginalPriceState, PendingPriceState],
    b: [SelectedTariffOfferDetailsData, OriginalPriceState, PendingPriceState]
  ): boolean {
    // Simple deep comparison for the key fields that affect view model
    return JSON.stringify(a) === JSON.stringify(b);
  }
}