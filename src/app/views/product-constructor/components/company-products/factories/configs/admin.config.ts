import { UIConfig, TextConfig, VisibilityConfig, StylingConfig } from '../ui-config.interfaces';

export class AdminUIConfig implements UIConfig {
  texts: TextConfig = {
    dialogTitle: 'Modify Price',
    sectionTitle: 'Selected Tariff Offer Details',
    buttonTexts: {
      edit: 'Modify Price',
      update: 'Update Price',
      save: 'Save Changes'
    },
    labels: {
      currentPrice: 'Current Price',
      newPrice: 'New Price Settings',
      originalPrice: 'Base Price',
      serviceProvider: 'Service Provider',
      basePrice: 'Base Price',
      customerPrice: 'Customer Price'
    },
    infoMessages: {
      dialogInfo: 'This will set a custom price for the selected company.',
      componentInfo: {
        editing: 'This shows the current pricing that will be updated for this company product.',
        creating: 'This price will be used as the base price for this company product.'
      }
    }
  };

  visibility: VisibilityConfig = {
    showTariffOfferCard: true,
    showServiceProvider: true,
    showValidFrom: true,
    showPurchasePrice: false,
    showPriceComparison: true,
    showFullDetails: true
  };

  styling: StylingConfig = {
    priceHighlight: 'var(--os-color-success)',
    cardVariant: 'full',
    showAddButton: true
  };
}
