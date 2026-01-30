/**
 * MODULE ALIAS MOCK for 'qrcode' package
 *
 * This is a MODULE ALIAS (build-time replacement), NOT a global mock.
 * Configured in vitest.config.ts via `alias` option.
 *
 * WHY MODULE ALIAS:
 * - qrcode → pngjs → util.inherits (Node.js API)
 * - Package CRASHES ON IMPORT before any runtime code executes
 * - Global mocks (vitest.setup.ts) run AFTER imports, so they can't help
 * - Module alias replaces the import at BUILD TIME
 *
 * ERROR WITHOUT THIS MOCK:
 * TypeError: util.inherits is not a function (in Browser Mode)
 *
 * WHEN TO CREATE MODULE ALIAS MOCKS:
 * - npm package uses Node.js APIs (fs, path, util, crypto, etc.)
 * - Error occurs during module loading, not at runtime
 * - Primarily needed for Browser Mode (jsdom may partially work)
 *
 * @see vitest.config.ts - alias configuration
 * @see vitest.setup.ts - for runtime global mocks (ResizeObserver, etc.)
 */

export const toCanvas = async () => {};
export const toDataURL = async () => 'data:image/png;base64,mock';
export const toString = async () => '<svg>mock</svg>';
export const toFile = async () => {};
export const toFileStream = async () => {};
export const create = () => ({
  modules: { size: 21, data: new Uint8Array(441) },
  version: 1,
  errorCorrectionLevel: 'M',
  maskPattern: 0,
  segments: []
});

export default {
  toCanvas,
  toDataURL,
  toString,
  toFile,
  toFileStream,
  create
};
