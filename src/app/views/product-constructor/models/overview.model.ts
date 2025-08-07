/**
 * Overview page models and interfaces
 */

export interface OverviewStats {
  regions: number;
  bundles: number;
  products: number;
  companyProducts: number;
  providerProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

export interface ProductStatisticsResponse {
  productsCount: number;
  mobileBundlesCount: number;
  regionsCount: number;
}

export interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}