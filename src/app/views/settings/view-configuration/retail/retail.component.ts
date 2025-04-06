import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGeneratorModule } from 'src/app/shared';
import { RetailPreviewComponent } from './retail-preview/retail-preview.component';
import { FormGeneratorComponent } from 'src/app/shared/components/form-generator/form-generator.component';
import { getRetailFormConfig, getRetailSettingsRequest } from './retail.utils';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-retail',
  templateUrl: './retail.component.html',
  styleUrls: ['./retail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormGeneratorModule,
    RetailPreviewComponent,
    TranslateModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class RetailComponent implements OnInit {
  @ViewChild(FormGeneratorComponent) formGenerator!: FormGeneratorComponent;
  
  public formConfig = getRetailFormConfig();
  public isFormValid = false;
  public dir: 'ltr' | 'rtl' = 'ltr';

  constructor(private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    // Здесь можно загрузить текущие настройки retail, если они есть
  }

  handleFormChanges(form: any): void {
    this.isFormValid = form.valid;
  }

  save(): void {
    if (this.formGenerator.form.valid) {
      const settings = getRetailSettingsRequest(this.formGenerator.form.value);
      console.log('Saving retail settings:', settings);
      // Здесь будет вызов сервиса для сохранения настроек
      this.snackBar.open('Настройки сохранены успешно', 'Закрыть', {
        duration: 3000
      });
    }
  }
} 