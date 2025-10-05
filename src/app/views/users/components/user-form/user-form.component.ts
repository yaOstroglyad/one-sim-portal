import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { FormGeneratorComponent, FormConfig, SelectOption } from '../../../../shared';
import { User, CreateUserRequest, UpdateUserRequest } from '../../models';
import { UserService } from '../../services';
import { CompaniesDataService } from '../../../../shared';
import { getUserFormConfig } from './user-form.utils';

@Component({
    selector: 'app-user-form',
    imports: [
        CommonModule,
        FormGeneratorComponent
    ],
    templateUrl: './user-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private companiesDataService = inject(CompaniesDataService);

  @Input() user: User | null = null;
  @Output() save = new EventEmitter<any>();
  @Output() formChange = new EventEmitter<FormGroup>();

  formConfig: FormConfig;
  userForm: FormGroup;
  loading = false;

  private unsubscribe$ = new Subject<void>();

  get isEditMode(): boolean {
    return !!this.user?.id;
  }

  ngOnInit(): void {
    // Prepare company options
    const companyOptions = this.companiesDataService.list().pipe(
      map((companies: any[]) =>
        companies.map(company => ({
          value: company.accountId,
          displayValue: company.name
        } as SelectOption))
      )
    );

    // Prepare email async validator
    const emailAsyncValidator = (control: any): Observable<{ [key: string]: boolean } | null> => {
      if (!control.value || (this.isEditMode && control.value === this.user?.email)) {
        return new Observable(subscriber => subscriber.next(null));
      }

      return this.userService.verifyEmail(control.value).pipe(
        map((response: { isExist: boolean }) => {
          return response.isExist ? { emailExists: true } : null;
        })
      );
    };

    this.formConfig = getUserFormConfig(
      this.user,
      this.isEditMode,
      companyOptions,
      emailAsyncValidator
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onFormChanges(form: FormGroup): void {
    this.userForm = form;
    this.formChange.emit(form);
  }

  onSubmit(): void {
    if (!this.userForm || this.userForm.invalid || this.loading) return;

    this.loading = true;
    const formData = this.userForm.getRawValue();

    const request = this.isEditMode
      ? {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        } as UpdateUserRequest
      : {
          name: formData.name,
          loginName: formData.loginName,
          email: formData.email,
          phone: formData.phone,
          accountId: formData.accountId
        } as CreateUserRequest;

    const operation = this.isEditMode
      ? this.userService.updateUser(this.user!.id!, request as UpdateUserRequest)
      : this.userService.createUser(request as CreateUserRequest);

    operation.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (result) => {
        this.loading = false;
        this.save.emit(result);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving user:', error);
      }
    });
  }
}
