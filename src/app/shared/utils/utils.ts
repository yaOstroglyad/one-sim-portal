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
