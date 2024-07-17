import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss']
})
export class EditCustomerComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditCustomerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      customerCommand: this.fb.group({
        id: [data?.customerCommand?.id || null],
        name: [data?.customerCommand?.name || '', Validators.required],
        description: [data?.customerCommand?.description || ''],
        externalId: [data?.customerCommand?.externalId || ''],
        tags: [data?.customerCommand?.tags || ''],
        type: [data?.customerCommand?.type || '', Validators.required]
      }),
      subscriberCommand: this.fb.group({
        serviceProviderId: [data?.subscriberCommand?.serviceProviderId || '', Validators.required],
        simId: [data?.subscriberCommand?.simId || ''],
        externalId: [data?.subscriberCommand?.externalId || '']
      })
    });
  }

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
