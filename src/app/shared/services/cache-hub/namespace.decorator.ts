// Simple metadata storage without reflect-metadata dependency
const METADATA_STORAGE = new WeakMap<any, Map<string, any>>();

function defineMetadata(key: string, value: any, target: any): void {
  if (!METADATA_STORAGE.has(target)) {
    METADATA_STORAGE.set(target, new Map());
  }
  METADATA_STORAGE.get(target)!.set(key, value);
}

function getMetadata(key: string, target: any): any {
  const targetMetadata = METADATA_STORAGE.get(target);
  return targetMetadata ? targetMetadata.get(key) : undefined;
}

/**
 * Decorator to automatically set cache namespace for service methods
 * 
 * @example
 * @CacheNamespace('products')
 * export class ProductService {
 *   // All cache operations will use 'products' namespace
 * }
 */
export function CacheNamespace(namespace: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    // Store namespace metadata on the constructor
    defineMetadata('cache:namespace', namespace, constructor);
    
    // Return extended constructor that sets namespace on instances
    return class extends constructor {
      public readonly cacheNamespace = namespace;
      
      constructor(...args: any[]) {
        super(...args);
        
        // Ensure namespace is available on instance
        (this as any).__cacheNamespace = namespace;
      }
    };
  };
}

/**
 * Decorator for individual methods to override class namespace
 * 
 * @example
 * @CacheMethod('user-specific')
 * getUserData() {
 *   // This method will use 'user-specific' namespace instead of class namespace
 * }
 */
export function CacheMethod(namespace?: string, options?: {
  ttl?: number;
  skipCache?: boolean;
  key?: string | ((args: any[]) => string);
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    // Store metadata about cache configuration
    const cacheConfig = {
      namespace,
      ttl: options?.ttl,
      skipCache: options?.skipCache || false,
      keyGenerator: options?.key
    };
    
    defineMetadata('cache:method', cacheConfig, target);
    
    // Create wrapper that can be used by CacheHub
    descriptor.value = function (...args: any[]) {
      // The actual caching logic will be handled by CacheHub service
      // This just marks the method as cacheable and stores config
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Decorator to mark properties that should be invalidated when cache changes
 * 
 * @example
 * @InvalidateOn(['products', 'users'])
 * private cachedData: any;
 */
export function InvalidateOn(namespaces: string | string[]) {
  return function (target: any, propertyKey: string) {
    const invalidationConfig = {
      namespaces: Array.isArray(namespaces) ? namespaces : [namespaces]
    };
    
    defineMetadata('cache:invalidate', invalidationConfig, target);
  };
}

/**
 * Utility functions for working with cache decorators
 */
export class CacheDecorators {
  /**
   * Get namespace from class or instance
   */
  static getNamespace(target: any): string | undefined {
    // Try instance property first
    if (target.cacheNamespace) {
      return target.cacheNamespace;
    }
    
    // Try private property
    if (target.__cacheNamespace) {
      return target.__cacheNamespace;
    }
    
    // Try constructor metadata
    const constructor = target.constructor || target;
    return getMetadata('cache:namespace', constructor);
  }

  /**
   * Get cache configuration for a method
   */
  static getMethodConfig(target: any, methodName: string): {
    namespace?: string;
    ttl?: number;
    skipCache?: boolean;
    keyGenerator?: string | ((args: any[]) => string);
  } | undefined {
    return getMetadata('cache:method', target);
  }

  /**
   * Get invalidation configuration for a property
   */
  static getInvalidationConfig(target: any, propertyName: string): {
    namespaces: string[];
  } | undefined {
    return getMetadata('cache:invalidate', target);
  }

  /**
   * Check if a class has cache namespace
   */
  static hasCacheNamespace(target: any): boolean {
    return !!this.getNamespace(target);
  }

  /**
   * Check if a method is marked for caching
   */
  static isCacheableMethod(target: any, methodName: string): boolean {
    return !!this.getMethodConfig(target, methodName);
  }

  /**
   * Generate cache key for method with arguments
   */
  static generateMethodKey(target: any, methodName: string, args: any[]): string {
    const config = this.getMethodConfig(target, methodName);
    
    if (config?.keyGenerator) {
      if (typeof config.keyGenerator === 'string') {
        return config.keyGenerator;
      } else if (typeof config.keyGenerator === 'function') {
        return config.keyGenerator(args);
      }
    }
    
    // Default key generation: method name + serialized args
    const argsKey = args.length > 0 ? btoa(JSON.stringify(args)).slice(0, 20) : '';
    return argsKey ? `${methodName}_${argsKey}` : methodName;
  }

  /**
   * Get effective namespace for a method (method override or class namespace)
   */
  static getEffectiveNamespace(target: any, methodName: string): string {
    const methodConfig = this.getMethodConfig(target, methodName);
    
    // Method namespace overrides class namespace
    if (methodConfig?.namespace) {
      return methodConfig.namespace;
    }
    
    // Fall back to class namespace
    return this.getNamespace(target) || 'default';
  }

  /**
   * Get all methods marked for caching in a class
   */
  static getCacheableMethods(target: any): string[] {
    const methods: string[] = [];
    const prototype = target.prototype || target;
    
    // Get all method names
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
    
    // Filter methods that have cache metadata
    methodNames.forEach(methodName => {
      if (this.isCacheableMethod(prototype, methodName)) {
        methods.push(methodName);
      }
    });
    
    return methods;
  }

  /**
   * Validate cache decorator configuration
   */
  static validateConfig(target: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const namespace = this.getNamespace(target);
    if (!namespace) {
      warnings.push('No cache namespace defined for class');
    }
    
    const cacheableMethods = this.getCacheableMethods(target);
    if (cacheableMethods.length === 0) {
      warnings.push('No cacheable methods found in class');
    }
    
    // Validate method configurations
    cacheableMethods.forEach(methodName => {
      const config = this.getMethodConfig(target.prototype || target, methodName);
      
      if (config?.ttl && config.ttl < 0) {
        errors.push(`Invalid TTL for method ${methodName}: must be positive`);
      }
      
      if (config?.keyGenerator && typeof config.keyGenerator !== 'string' && typeof config.keyGenerator !== 'function') {
        errors.push(`Invalid key generator for method ${methodName}: must be string or function`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Type guard to check if an object has cache namespace
 */
export function hasCacheNamespace(obj: any): obj is { cacheNamespace: string } {
  return CacheDecorators.hasCacheNamespace(obj);
}

/**
 * Utility type for services with cache namespace
 */
export interface CacheableService {
  readonly cacheNamespace: string;
}

/**
 * Default decorator options
 */
export const DEFAULT_CACHE_OPTIONS = {
  ttl: 5 * 60 * 1000, // 5 minutes
  skipCache: false
};