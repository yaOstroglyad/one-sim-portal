import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { Domain } from '../../../../shared/model/domain';
import { AccountsDataService } from '../../../../shared/services/accounts-data.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-domain-owner',
  templateUrl: './edit-domain-owner.component.html',
  styleUrls: ['./edit-domain-owner.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    TranslateModule
  ]
})
export class EditDomainOwnerComponent implements OnInit {
  form: FormGroup;
  domain: Domain;
  ownerAccounts$: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private accountsDataService: AccountsDataService,
    public dialogRef: MatDialogRef<EditDomainOwnerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Domain
  ) {
    this.domain = data;
  }

  ngOnInit(): void {
    this.initForm();
    this.form.patchValue({
      id: this.domain.id,
      ownerAccountId: this.domain.ownerAccountId
    });
    this.loadOwnerAccounts();
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [null],
      ownerAccountId: [null, [Validators.required]]
    });
  }

  private loadOwnerAccounts(): void {
    this.ownerAccounts$ = this.accountsDataService.ownerAccounts();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 