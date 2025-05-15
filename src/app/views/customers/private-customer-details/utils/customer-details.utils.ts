import { Balance, Subscriber, TimelineEvent } from '../../../../shared';

export interface FinancialSummary {
	totalSpent: number;
	totalUsedGB: number;
	currency: string;
}

export function getSubscriberByName(subscribers: Subscriber[], name: string): Subscriber | undefined {
	if (!subscribers || !name) {
		return undefined;
	}

	return subscribers.find(subscriber => subscriber.name === name);
}

export function calculateFinancialSummary(purchasedProducts: any[]): FinancialSummary {
	let totalSpent = 0;
	let totalUsedBytes = 0;
	let currency = 'USD';

	for (const product of purchasedProducts) {
		if (product.price?.price) {
			totalSpent += product.price.price;
			currency = product.price.currency || currency;
		}

		if (product.usage?.balance) {
			product.usage.balance.forEach((balance: Balance) => {
				const conversionFactor = balance.unitType === 'Gigabyte' ? 1024 * 1024 * 1024 : 1;
				totalUsedBytes += (balance.used || 0) / conversionFactor;
			});
		}
	}

	const totalUsedGB = Math.round(totalUsedBytes * 100) / 100;
	totalSpent = Math.round(totalSpent * 100) / 100;

	return { totalSpent, totalUsedGB, currency };
}


export function mapTransactionEvents(transactions: any[]): TimelineEvent[] {
	return transactions.map(transaction => ({
		date: new Date(transaction.createdAt),
		description: `Transaction: ${transaction.type} - ${transaction.status} by ${transaction.createdBy || 'Unknown user'}`
	}));
}

export function mapPurchaseEvents(purchasedProducts: any[]): TimelineEvent[] {
	return purchasedProducts.map(product => ({
		date: new Date(product.purchasedAt),
		description: `Product purchased: ${product.productName} for ${product.price.price} ${product.price.currency}`
	}));
}

export function combineAndSortEvents(transactionEvents: TimelineEvent[], purchaseEvents: TimelineEvent[]): TimelineEvent[] {
	return [...transactionEvents, ...purchaseEvents]
		.sort((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, 10);
}
