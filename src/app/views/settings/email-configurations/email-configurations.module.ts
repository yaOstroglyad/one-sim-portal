import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailConfigurationsComponent } from './email-configurations.component';
import { TemplateTypeGridComponent } from './template-type-grid/template-type-grid.component';
import { EditEmailTemplateComponent } from './edit-email-template/edit-email-template.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { GenericTableModule, FormGeneratorModule } from '../../../shared';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    EmailConfigurationsComponent,
    TemplateTypeGridComponent,
    EditEmailTemplateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: EmailConfigurationsComponent }
    ]),
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatSnackBarModule,
    TranslateModule,
    GenericTableModule,
    FormGeneratorModule
  ]
})
export class EmailConfigurationsModule { } 