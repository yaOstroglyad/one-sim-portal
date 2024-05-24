import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UsageInfo } from '../../../shared';
import UnitTypeDataEnum = UsageInfo.UnitTypeDataEnum;
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import UnitTypeAmountEnum = UsageInfo.UnitTypeAmountEnum;
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent {
// {
//   "serviceProviderId": "c197691a-80f5-410a-87fa-083c93fe8ccd",
//   "providerData": {
//     "extensionId": 4161,
//     "offerId": 2740
//   },
//   "name": "OnlySim Europe 5Gb",
//   "description": "Real 5Gb for 7 Days in Europe",
//   "price": 15.00,
//   "currency": "usd",
//   "usage": [
//     {
//       "value": 5,
//       "unitType": "Gigabyte"
//     }
//   ],
//   "validity": {
//     "period": 7,
//     "timeUnit": "days"
//   }
// }



  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null),
    providerName: new FormControl(null),
    usages: new FormControl(null),
    effectiveDate: new FormControl(null),
    price: new FormControl(null),
    currency: new FormControl(null)
  });

  currencies = [];
  providers = [];

  usages = [{
    unitType: UnitTypeDataEnum.Gb,
    type: UsageTypeEnum.data,
    total: 1,
    used: 0,
    remaining: 1
  },{
    unitType: UnitTypeAmountEnum.Sms,
    type: UsageTypeEnum.sms,
    total: 100,
    used: 0,
    remaining: 100
  },{
    unitType: UnitTypeAmountEnum.Min,
    type: UsageTypeEnum.voice,
    total: 100,
    used: 0,
    remaining: 100
  }]

  constructor(
    public dialogRef: MatDialogRef<EditProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.initializeFormData(this.data);
    }
  }

  private initializeFormData(data: any): void {
    this.form.patchValue({
      id: data.id || null,
      name: data.name || '',
      providerName: data.providerName || '',
      usages: data.usages || [],
      effectiveDate: data.effectiveDate || '',
      price: data.price || '',
      currency: data.currency || ''
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    // Обработка отправки формы
    console.log('form', this.form.value);
    this.dialogRef.close(this.form.value); // Можно передать данные формы обратно
  }
}
