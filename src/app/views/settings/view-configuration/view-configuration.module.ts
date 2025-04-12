import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FormGeneratorModule } from 'src/app/shared/components/form-generator/form-generator.module';
import { PortalComponent } from './portal/portal.component';
import { PortalPreviewComponent } from './portal/portal-preview/portal-preview.component';

@NgModule({
  declarations: [
    PortalComponent,
    PortalPreviewComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormGeneratorModule
  ],
  exports: [
    PortalComponent
  ]
})
export class ViewConfigurationModule { } 