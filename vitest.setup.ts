/**
 * Vitest Setup File - GLOBAL MOCKS (Runtime)
 *
 * This file runs AFTER modules are loaded but BEFORE tests execute.
 * Use for browser APIs that are missing in jsdom environment.
 *
 * WHEN TO ADD MOCKS HERE:
 * - Browser API doesn't exist in jsdom (ReferenceError: X is not defined)
 * - Code fails at RUNTIME, not at import time
 * - Examples: ResizeObserver, IntersectionObserver, matchMedia
 *
 * DO NOT ADD HERE:
 * - npm packages that crash on IMPORT → use module alias in vitest.config.ts
 * - Service mocks → use TestBed providers in *.spec.ts
 *
 * @see vitest.config.ts for module aliases (build-time replacement)
 * @see src/testing/mocks/ for module mock implementations
 */

/**
 * ResizeObserver Mock
 *
 * Required by: SmartFilterHeaderComponent (observes header width changes)
 * Error without mock: ReferenceError: ResizeObserver is not defined
 *
 * This is a GLOBAL MOCK because:
 * - ResizeObserver is a browser API, not an npm package
 * - jsdom doesn't implement ResizeObserver
 * - Code fails at RUNTIME when `new ResizeObserver()` is called
 */
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;
