import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Domain } from '../../../../shared/model/domain';

@Component({
  selector: 'app-edit-domain-name',
  templateUrl: './edit-domain-name.component.html',
  styleUrls: ['./edit-domain-name.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule
  ]
})
export class EditDomainNameComponent implements OnInit {
  form: FormGroup;
  domain: Domain;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditDomainNameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Domain
  ) {
    this.domain = data;
  }

  ngOnInit(): void {
    this.initForm();
    this.form.patchValue({
      id: this.domain.id,
      name: this.domain.name
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: [null],
      name: [null, [Validators.required]]
    });
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