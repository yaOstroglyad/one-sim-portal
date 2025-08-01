# Product Constructor - High Level Design

## Overview
The Product Constructor is a comprehensive system for managing eSIM products through a hierarchical structure of regions, bundles, provider products, core products, and company-specific products.

## System Architecture

### Domain Model

```
Countries ← Regions ← Provider Products ← Products ← Company Products
             ↑              ↑             ↑
         Mobile Bundles → Tariff Offers ---┘
```

### Core Entities

#### 1. Region Management
- **Purpose**: Group countries into logical regions for service coverage
- **Entities**: 
  - Region (id, name, countries[])
  - Country (id, name, isoAlphaCode2, isoAlphaCode3, dialingCode)

#### 2. Mobile Bundle
- **Purpose**: Define data/voice/SMS usage packages
- **Structure**: 
  - Bundle (id, name, usageUnits[])
  - UsageUnit (value, type: "data", unitType: "Byte")

#### 3. Provider Product
- **Purpose**: Link service providers to coverage areas with provider-specific configurations
- **Features**:
  - Service provider mapping
  - Coverage area (country/region)
  - Provider-specific metadata
  - Active/inactive status

#### 4. Core Product
- **Purpose**: Define base product templates with bundles and validity
- **Components**:
  - Product definition (name, description)
  - Bundle association
  - Service coverage
  - Validity period
  - Active/inactive status

#### 5. Company Product
- **Purpose**: Customer-facing products with pricing and company-specific customizations
- **Features**:
  - Company-specific product instances
  - Pricing in various currencies
  - Custom descriptions
  - Validity period overrides

#### 6. Tariff Offers
- **Purpose**: Link products to provider products with pricing
- **Function**: Create sellable combinations of products and provider services

## API Endpoints Structure

### Region Controller (`/api/v1/esim-product/regions`)

#### GET `/api/v1/esim-product/regions`
**Response**: List of regions
```json
[
  {
    "id": 1073741824,
    "name": "string"
  }
]
```

#### GET `/api/v1/esim-product/regions/{id}`
**Parameters**: 
- `id` (integer, path) - Region ID
**Response**: Region with countries
```json
{
  "id": 1073741824,
  "name": "string",
  "countries": [
    {
      "id": 1073741824,
      "name": "string",
      "isoAlphaCode2": "string",
      "isoAlphaCode3": "string",
      "dialingCode": "string"
    }
  ]
}
```

#### POST `/api/v1/esim-product/regions`
**Request Body**:
```json
{
  "name": "string",
  "countryIds": [1073741824]
}
```

#### PUT `/api/v1/esim-product/regions/{id}`
**Parameters**: 
- `id` (integer, path) - Region ID
**Request Body**:
```json
{
  "name": "string",
  "countryIds": [1073741824]
}
```

### Provider Product Controller (`/api/v1/esim-product/provider-products`)

#### GET `/api/v1/esim-product/provider-products`
**Query Parameters**:
- `searchParams` (object):
  ```json
  {
    "countryId": 1073741824,
    "regionId": 1073741824,
    "providerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- `page` (object):
  ```json
  {
    "page": 1073741824,
    "size": 1073741824,
    "sort": ["string"]
  }
  ```

**Response**: Paginated provider products
```json
{
  "totalElements": 9007199254740991,
  "totalPages": 1073741824,
  "size": 1073741824,
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "serviceProvider": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "string"
      },
      "serviceCoverage": {
        "id": 1073741824,
        "name": "string",
        "type": "COUNTRY"
      },
      "commonProviderData": {
        "empty": true,
        "additionalProp1": "string",
        "additionalProp2": "string",
        "additionalProp3": "string"
      },
      "productProviderData": {
        "additionalProp1": {
          "empty": true,
          "additionalProp1": "string",
          "additionalProp2": "string",
          "additionalProp3": "string"
        }
      },
      "active": true
    }
  ],
  "number": 1073741824,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1073741824,
  "pageable": {
    "offset": 9007199254740991,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1073741824,
    "pageSize": 1073741824,
    "unpaged": true
  },
  "first": true,
  "last": true,
  "empty": true
}
```

#### POST `/api/v1/esim-product/provider-products`
**Request Body**:
```json
{
  "providerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "serviceCoverage": {
    "id": 1073741824,
    "name": "string",
    "type": "COUNTRY"
  },
  "commonProviderData": {
    "empty": true,
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "productProviderData": {
    "additionalProp1": {
      "empty": true,
      "additionalProp1": "string",
      "additionalProp2": "string",
      "additionalProp3": "string"
    }
  }
}
```

#### PUT `/api/v1/esim-product/provider-products/{id}`
**Parameters**: 
- `id` (string UUID, path) - Provider Product ID
**Request Body**:
```json
{
  "commonProviderData": {
    "empty": true,
    "additionalProp1": "string",
    "additionalProp2": "string",
    "additionalProp3": "string"
  },
  "productProviderData": {
    "additionalProp1": {
      "empty": true,
      "additionalProp1": "string",
      "additionalProp2": "string",
      "additionalProp3": "string"
    }
  }
}
```

#### PUT `/api/v1/esim-product/provider-products/{id}/status`
**Parameters**: 
- `id` (string UUID, path) - Provider Product ID
**Request Body**:
```json
{
  "isActive": true
}
```

### Product Controller (`/api/v1/esim-product/products`)

#### GET `/api/v1/esim-product/products`
**Query Parameters**:
- `searchParams` (object):
  ```json
  {
    "countryId": 1073741824,
    "regionId": 1073741824,
    "mobileBundleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- `page` (object):
  ```json
  {
    "page": 1073741824,
    "size": 1073741824,
    "sort": ["string"]
  }
  ```

**Response**: Paginated products
```json
{
  "totalElements": 9007199254740991,
  "totalPages": 1073741824,
  "size": 1073741824,
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "string",
      "bundle": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "string",
        "usageUnits": [
          {
            "value": 0.1,
            "type": "data",
            "unitType": "Byte"
          }
        ]
      },
      "serviceCoverage": {
        "id": 1073741824,
        "name": "string",
        "type": "COUNTRY"
      },
      "validityPeriod": {
        "period": 1073741824,
        "timeUnit": "days"
      },
      "active": true
    }
  ],
  "number": 1073741824,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1073741824,
  "pageable": {
    "offset": 9007199254740991,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1073741824,
    "pageSize": 1073741824,
    "unpaged": true
  },
  "first": true,
  "last": true,
  "empty": true
}
```

#### POST `/api/v1/esim-product/products`
**Request Body**:
```json
{
  "name": "string",
  "bundleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "serviceCoverage": {
    "id": 1073741824,
    "name": "string",
    "type": "COUNTRY"
  },
  "validityPeriod": {
    "period": 1073741824,
    "timeUnit": "days"
  }
}
```

#### PUT `/api/v1/esim-product/products/{id}`
**Parameters**: 
- `id` (string UUID, path) - Product ID
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "validityPeriod": {
    "period": 1073741824,
    "timeUnit": "days"
  }
}
```

#### PUT `/api/v1/esim-product/products/{id}/status`
**Parameters**: 
- `id` (string UUID, path) - Product ID
**Request Body**:
```json
{
  "isActive": true
}
```

### Company Product Controller (`/api/v1/esim-product/company-products`)

#### GET `/api/v1/esim-product/company-products`
**Query Parameters**:
- `searchParams` (object):
  ```json
  {
    "countryId": 1073741824,
    "regionId": 1073741824,
    "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- `page` (object):
  ```json
  {
    "page": 1073741824,
    "size": 1073741824,
    "sort": ["string"]
  }
  ```

**Response**: Paginated company products
```json
{
  "totalElements": 9007199254740991,
  "totalPages": 1073741824,
  "size": 1073741824,
  "content": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "company": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "string",
        "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      },
      "name": "string",
      "description": "string",
      "serviceCoverage": {
        "id": 1073741824,
        "name": "string",
        "type": "COUNTRY"
      },
      "price": 0.1,
      "currency": "usd",
      "usageUnits": [
        {
          "value": 0.1,
          "type": "data",
          "unitType": "Byte"
        }
      ],
      "validityPeriod": {
        "period": 1073741824,
        "timeUnit": "days"
      },
      "active": true
    }
  ],
  "number": 1073741824,
  "sort": {
    "empty": true,
    "sorted": true,
    "unsorted": true
  },
  "numberOfElements": 1073741824,
  "pageable": {
    "offset": 9007199254740991,
    "sort": {
      "empty": true,
      "sorted": true,
      "unsorted": true
    },
    "paged": true,
    "pageNumber": 1073741824,
    "pageSize": 1073741824,
    "unpaged": true
  },
  "first": true,
  "last": true,
  "empty": true
}
```

#### POST `/api/v1/esim-product/company-products`
**Request Body**:
```json
{
  "companyId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "description": "string"
}
```

#### PUT `/api/v1/esim-product/company-products/{id}`
**Parameters**: 
- `id` (string UUID, path) - Company Product ID
**Request Body**:
```json
{
  "description": "string",
  "validityPeriod": {
    "period": 1073741824,
    "timeUnit": "days"
  }
}
```

#### PUT `/api/v1/esim-product/company-products/{id}/status`
**Parameters**: 
- `id` (string UUID, path) - Company Product ID
**Request Body**:
```json
{
  "isActive": true
}
```

### Mobile Bundle Controller (`/api/v1/esim-product/bundles`)

#### GET `/api/v1/esim-product/bundles`
**Response**: List of bundles
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string",
    "usageUnits": [
      {
        "value": 0.1,
        "type": "data",
        "unitType": "Byte"
      }
    ]
  }
]
```

#### POST `/api/v1/esim-product/bundles`
**Request Body**:
```json
{
  "name": "string",
  "usageUnits": [
    {
      "value": 0.1,
      "type": "data",
      "unitType": "Byte"
    }
  ]
}
```

#### PUT `/api/v1/esim-product/bundles/{id}`
**Parameters**: 
- `id` (string UUID, path) - Bundle ID
**Request Body**:
```json
{
  "name": "string"
}
```

### Tariff Offer Controller (`/api/v1/esim-product/tariff-offers`)

#### POST `/api/v1/esim-product/tariff-offers`
**Request Body**:
```json
{
  "productId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "providerProductId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "price": 0,
  "currency": "usd"
}
```

### Country Controller (`/api/v1/esim-product/countries`)

#### GET `/api/v1/esim-product/countries`
**Response**: List of countries
```json
[
  {
    "id": 1073741824,
    "name": "string",
    "isoAlphaCode2": "string",
    "isoAlphaCode3": "string",
    "dialingCode": "string"
  }
]
```

## Data Flow

### Product Creation Workflow
1. **Setup Phase**:
   - Create/manage countries (read-only reference data)
   - Create regions and assign countries
   - Create mobile bundles with usage units

2. **Provider Integration**:
   - Create provider products for each provider-coverage combination
   - Configure provider-specific data and settings
   - Activate/deactivate provider products

3. **Product Definition**:
   - Create core products linking bundles to coverage areas
   - Set validity periods and descriptions
   - Activate/deactivate products

4. **Pricing & Offers**:
   - Create tariff offers linking products to provider products
   - Set pricing in appropriate currencies

5. **Company Customization**:
   - Create company-specific product instances
   - Customize descriptions and validity periods
   - Set company-specific active status

## User Interface Components

### Navigation Integration
Add to `src/app/containers/default-layout/_nav.ts`:
```typescript
{
  name: 'nav.productConstructor',
  url: 'product-constructor',
  iconComponent: {name: 'cil-layers'},
  permissions: [ADMIN_PERMISSION],
  featureToggle: 'productConstructor'
}
```

### Product Constructor Module Structure
```
src/app/views/product-constructor/
├── components/
│   ├── region-management/
│   │   ├── region-list/
│   │   ├── region-form/
│   │   └── country-selector/
│   ├── bundle-management/
│   │   ├── bundle-list/
│   │   ├── bundle-form/
│   │   └── usage-unit-editor/
│   ├── provider-products/
│   │   ├── provider-product-list/
│   │   ├── provider-product-form/
│   │   └── provider-data-editor/
│   ├── products/
│   │   ├── product-list/
│   │   ├── product-form/
│   │   └── product-wizard/
│   ├── company-products/
│   │   ├── company-product-list/
│   │   ├── company-product-form/
│   │   └── pricing-editor/
│   └── tariff-offers/
│       ├── tariff-offer-list/
│       └── tariff-offer-form/
├── services/
│   ├── region.service.ts
│   ├── bundle.service.ts
│   ├── provider-product.service.ts
│   ├── product.service.ts
│   ├── company-product.service.ts
│   ├── tariff-offer.service.ts
│   └── country.service.ts
├── models/
│   ├── region.model.ts
│   ├── bundle.model.ts
│   ├── provider-product.model.ts
│   ├── product.model.ts
│   ├── company-product.model.ts
│   └── common.model.ts
└── product-constructor-routing.module.ts
```

### Key UI Features

#### 1. Dashboard/Overview
- Summary statistics
- Quick access to all management sections
- Recent activity feed

#### 2. Region Management
- Visual map interface for country selection
- Drag-and-drop region building
- Country search and filtering

#### 3. Bundle Builder
- Visual usage unit editor
- Data unit converters (GB, MB, etc.)
- Template-based bundle creation

#### 4. Product Wizard
- Step-by-step product creation
- Coverage area selection with map
- Bundle association interface
- Validity period selector

#### 5. Provider Integration
- Provider-specific configuration forms
- Dynamic metadata editor
- Bulk operations for multiple products

#### 6. Pricing Management
- Multi-currency support
- Bulk pricing updates
- Pricing history and analytics

## Technical Considerations

### Feature Toggle Integration
- **MANDATORY**: Add Product Constructor to main navigation menu (`src/app/containers/default-layout/_nav.ts`)
- **MANDATORY**: Protect feature with `featureToggle: 'productConstructor'` configuration
- **MANDATORY**: Add toggle configuration to `src/app/shared/services/feature-toggle/feature-toggle.config.ts`
- Feature should be accessible in menu but hidden by default until toggle is enabled
- Follow existing pattern from other toggled features (e.g., dashboard, storybook)

**Feature Toggle Configuration:**
```typescript
// Add to feature-toggle.config.ts
export const FEATURE_TOGGLES = {
  // ... existing toggles
  productConstructor: false, // Default disabled
};
```

### Component Reusability Strategy
- **MANDATORY**: Use existing shared components from `src/app/shared/components/` wherever possible:
  - `GenericTableComponent` - For all data tables and lists
  - `FormGeneratorComponent` - For dynamic form creation
  - `GenericDialogComponent` - For modal dialogs and confirmations
  - `BadgeComponent` - For status indicators and tags
  - `CardComponent` - For content containers
  - `ChartComponent` - For any analytics/reporting needs
- **Component Creation Standards**:
  - If existing components don't meet requirements, create NEW reusable components in `src/app/shared/components/`
  - ALL new components MUST be standalone (Angular 14+ pattern)
  - Follow existing component architecture patterns
  - Use project's global design system (Tailwind-inspired)
  - Apply SCSS architecture rules from `.context/SCSS_ARCHITECTURE.md`
- **Never duplicate functionality** - extend existing components or create abstractions

### Data Models
- Use TypeScript interfaces for strong typing
- Implement proper pagination for large datasets
- Support for complex filtering and searching

### State Management
- Consider NgRx for complex state management
- Implement caching for reference data (countries, providers)
- Optimistic updates for better UX

### UI/UX Patterns
- Use existing generic components (GenericTableComponent, FormGeneratorComponent)
- Implement wizard patterns for complex workflows
- Provide visual feedback for long operations
- Support bulk operations where appropriate

### Validation & Error Handling
- Client-side validation for immediate feedback
- Server-side validation handling
- Meaningful error messages
- Rollback capabilities for failed operations

### Performance
- Lazy loading for large datasets
- Virtual scrolling for long lists
- Debounced search inputs
- Efficient change detection strategies

## Security & Permissions
- Role-based access control
- Different permission levels for different product management stages
- Audit trail for product changes
- Company-scoped data access

## Integration Points
- Existing inventory system
- Order management system
- Provider APIs for real-time data
- Billing system for pricing updates