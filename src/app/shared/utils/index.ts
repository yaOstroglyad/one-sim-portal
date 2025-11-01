/**
 * Shared utilities barrel export
 *
 * Import utilities from specific folders for better tree-shaking:
 * - import { shadeColor, CHART_COLORS } from '@shared/utils/color'
 * - import { deepSearch } from '@shared/utils/data'
 * - import { handleArrayError } from '@shared/utils/http'
 *
 * Or use this barrel export for convenience:
 * - import { shadeColor, deepSearch, handleArrayError } from '@shared/utils'
 */

// Color utilities
export * from './color';

// Data utilities
export * from './data';

// Currency utilities
export * from './currency';

// HTTP utilities
export * from './http';

// Testing utilities (development/test only)
export * from './testing';
