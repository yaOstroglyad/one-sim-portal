/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, importProvidersFrom, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { provideNgxWebstorage, withLocalStorage, withSessionStorage } from 'ngx-webstorage';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { AuthService, CustomHttpInterceptor, AuthGuardService } from './app/shared';
import { GlobalErrorHandlerService } from './app/shared/auth/error-handler.service';
import { FeatureToggleService, FEATURE_TOGGLES_SERVICE } from './app/shared';
import { IconSetService } from '@coreui/icons-angular';
import { Title } from '@angular/platform-browser';
import { initializeMockMode } from './app/shared';
import { provideFabLayout, provideFeature, provideFabButton } from './app/shared/components/fab-layout';

// Import routes
import { Page404Component } from './app/views/pages/page404/page404.component';
import { Page500Component } from './app/views/pages/page500/page500.component';
import { Page403Component } from './app/views/pages/page403/page403.component';
import { Routes } from '@angular/router';

// Define routes
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./app/containers/default-layout/default-layout.routes').then((m) => m.DEFAULT_LAYOUT_ROUTES),
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    loadComponent: () => import('./app/views/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./app/views/pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'no-permissions',
    loadComponent: () => import('./app/views/pages/no-permissions/no-permissions.component').then((m) => m.NoPermissionsComponent),
    data: {
      title: 'No Permissions'
    }
  },
  {
    path: '404',
    component: Page404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '403',
    component: Page403Component,
    data: {
      title: 'Page 403'
    }
  },
  {
    path: '500',
    component: Page500Component,
    data: {
      title: 'Page 500'
    }
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '/404' }
];

// Factory functions
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Modern Angular app initializer using provideAppInitializer
export function provideAppInitialization() {
  return provideAppInitializer(() => {
    const translate = inject(TranslateService);
    const authService = inject(AuthService);
    const featureToggleService = inject(FeatureToggleService);

    return (async (): Promise<void> => {
      try {
        // Initialize feature toggles first
        await firstValueFrom(featureToggleService.refresh());
        await firstValueFrom(translate.use('en'));
        await firstValueFrom(authService.loadPermissions());
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    })();
  });
}

// Initialize mock mode before bootstrapping
initializeMockMode();

bootstrapApplication(AppComponent, {
  providers: [
    // Router
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation()),

    // Animations
    provideAnimations(),

    // HTTP
    provideHttpClient(withInterceptorsFromDi()),

    // Import legacy modules
    importProvidersFrom(
      MatSnackBarModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),

    // ngx-webstorage (v21+ uses functional providers)
    provideNgxWebstorage(
      withLocalStorage(),
      withSessionStorage()
    ),

    // Services and providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService
    },
    provideAppInitialization(),
    IconSetService,
    Title,
    FeatureToggleService,
    {
      provide: FEATURE_TOGGLES_SERVICE,
      useExisting: FeatureToggleService
    },
    AuthGuardService,

    // ============================================
    // FAB Layout System (via DI Tokens)
    // ============================================
    provideFabLayout(),

    // Global FAB Button: Support Chat
    // This button is always visible (provided at app level)
    // No roles specified = visible to everyone
    provideFabButton({
      id: 'support-chat',
      label: 'nav.supportchat',
      title: 'flyout.supportchattitle',
      icon: 'chat',
      order: 10,
      hasMenu: false,
      action: 'component',
      target: 'support-chat'
    }),

    // Global Feature: Support Chat
    // This feature is always available (provided at app level)
    // No roles specified = visible to everyone
    // destroyOnClose: true = clear state and reload fresh data on each open
    provideFeature({
      meta: {
        key: 'support-chat',
        title: 'Support Chat',
        icon: '💬',
        order: 10,
        destroyOnClose: true // Always start fresh with clean state
      },
      load: () => import('./app/features/support-chat/support-chat.shell.component')
        .then(m => m.SupportChatShellComponent)
    })
  ]
}).catch(err => console.error(err));
