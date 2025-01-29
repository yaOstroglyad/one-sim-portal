import { Balance, ProductPurchase } from '../model';

export function deepSearch(item: any, filterString: string): boolean {
	if (typeof item === 'string' && item.toLowerCase().includes(filterString)) {
		return true;
	}

	if (Array.isArray(item)) {
		return item.some(element => deepSearch(element, filterString));
	}

	if (typeof item === 'object' && item !== null) {
		return Object.values(item).some(value => deepSearch(value, filterString));
	}

	return false;
}

export function convertUsage(balance: Balance): Balance {
	const BYTES_IN_MB = 1024 * 1024;
	const BYTES_IN_GB = 1024 * 1024 * 1024;

	let newUsage = { ...balance };

	if (balance.total >= BYTES_IN_GB) {
		newUsage.unitType = "GB";
		newUsage.total = Math.round((balance.total / BYTES_IN_GB) * 10) / 10;
		newUsage.used = Math.round((balance.used / BYTES_IN_GB) * 10) / 10;
		newUsage.remaining = Math.round((balance.remaining / BYTES_IN_GB) * 10) / 10;
	} else if (balance.total >= BYTES_IN_MB) {
		newUsage.unitType = "MB";
		newUsage.total = Math.round((balance.total / BYTES_IN_MB) * 10) / 10;
		newUsage.used = Math.round((balance.used / BYTES_IN_MB) * 10) / 10;
		newUsage.remaining = Math.round((balance.remaining / BYTES_IN_MB) * 10) / 10;
	}

	return newUsage;
}
