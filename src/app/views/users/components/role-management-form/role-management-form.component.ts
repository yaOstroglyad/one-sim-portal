import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

import { FormGeneratorComponent, FormConfig } from '@shared';
import { getRoleManagementFormConfig } from './role-management-form.utils';

export interface RoleOption {
  id: string;
  name: string;
  displayName?: string;
}

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
    if (changes['availableRoles'] || changes['selectedRoleIds'] || changes['mode']) {
      this.updateFormConfig();
    }
  }

  private updateFormConfig(): void {
    this.formConfig = getRoleManagementFormConfig(
      this.availableRoles,
      this.mode,
      this.selectedRoleIds
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

    if (form && form.get('roleIds')) {
      const selectedIds = form.get('roleIds')?.value || [];
      this.selectionChange.emit(selectedIds);
    }
  }

  getSelectedRoleIds(): string[] {
    return this.roleForm?.get('roleIds')?.value || [];
  }

  hasSelectedRoles(): boolean {
    const selectedIds = this.getSelectedRoleIds();
    return selectedIds && selectedIds.length > 0;
  }
}
