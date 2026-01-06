/**
 * Permission Constants
 *
 * Isolated file with no dependencies to prevent circular imports.
 * Import these constants from '@shared/constants' or '@shared'.
 */

export const ADMIN_PERMISSION = 'ADMIN';
export const SPECIAL_PERMISSION = 'SPECIAL';
export const CUSTOMER_PERMISSION = 'CUSTOMER';
export const SUPPORT_PERMISSION = 'SUPPORT';
export const ANALYTICS_PERMISSION = 'ANALYTICS';

/** All available permissions */
export const ALL_PERMISSIONS = [
  ADMIN_PERMISSION,
  SPECIAL_PERMISSION,
  CUSTOMER_PERMISSION,
  SUPPORT_PERMISSION,
  ANALYTICS_PERMISSION,
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];
