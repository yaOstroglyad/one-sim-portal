import { UserRole } from '@shared';

export { UserRole };

// Base configuration interfaces
export interface UIConfig {
  texts: TextConfig;
  visibility: VisibilityConfig;
  styling: StylingConfig;
}

export interface TextConfig {
  dialogTitle: string;
  sectionTitle: string;
  buttonTexts: {
    edit: string;
    update: string;
    save: string;
  };
  labels: {
    currentPrice: string;
    newPrice: string;
    originalPrice: string;
    serviceProvider: string;
    basePrice: string;
    customerPrice: string;
  };
  infoMessages: {
    dialogInfo: string;
    componentInfo: {
      editing: string;
      creating: string;
    };
  };
}

export interface VisibilityConfig {
  showTariffOfferCard: boolean;
  showServiceProvider: boolean;
  showValidFrom: boolean;
  showPurchasePrice: boolean;
  showPriceComparison: boolean;
  showFullDetails: boolean;
}

export interface StylingConfig {
  priceHighlight: string;
  cardVariant: 'full' | 'simplified';
  showAddButton: boolean;
}

// Component-specific configurations
export interface ModifyPriceDialogConfig extends UIConfig {
  showCurrentTariffInfo: boolean;
}

export interface TariffOfferDetailsConfig extends UIConfig {
  showProductDetails: boolean;
  showEditButton: boolean;
}

export interface CompanyProductFormConfig extends UIConfig {
  showAccountSelector: boolean;
}

export interface TableConfig extends UIConfig {
  showAddButton: boolean;
  showEditButton: boolean;
  showMenu: boolean;
}