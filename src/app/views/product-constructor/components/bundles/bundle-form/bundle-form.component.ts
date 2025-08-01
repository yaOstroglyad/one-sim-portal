import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormGeneratorComponent, FormConfig } from '../../../../../shared';

import { BundleService } from '../../../services';
import { MobileBundle } from '../../../models';
import { getBundleFormConfig, getBundleCreateRequest, getBundleUpdateRequest } from './bundle-form.utils';

@Component({
  selector: 'app-bundle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormGeneratorComponent
  ],
  template: `
    <div class="bundle-form-container">
      <!-- Error Display -->
      <div *ngIf="error" class="error-alert">
        <i class="icon cil-warning"></i>
        <span>{{ error }}</span>
      </div>

      <!-- Form Content -->
      <app-form-generator 
        [config]="formConfig" 
        (formChanges)="onFormChanges($event)">
      </app-form-generator>
    </div>
  `,
  styleUrls: ['./bundle-form.component.scss']
})
export class BundleFormComponent implements OnInit {

  @Input() bundle: MobileBundle | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  bundleForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private bundleService: BundleService) {}

  ngOnInit(): void {
    this.formConfig = getBundleFormConfig(this.bundle);
  }

  get isEditing(): boolean {
    return !!this.bundle;
  }

  onFormChanges(form: FormGroup): void {
    this.bundleForm = form;
  }

  onSubmit(): void {
    if (!this.bundleForm?.valid) return;

    this.loading = true;
    this.error = null;

    const formValue = this.bundleForm.value;
    
    const operation$ = this.isEditing
      ? this.bundleService.updateBundle(this.bundle!.id, getBundleUpdateRequest(formValue))
      : this.bundleService.createBundle(getBundleCreateRequest(formValue));

    operation$.subscribe({
      next: () => {
        this.loading = false;
        this.save.emit();
      },
      error: (error) => {
        this.loading = false;
        this.error = this.getErrorMessage(error);
        console.error('Error saving bundle:', error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}