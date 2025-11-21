import { CompanyProductPrice } from '../../../../models';

/**
 * Utility functions for price validation and date handling
 */
export class PriceValidationUtils {
  /**
   * Check if price date is in the future (not today, not past)
   * Used to determine if a price can be edited
   * @param validFrom - ISO date string "2025-11-20"
   * @returns true if date is strictly after today
   */
  static isFuturePrice(validFrom: string): boolean {
    const priceDate = new Date(validFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    priceDate.setHours(0, 0, 0, 0);

    return priceDate > today;
  }

  /**
   * Check if price date is today or in the past
   * @param validFrom - ISO date string "2025-11-20"
   * @returns true if date is today or before today
   */
  static isPastOrTodayPrice(validFrom: string): boolean {
    return !this.isFuturePrice(validFrom);
  }

  /**
   * Get minimum allowed validFrom date based on tariff offer validFrom
   * Logic:
   * - If offer date is in the past or today: use tomorrow
   * - If offer date is in the future: use offer date
   * @param tariffOfferValidFrom - ISO date string from tariff offer
   * @returns ISO date string "2025-11-22" (tomorrow or offer date)
   */
  static getMinValidFromDate(tariffOfferValidFrom: string): string {
    const offerDate = new Date(tariffOfferValidFrom);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    offerDate.setHours(0, 0, 0, 0);

    // If offer date is in the past or today, use tomorrow
    if (offerDate <= today) {
      return tomorrow.toISOString().split('T')[0];
    }

    // If offer date is in the future, use offer date
    return tariffOfferValidFrom;
  }

  /**
   * Check if validFrom date is valid for given tariff offer
   * @param validFrom - Date to validate
   * @param tariffOfferValidFrom - Tariff offer's validFrom date
   * @returns true if validFrom is >= minimum allowed date
   */
  static isValidFromDateValid(
    validFrom: string,
    tariffOfferValidFrom: string
  ): boolean {
    const minDate = this.getMinValidFromDate(tariffOfferValidFrom);
    return validFrom >= minDate;
  }

  /**
   * Check if validFrom date already exists in prices list
   * Used to prevent duplicate validFrom dates
   * @param validFrom - Date to check
   * @param existingPrices - Array of existing prices
   * @param excludePriceId - Optional price ID to exclude from check (for edit mode)
   * @returns true if conflict exists
   */
  static hasValidFromConflict(
    validFrom: string,
    existingPrices: CompanyProductPrice[],
    excludePriceId?: string
  ): boolean {
    return existingPrices.some(price =>
      price.validFrom === validFrom && price.id !== excludePriceId
    );
  }

  /**
   * Format date string for display
   * @param dateString - ISO date string "2025-11-20"
   * @returns Formatted date string based on locale
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  /**
   * Get today's date as ISO string
   * @returns ISO date string "2025-11-20"
   */
  static getTodayISOString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Get tomorrow's date as ISO string
   * @returns ISO date string "2025-11-22" (tomorrow)
   */
  static getTomorrowISOString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  /**
   * Find the current active price from a list of prices
   * Current price is the one with validFrom date that is:
   * - Not in the future (today or past)
   * - Closest to today
   *
   * Example:
   * Prices: [2025-11-22, 2025-11-21, 2025-03-31]
   * Today: 2025-11-21
   * Result: 2025-11-21 (current price)
   *
   * @param prices - Array of company retail prices
   * @returns The current active price or null if no valid price found
   */
  static getCurrentPrice(prices: CompanyProductPrice[]): CompanyProductPrice | null {
    if (!prices || prices.length === 0) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter prices that are today or in the past
    const validPrices = prices.filter(price => {
      const priceDate = new Date(price.validFrom);
      priceDate.setHours(0, 0, 0, 0);
      return priceDate <= today;
    });

    if (validPrices.length === 0) {
      return null;
    }

    // Find the price with the closest validFrom date to today (but not future)
    return validPrices.reduce((closest, current) => {
      const closestDate = new Date(closest.validFrom);
      const currentDate = new Date(current.validFrom);
      closestDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      // Return the one closer to today
      return currentDate > closestDate ? current : closest;
    });
  }

  /**
   * Check if given price is the current active price
   * @param price - Price to check
   * @param allPrices - All prices to compare against
   * @returns true if this is the current active price
   */
  static isCurrentPrice(price: CompanyProductPrice, allPrices: CompanyProductPrice[]): boolean {
    const currentPrice = this.getCurrentPrice(allPrices);
    return currentPrice?.id === price.id;
  }
}
