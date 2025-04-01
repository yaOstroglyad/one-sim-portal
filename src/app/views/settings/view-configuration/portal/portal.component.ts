import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';
import { ColorPickerComponent } from 'src/app/shared/components/color-picker/color-picker.component';

@Component({
  selector: 'app-portal',
  templateUrl: './portal.component.html',
  styleUrls: ['./portal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    PortalPreviewComponent,
    ColorPickerComponent
  ]
})
export class PortalComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      primaryColor: ['#f89c2e'],
      secondaryColor: ['#fef6f0'],
      logoUrl: ['assets/img/brand/1esim-logo.png']
    });
  }

  save() {
    if (this.form.valid) {
      console.log('Saving portal settings:', this.form.value);
    }
  }
} 