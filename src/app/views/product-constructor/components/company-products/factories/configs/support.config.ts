import { UIConfig, TextConfig, VisibilityConfig, StylingConfig } from '../ui-config.interfaces';

export class SupportUIConfig implements UIConfig {
  texts: TextConfig = {
    dialogTitle: 'Adjust Product Price',
    sectionTitle: 'Product Price Information',
    buttonTexts: {
      edit: 'Adjust Price',
      update: 'Update Price',
      save: 'Apply Changes'
    },
    labels: {
      currentPrice: 'Current Price',
      newPrice: 'New Price',
      originalPrice: 'Original Price',
      serviceProvider: 'Service Provider',
      basePrice: 'Base Price',
      customerPrice: 'Customer Price'
    },
    infoMessages: {
      dialogInfo: 'This will adjust the product pricing as support user.',
      componentInfo: {
        editing: 'Current pricing information for this product.',
        creating: 'Set initial pricing for this product.'
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
    priceHighlight: 'var(--os-color-info)',
    cardVariant: 'full',
    showAddButton: false
  };
}
