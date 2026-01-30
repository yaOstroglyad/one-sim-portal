import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Vitest Configuration - MODULE ALIASES (Build Time)
 *
 * Loaded by Angular CLI via `runnerConfig` option in angular.json.
 *
 * PURPOSE:
 * Replace npm packages that crash on import (use Node.js APIs)
 * with browser-compatible mocks at BUILD TIME.
 *
 * WHY THIS FILE EXISTS:
 * - Angular CLI's @angular/build:unit-test doesn't support alias directly
 * - `runnerConfig` option allows custom Vitest configuration
 * - This is the OFFICIAL way to customize Vitest in Angular projects
 *
 * WHEN TO ADD ALIASES:
 * - npm package crashes on import with Node.js API errors
 * - Error like: "util.inherits is not a function"
 * - Primarily needed for Browser Mode testing
 *
 * @see vitest.setup.ts for runtime global mocks (ResizeObserver, etc.)
 * @see src/testing/mocks/ for mock implementations
 */
export default defineConfig({
  test: {
    // Setup files run before each test file
    setupFiles: ['./vitest.setup.ts'],

    // Module resolution aliases
    alias: {
      // Mock qrcode for browser mode (uses Node.js APIs that don't work in browser)
      'qrcode': path.resolve(__dirname, 'src/testing/mocks/qrcode.mock.ts')
    }
  }
});
