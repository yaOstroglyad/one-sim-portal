import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { IconModule } from '@coreui/icons-angular';


@NgModule({
  declarations: [
    Page404Component,
    Page500Component
  ],
  imports: [
    CommonModule,
    IconModule
  ]
})
export class PagesModule {
}
