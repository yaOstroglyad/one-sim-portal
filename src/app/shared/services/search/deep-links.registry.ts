/**
 * Deep Links Registry
 *
 * Static registry of deep link items for in-page navigation.
 * These items allow searching for specific tabs/sections within pages.
 */

import { SearchableItem, SEARCH_ITEM_TYPES } from '../../models/search';
import { ADMIN_PERMISSION } from '../../constants';

/**
 * Deep link items for dashboard tabs
 */
const DASHBOARD_DEEP_LINKS = [
  {
    id: 'dashboard-executive',
    label: 'Executive',
    parentLabel: 'Dashboard',
    url: '/home/analytics/dashboard',
    fragment: 'executive',
    icon: 'cilChartPie',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    searchMeta: {
      keywords: ['overview', 'summary', 'main', 'general'],
      priority: 10,
    },
  },
  {
    id: 'dashboard-subscribers',
    label: 'Subscribers',
    parentLabel: 'Dashboard',
    url: '/home/analytics/dashboard',
    fragment: 'subscribers',
    icon: 'cilPeople',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    searchMeta: {
      keywords: ['users', 'customers', 'accounts'],
      priority: 10,
    },
  },
  {
    id: 'dashboard-traffic',
    label: 'Traffic',
    parentLabel: 'Dashboard',
    url: '/home/analytics/dashboard',
    fragment: 'traffic',
    icon: 'cilSpeedometer',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    searchMeta: {
      keywords: ['usage', 'data', 'bandwidth', 'consumption'],
      priority: 10,
    },
  },
  {
    id: 'dashboard-finance',
    label: 'Finance',
    parentLabel: 'Dashboard',
    url: '/home/analytics/dashboard',
    fragment: 'finance',
    icon: 'cilDollar',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    searchMeta: {
      keywords: ['money', 'revenue', 'financial', 'income', 'payments'],
      priority: 10,
    },
  },
] satisfies SearchableItem[];

/**
 * Deep link items for product constructor sections
 * These appear in global search but not in sidebar navigation
 */
const PRODUCT_CONSTRUCTOR_DEEP_LINKS = [
  {
    id: 'pc-overview',
    label: 'nav.pcOverview',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/overview',
    icon: 'cilLayers',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['overview', 'summary', 'main'],
      priority: 10,
    },
  },
  {
    id: 'pc-regions',
    label: 'nav.pcRegions',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/regions',
    icon: 'cilGlobeAlt',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['regions', 'countries', 'coverage', 'geography'],
      priority: 10,
    },
  },
  {
    id: 'pc-bundles',
    label: 'nav.pcBundles',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/bundles',
    icon: 'cilSim',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['bundles', 'packages', 'mobile', 'data'],
      priority: 10,
    },
  },
  {
    id: 'pc-provider-products',
    label: 'nav.pcProviderProducts',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/provider-products',
    icon: 'cilSpreadsheet',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['provider', 'supplier', 'wholesale'],
      priority: 10,
    },
  },
  {
    id: 'pc-company-products',
    label: 'nav.pcCompanyProducts',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/company-products',
    icon: 'cilIndustry',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['company', 'business', 'corporate'],
      priority: 10,
    },
  },
  {
    id: 'pc-products',
    label: 'nav.pcProducts',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/products',
    icon: 'cil3d',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['products', 'items', 'catalog'],
      priority: 10,
    },
  },
  {
    id: 'pc-tariff-offers',
    label: 'nav.pcTariffOffers',
    parentLabel: 'nav.productconstructor',
    url: '/home/product-constructor/tariff-offers',
    icon: 'cilDollar',
    type: SEARCH_ITEM_TYPES.NAVIGATION,
    permissions: [ADMIN_PERMISSION],
    searchMeta: {
      keywords: ['tariff', 'offers', 'pricing', 'rates'],
      priority: 10,
    },
  },
] satisfies SearchableItem[];

/**
 * All deep link items
 */
export const DEEP_LINK_ITEMS: SearchableItem[] = [
  ...DASHBOARD_DEEP_LINKS,
  ...PRODUCT_CONSTRUCTOR_DEEP_LINKS,
];

/**
 * Get all deep link items
 */
export function getDeepLinkItems(): SearchableItem[] {
  return DEEP_LINK_ITEMS;
}
