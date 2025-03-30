import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PortalPreviewComponent } from './portal-preview/portal-preview.component';

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
    PortalPreviewComponent
  ]
})
export class PortalComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      primaryColor: ['#f89c2e'],
      secondaryColor: ['#fef6f0'],
      logoUrl: ['assets/img/brand/1esim-logo.png']
    });
  }

  ngOnInit() {
    // Инициализация если нужна
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Создаем URL для превью
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.patchValue({
          logoUrl: e.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  }

  getFileName(): string {
    const url = this.form.get('logoUrl')?.value;
    if (url === 'assets/img/brand/1esim-logo.png') {
      return 'No file chosen';
    }
    return url.split('/').pop() || 'Selected file';
  }

  save() {
    if (this.form.valid) {
      console.log('Saving portal settings:', this.form.value);
    }
  }
} 