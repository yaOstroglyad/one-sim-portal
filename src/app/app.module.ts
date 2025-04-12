import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { IconSetService } from '@coreui/icons-angular';
import { PagesModule } from './views/pages/pages.module';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AuthService, CustomHttpInterceptor } from './shared';
import { GlobalErrorHandlerService } from './shared/auth/error-handler.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function combinedInitializer(translate: TranslateService, authService: AuthService) {
  return async (): Promise<any> => {
    try {
      await firstValueFrom(translate.use('en'));
      await firstValueFrom(authService.loadPermissions());
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    PagesModule,
    AppRoutingModule,
    NgxWebstorageModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: combinedInitializer,
      deps: [TranslateService, AuthService],
      multi: true
    },
    IconSetService,
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
