import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { StatusEnum } from '@shared/models/product';
import { ProductsDataService } from '@shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-change-status-dialog',
    imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    TranslateModule
],
    templateUrl: './change-status-dialog.component.html',
    styleUrls: ['./change-status-dialog.component.scss']
})
export class ChangeStatusDialogComponent implements OnInit {
  statusForm: FormGroup;
  statuses: string[] = [];
  validStatuses = Object.values(StatusEnum);

  constructor(
    public dialogRef: MatDialogRef<ChangeStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentStatus: string },
    private fb: FormBuilder,
    private productsDataService: ProductsDataService
  ) {
    this.statusForm = this.fb.group({
      status: [data.currentStatus, Validators.required]
    });
  }

  ngOnInit(): void {
    this.productsDataService.getStatuses().subscribe((statuses: string[]) => {
      this.statuses = statuses.filter(status => this.validStatuses.includes(status as StatusEnum));
    });
  }

  onSave(): void {
    if (this.statusForm.valid) {
      this.dialogRef.close(this.statusForm.value.status);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
