import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FormGeneratorComponent, FormConfig, RoleOption } from '@shared';
import { getRoleManagementFormConfig } from './role-management-form.utils';

@Component({
  standalone: true,
    selector: 'app-role-management-form',
    imports: [
        CommonModule,
        FormGeneratorComponent
    ],
    template: `
    <app-form-generator
      [config]="formConfig"
      (formChanges)="onFormChanges($event)">
    </app-form-generator>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleManagementFormComponent implements OnInit, OnDestroy, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() availableRoles: RoleOption[] = [];
  @Input() selectedRoleIds: string[] = [];
  @Input() mode: 'assign' | 'remove' = 'assign';
  @Input() userAccountType?: string;
  @Input() currentUsername?: string | null;
  @Output() formChange = new EventEmitter<FormGroup>();
  @Output() selectionChange = new EventEmitter<string[]>();

  formConfig: FormConfig;
  roleForm: FormGroup;
  loading = false;

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.updateFormConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableRoles'] || changes['selectedRoleIds'] || changes['mode'] || changes['userAccountType'] || changes['currentUsername']) {
      this.updateFormConfig();
    }
  }

  private updateFormConfig(): void {
    this.formConfig = getRoleManagementFormConfig(
      this.availableRoles,
      this.mode,
      this.selectedRoleIds,
      this.userAccountType,
      this.currentUsername
    );
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFormChanges(form: FormGroup): void {
    this.roleForm = form;
    this.formChange.emit(form);

    // Subscribe to entire form value changes
    if (form) {
      // Emit initial value
      const initialValue = form.get('roleIds')?.value || [];
      this.selectionChange.emit(Array.isArray(initialValue) ? initialValue : []);

      // Subscribe to form value changes
      // Use setTimeout to ensure form control value is updated before reading
      form.valueChanges.pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        setTimeout(() => {
          const selectedIds = form.get('roleIds')?.value || [];
          const idsArray = Array.isArray(selectedIds) ? selectedIds : [];
          this.selectionChange.emit(idsArray);
          this.cdr.markForCheck();
        }, 0);
      });
    }

    // Trigger change detection for parent component with OnPush strategy
    this.cdr.markForCheck();
  }

  getSelectedRoleIds(): string[] {
    return this.roleForm?.get('roleIds')?.value || [];
  }

  hasSelectedRoles(): boolean {
    const selectedIds = this.getSelectedRoleIds();
    return selectedIds && selectedIds.length > 0;
  }
}
