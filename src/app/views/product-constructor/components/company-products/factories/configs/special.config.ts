import { UIConfig, TextConfig, VisibilityConfig, StylingConfig } from '../ui-config.interfaces';

export class SpecialUIConfig implements UIConfig {
  texts: TextConfig = {
    dialogTitle: 'Modify Product Price',
    sectionTitle: 'Product Price Management',
    buttonTexts: {
      edit: 'Modify Price',
      update: 'Update Price',
      save: 'Save Changes'
    },
    labels: {
      currentPrice: 'Current Price',
      newPrice: 'New Price Settings',
      originalPrice: 'Original Price',
      serviceProvider: 'Service Provider',
      basePrice: 'Base Price',
      customerPrice: 'Customer Price'
    },
    infoMessages: {
      dialogInfo: 'This will modify the product price for the company.',
      componentInfo: {
        editing: 'Current product pricing configuration.',
        creating: 'Configure pricing for this product.'
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
    priceHighlight: 'var(--os-color-warning)',
    cardVariant: 'full',
    showAddButton: true
  };
}
