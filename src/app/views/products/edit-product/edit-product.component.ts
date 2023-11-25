import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UsageInfo } from '../../../shared/model/usageInfo';
import UnitTypeDataEnum = UsageInfo.UnitTypeDataEnum;
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import UnitTypeAmountEnum = UsageInfo.UnitTypeAmountEnum;

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent {
  @Input() data: any;
  @Input() visible: boolean;
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFormChange: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup = new FormGroup({
    id: new FormControl(null),
    name: new FormControl(null),
    providerName: new FormControl(null),
    usages: new FormControl(null),
    effectiveDate: new FormControl(null),
    price: new FormControl(null),
    currency: new FormControl(null)
  });

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

  constructor() {}
  close () {
    this.onClose.emit(false);
  }
  submit() {
    console.log('form', this.form.value);
    this.close();
  }

  setDate(event) {
    console.log('event', event);
  }
}
