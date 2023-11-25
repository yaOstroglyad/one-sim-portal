import { Component, OnInit } from '@angular/core';
import { Package } from '../../shared/model/package';
import { UsageInfo } from '../../shared/model/usageInfo';
import UnitTypeDataEnum = UsageInfo.UnitTypeDataEnum;
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import UnitTypeAmountEnum = UsageInfo.UnitTypeAmountEnum;
import { cilPencil } from '@coreui/icons';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  protected readonly cilPencil = cilPencil;

  public visible: boolean;
  public productsData: Package[] = [];
  public selectedData: any;
  ngOnInit(): void {
    this.productsData = [{
      id: '1',
      name: 'VIP',
      providerName:  'Ventra',
      usages: [{
        unitType: UnitTypeDataEnum.Gb,
        type: UsageTypeEnum.data,
        total: 1,
        used: 0.2,
        remaining: 0.8
      },{
        unitType: UnitTypeAmountEnum.Sms,
        type: UsageTypeEnum.sms,
        total: 100,
        used: 2,
        remaining: 98
      },{
        unitType: UnitTypeAmountEnum.Min,
        type: UsageTypeEnum.voice,
        total: 100,
        used: 11,
        remaining: 89
      }],
      effectiveDate: '10/10/2024',
      price: '100$'
    }]
  }

	edit(product: Package) {
      console.log('product', product);
      this.selectedData = product;
      this.setModalVisibility(true);
	}

  setModalVisibility(event: boolean) {
    this.visible = event;
    console.log('this.visible setModalVisibility', this.visible);
  }
}
