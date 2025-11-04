/**
 * Shared utilities barrel export
 *
 * Import utilities from specific folders for better tree-shaking:
 * - import { shadeColor, CHART_COLORS } from '@shared/utils/color'
 * - import { deepSearch } from '@shared/utils/data'
 * - import { handleArrayError } from '@shared/utils/http'
 * - import { printQrCode } from '@shared/utils/dom'
 *
 * Or use this barrel export for convenience:
 * - import { shadeColor, deepSearch, handleArrayError, printQrCode } from '@shared/utils'
 */

// Color utilities
export * from './color';

// Data utilities
export * from './data';

// Currency utilities
export * from './currency';

// DOM utilities
export * from './dom';

// HTTP utilities
export * from './http';

// Testing utilities (development/test only)
export * from './testing';
