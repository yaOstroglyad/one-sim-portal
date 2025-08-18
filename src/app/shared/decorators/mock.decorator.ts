import 'reflect-metadata';

export interface MockedServiceOptions {
  endpoints?: string[];
}

export interface MockedEndpointOptions {
  path?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

// Service-level decorator
export function MockedService(options: MockedServiceOptions = {}) {
  return function (target: any) {
    Reflect.defineMetadata('isMocked', true, target);
    Reflect.defineMetadata('mockedEndpoints', options.endpoints || [], target);
    
    // Register service in mock registry during development
    if (typeof window !== 'undefined' && (window as any).__MOCK_MODE__) {
      registerMockedService(target.name, options);
    }
  };
}

// Method-level decorator
export function MockedEndpoint(options: MockedEndpointOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingEndpoints = Reflect.getMetadata('mockedMethods', target.constructor) || [];
    existingEndpoints.push({
      method: propertyKey,
      ...options
    });
    Reflect.defineMetadata('mockedMethods', existingEndpoints, target.constructor);
    
    // Register endpoint in mock registry during development
    if (typeof window !== 'undefined' && (window as any).__MOCK_MODE__) {
      registerMockedEndpoint(target.constructor.name, propertyKey, options);
    }
  };
}

// Helper functions for registry management
function registerMockedService(serviceName: string, options: MockedServiceOptions) {
  const registry = (window as any).__MOCK_REGISTRY__ || { services: {}, endpoints: [] };
  registry.services[serviceName] = options;
  (window as any).__MOCK_REGISTRY__ = registry;
}

function registerMockedEndpoint(serviceName: string, methodName: string, options: MockedEndpointOptions) {
  const registry = (window as any).__MOCK_REGISTRY__ || { services: {}, endpoints: [] };
  registry.endpoints.push({
    service: serviceName,
    method: methodName,
    ...options
  });
  (window as any).__MOCK_REGISTRY__ = registry;
}

// Export helper to check if service/method is mocked
export function isMocked(target: any, method?: string): boolean {
  if (!target || typeof window === 'undefined' || !(window as any).__MOCK_MODE__) {
    return false;
  }
  
  const serviceMocked = Reflect.getMetadata('isMocked', target.constructor || target);
  if (!serviceMocked) return false;
  
  if (!method) return true;
  
  const mockedEndpoints = Reflect.getMetadata('mockedEndpoints', target.constructor || target) || [];
  const mockedMethods = Reflect.getMetadata('mockedMethods', target.constructor || target) || [];
  
  return mockedEndpoints.includes(method) || 
         mockedMethods.some((m: any) => m.method === method);
}