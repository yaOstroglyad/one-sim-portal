import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  SmartFilterValueMapper,
  SmartFilterServices,
  FunctionValueMapper,
  StaticValueMapper,
  ObservableValueMapper,
  VALUE_MAPPER_TYPES
} from '../models/smart-filter.interface';

// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache storage
interface ValueMapperCache {
  [key: string]: CacheEntry;
}

@Injectable({
  providedIn: 'root'
})
export class SmartFilterValueMapperService {
  private cache: ValueMapperCache = {};

  /**
   * Maps a filter value to its display representation
   */
  async mapValue(
    value: any,
    mapper: SmartFilterValueMapper,
    services?: SmartFilterServices,
    cacheTTL: number = 300000
  ): Promise<string> {
    if (!mapper) {
      return this.formatFallbackValue(value);
    }

    try {
      switch (mapper.type) {
        case VALUE_MAPPER_TYPES.FUNCTION:
          return await this.mapWithFunction(mapper, value, services);
        case VALUE_MAPPER_TYPES.STATIC:
          return this.mapWithStatic(mapper, value);
        case VALUE_MAPPER_TYPES.OBSERVABLE:
          return await this.mapWithObservable(mapper, value, services, cacheTTL);
        default:
          console.warn(`Unknown mapper type: ${(mapper as any).type}`);
          return this.formatFallbackValue(value);
      }
    } catch (error) {
      console.warn('Error in value mapping:', error);
      return this.formatFallbackValue(value);
    }
  }

  /**
   * Clears all cached data
   */
  clearCache(): void {
    this.cache = {};
  }

  /**
   * Clears expired cache entries
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      const entry = this.cache[key];
      if (now - entry.timestamp > entry.ttl) {
        delete this.cache[key];
      }
    });
  }

  private async mapWithFunction(
    mapper: FunctionValueMapper,
    value: any,
    services?: SmartFilterServices
  ): Promise<string> {
    const result = await mapper.mapper(value, services);
    return result || this.formatFallbackValue(value);
  }

  private mapWithStatic(
    mapper: StaticValueMapper,
    value: any
  ): string {
    const mappedValue = mapper.mappings[value];
    if (mappedValue !== undefined) {
      return mappedValue;
    }
    
    return mapper.fallback || this.formatFallbackValue(value);
  }

  private async mapWithObservable(
    mapper: ObservableValueMapper,
    value: any,
    services?: SmartFilterServices,
    cacheTTL: number = 300000
  ): Promise<string> {
    // Check cache first
    const cacheKey = mapper.cacheKey || `${mapper.serviceKey}-${mapper.methodName}`;
    const cachedData = this.getCachedData(cacheKey);
    
    let data: any[];
    
    if (cachedData) {
      data = cachedData;
    } else {
      // Fetch fresh data
      const service = services?.[mapper.serviceKey];
      if (!service) {
        throw new Error(`Service "${mapper.serviceKey}" not found`);
      }

      if (typeof service[mapper.methodName] !== 'function') {
        throw new Error(`Method "${mapper.methodName}" not found on service "${mapper.serviceKey}"`);
      }

      data = await firstValueFrom(service[mapper.methodName]());
      
      if (!Array.isArray(data)) {
        throw new Error(`Expected array from ${mapper.serviceKey}.${mapper.methodName}(), got ${typeof data}`);
      }

      // Cache the result
      this.setCachedData(cacheKey, data, cacheTTL);
    }

    // Find and extract the display value
    return this.extractDisplayValue(data, value, mapper);
  }

  private extractDisplayValue(
    data: any[],
    value: any,
    mapper: ObservableValueMapper
  ): string {
    const keyField = mapper.keyField || 'id';
    const normalizedValue = this.normalizeValue(value);

    const item = data.find(item => {
      const itemValue = this.normalizeValue(item[keyField]);
      return itemValue === normalizedValue;
    });

    if (item && item[mapper.valueField] !== undefined) {
      return String(item[mapper.valueField]);
    }

    return this.formatFallbackValue(value);
  }

  private normalizeValue(value: any): any {
    // Handle string numbers
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return parseInt(value, 10);
    }
    return value;
  }

  private getCachedData(key: string): any[] | null {
    const entry = this.cache[key];
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      delete this.cache[key];
      return null;
    }

    return entry.data;
  }

  private setCachedData(key: string, data: any[], ttl: number): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };
  }

  private formatFallbackValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object' && value.label) {
      return value.label; // Handle searchable-select format
    }
    
    return String(value);
  }
}