import { Package } from '../../shared/model/package';
import { UsageInfo } from '../../shared';
import UnitTypeDataEnum = UsageInfo.UnitTypeDataEnum;
import UsageTypeEnum = UsageInfo.UsageTypeEnum;
import UnitTypeAmountEnum = UsageInfo.UnitTypeAmountEnum;
export const packagesMock: Package[] = [{
	id: '1',
	name: 'VIP',
	providerName:  'Venta',
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
},{
	id: '2',
	name: 'Easy day',
	providerName:  'Venta',
	usages: [{
		unitType: UnitTypeDataEnum.Gb,
		type: UsageTypeEnum.data,
		total: 100,
		used: 30.2,
		remaining: 69.8
	}],
	effectiveDate: '10/10/2024',
	price: '50$'
}];
