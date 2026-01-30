import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { IconSetService } from '@coreui/icons-angular';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { iconSubset } from '../../../icons/icon-subset';

/**
 * Common providers used across most component tests
 */
export const COMMON_TEST_PROVIDERS = [
  IconSetService
];

/**
 * Common imports used across most component tests
 */
export const COMMON_TEST_IMPORTS = [
  TranslateModule.forRoot(),
  NoopAnimationsModule
];

/**
 * Configures TestBed with common providers and sets up IconSetService.
 * Use this helper to reduce boilerplate in component tests.
 *
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   await configureTestBed({
 *     imports: [MyComponent],
 *     providers: [
 *       { provide: MyService, useValue: mockService }
 *     ]
 *   });
 *
 *   fixture = TestBed.createComponent(MyComponent);
 *   component = fixture.componentInstance;
 *   fixture.detectChanges();
 * });
 * ```
 */
export async function configureTestBed(config: TestModuleMetadata): Promise<void> {
  const imports = [
    ...COMMON_TEST_IMPORTS,
    ...(config.imports || [])
  ];

  const providers = [
    ...COMMON_TEST_PROVIDERS,
    ...(config.providers || [])
  ];

  await TestBed.configureTestingModule({
    ...config,
    imports,
    providers
  }).compileComponents();

  // Setup IconSetService with icons
  const iconSetService = TestBed.inject(IconSetService);
  iconSetService.icons = { ...iconSubset };
}

/**
 * Creates a minimal test module configuration for simple components
 * that only need the component itself with common test infrastructure.
 *
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   await configureTestBed(simpleComponentConfig(MyComponent));
 *   fixture = TestBed.createComponent(MyComponent);
 * });
 * ```
 */
export function simpleComponentConfig(component: any): TestModuleMetadata {
  return {
    imports: [component]
  };
}
