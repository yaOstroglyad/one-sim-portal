import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { RoleService } from '../../services';
import { Role } from '../../models';
import { FormGeneratorComponent, FormConfig } from '../../../../shared';
import { getRoleFormConfig, getRoleCreateRequest, getRoleUpdateRequest } from './role-form.utils';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    FormGeneratorComponent
  ],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleFormComponent implements OnInit {
  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);

  @Input() role: Role | null = null;
  @Output() save = new EventEmitter<void>();

  formConfig: FormConfig;
  roleForm: FormGroup;
  loading = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.role;
    this.formConfig = getRoleFormConfig(this.role, this.isEditMode, this.roleService);
  }


  onFormChanges(form: FormGroup): void {
    this.roleForm = form;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (!this.roleForm || this.roleForm.invalid || this.loading) return;

    this.loading = true;
    this.cdr.markForCheck();

    const formValue = this.roleForm.getRawValue();

    if (this.isEditMode && this.role) {
      const updateRequest = getRoleUpdateRequest(formValue);

      this.roleService.updateRole(this.role.id, updateRequest).subscribe({
        next: () => {
          this.loading = false;
          this.save.emit();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loading = false;
          this.handleError(error);
          this.cdr.markForCheck();
        }
      });
    } else {
      const createRequest = getRoleCreateRequest(formValue);

      this.roleService.createRole(createRequest).subscribe({
        next: () => {
          this.loading = false;
          this.save.emit();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.loading = false;
          this.handleError(error);
          this.cdr.markForCheck();
        }
      });
    }
  }

  private handleError(error: any): void {
    console.error('Error saving role:', error);
    
    // Handle specific API errors
    if (error.status === 409) {
      // Role name conflict
      const nameControl = this.roleForm.get('name');
      if (nameControl) {
        nameControl.setErrors({ nameConflict: true });
      }
    } else if (error.status === 403) {
      // Protected role error
      console.error('Cannot modify protected role');
    }
  }

  // Error message getters are now handled by form-generator component
}