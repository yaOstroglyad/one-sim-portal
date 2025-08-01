import { QuickAction } from '../../models';

const ALL_QUICK_ACTIONS: QuickAction[] = [
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

const NON_ADMIN_ALLOWED_ROUTES = ['regions', 'bundles', 'company-products'];

/**
 * Returns quick actions based on user role
 * @param isAdmin - Whether the user has admin permissions
 * @returns Array of QuickAction objects filtered by role
 */
export function getQuickActions(isAdmin: boolean): QuickAction[] {
  if (isAdmin) {
    return ALL_QUICK_ACTIONS;
  }
  
  return ALL_QUICK_ACTIONS.filter(action => 
    NON_ADMIN_ALLOWED_ROUTES.includes(action.route)
  );
}

// Keep backward compatibility
export const QUICK_ACTIONS = ALL_QUICK_ACTIONS;

/**
 * Determines if a quick action is enabled based on its route and user role
 * Currently implemented: regions, bundles, provider-products, products, company-products, tariff-offers
 * @param action - The QuickAction to check
 * @param isAdmin - Whether the user has admin permissions
 */
export function isActionEnabled(action: QuickAction, isAdmin: boolean = true): boolean {
  const implementedRoutes = ['regions', 'bundles', 'provider-products', 'products', 'company-products', 'tariff-offers'];
  const isImplemented = implementedRoutes.includes(action.route);
  
  if (!isImplemented) {
    return false;
  }
  
  // If user is admin, all implemented actions are enabled
  if (isAdmin) {
    return true;
  }
  
  // Non-admin users can only access specific routes
  return NON_ADMIN_ALLOWED_ROUTES.includes(action.route);
}