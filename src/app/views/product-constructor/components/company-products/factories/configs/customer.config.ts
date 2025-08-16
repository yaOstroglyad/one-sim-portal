import { UIConfig, TextConfig, VisibilityConfig, StylingConfig } from '../ui-config.interfaces';

export class CustomerUIConfig implements UIConfig {
  texts: TextConfig = {
    dialogTitle: 'Update Product Price',
    sectionTitle: 'Product Price Details',
    buttonTexts: {
      edit: 'Update Price',
      update: 'Update Price',
      save: 'Save Changes'
    },
    labels: {
      currentPrice: 'Current Customer Price',
      newPrice: 'New Price',
      originalPrice: 'Original Price',
      serviceProvider: 'Provider',
      basePrice: 'Purchase Price',
      customerPrice: 'Customer Price'
    },
    infoMessages: {
      dialogInfo: 'This will update the price your customers pay for this product.',
      componentInfo: {
        editing: 'This is the price your customers will pay for this product.',
        creating: 'Set the price your customers will pay for this product.'
      }
    }
  };

  visibility: VisibilityConfig = {
    showTariffOfferCard: false,
    showServiceProvider: false,
    showValidFrom: false,
    showPurchasePrice: false,
    showPriceComparison: true,
    showFullDetails: false
  };

  styling: StylingConfig = {
    priceHighlight: 'var(--os-color-primary)',
    cardVariant: 'simplified',
    showAddButton: false
  };
}