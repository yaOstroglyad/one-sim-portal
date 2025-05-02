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

	// используем только сырые байты из API
	const totalBytes     = balance.total;
	const usedBytes      = balance.used;
	const remainingBytes = totalBytes - usedBytes;

	const newUsage = { ...balance };

	if (totalBytes >= BYTES_IN_GB) {
		newUsage.unitType = "GB";
		// toFixed всегда вернёт строку, но + перед ней приведёт к числу
		newUsage.total     = +((totalBytes     / BYTES_IN_GB).toFixed(3));
		newUsage.used      = +((usedBytes      / BYTES_IN_GB).toFixed(3));
		newUsage.remaining = +((remainingBytes / BYTES_IN_GB).toFixed(3));
	} else if (totalBytes >= BYTES_IN_MB) {
		newUsage.unitType = "MB";
		newUsage.total     = +((totalBytes     / BYTES_IN_MB).toFixed(2));
		newUsage.used      = +((usedBytes      / BYTES_IN_MB).toFixed(2));
		newUsage.remaining = +((remainingBytes / BYTES_IN_MB).toFixed(2));
	}

	return newUsage;
}


