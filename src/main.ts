/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { initializeMockMode } from './app/shared/utils/mock-init';

// Initialize mock mode before bootstrapping
initializeMockMode();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
