import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGeneratorModule } from 'src/app/shared';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { getPortalFormConfig, getPortalSettingsRequest } from './portal.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorModule,
    PortalPreviewComponent,
    TranslateModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class PortalComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;
  
  public formConfig = getPortalFormConfig();
  public isFormValid = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // Здесь можно загрузить текущие настройки портала, если они есть
  }

  handleFormChanges(form: any): void {
    this.isFormValid = form.valid;
  }

  save(): void {
    if (this.formGenerator.form.valid) {
      const settings = getPortalSettingsRequest(this.formGenerator.form.value);
      console.log('Saving portal settings:', settings);
      // Здесь будет вызов сервиса для сохранения настроек
      this.snackBar.open('Настройки сохранены успешно', 'Закрыть', {
        duration: 3000
      });
    }
  }
} 