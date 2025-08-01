import { QuickAction } from '../../models';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Manage Regions',
    description: 'Create and manage geographical regions',
    route: 'regions',
    icon: 'cil-location-pin',
    color: 'primary'
  },
  {
    title: 'Mobile Bundles',
    description: 'Define data packages and usage units',
    route: 'bundles',
    icon: 'cil-data-transfer-down',
    color: 'info'
  },
  {
    title: 'Provider Products',
    description: 'Link providers to coverage areas',
    route: 'provider-products',
    icon: 'cil-apps-settings',
    color: 'warning'
  },
  {
    title: 'Products',
    description: 'Create core product templates',
    route: 'products',
    icon: 'cil3d',
    color: 'success'
  },
  {
    title: 'Company Products',
    description: 'Customer-facing products with pricing',
    route: 'company-products',
    icon: 'cil-industry',
    color: 'secondary'
  },
  {
    title: 'Tariff Offers',
    description: 'Create sellable product combinations',
    route: 'tariff-offers',
    icon: 'cil-dollar',
    color: 'medium'
  }
];

/**
 * Determines if a quick action is enabled based on its route
 * Currently implemented: regions, bundles, provider-products, products, company-products, tariff-offers
 */
export function isActionEnabled(action: QuickAction): boolean {
  return action.route === 'regions' || action.route === 'bundles' || action.route === 'provider-products' || action.route === 'products' || action.route === 'company-products' || action.route === 'tariff-offers';
}