import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductsDataService } from '../products-data.service';
import { StatusEnum } from '../../../shared/model/package';

@Component({
  selector: 'app-change-status-dialog',
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
