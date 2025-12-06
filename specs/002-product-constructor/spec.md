# Feature Specification: Product Constructor

**Feature Branch**: `002-product-constructor`
**Created**: 2025-12-03
**Status**: Implemented
**Input**: eSIM product management system with hierarchical structure

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Regions (Priority: P1)

As an admin, I want to create and manage regions grouping countries for service coverage.

**Why this priority**: Foundation for product hierarchy - regions are required for products.

**Independent Test**: Can be tested by creating a region, assigning countries, and verifying in list.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I create a region with name and countries, **Then** the region appears in the list
2. **Given** a region exists, **When** I edit it, **Then** I can add/remove countries
3. **Given** I view regions, **When** I click a region, **Then** I see assigned countries

---

### User Story 2 - Manage Mobile Bundles (Priority: P1)

As an admin, I want to define mobile bundles with data/voice/SMS usage units.

**Why this priority**: Bundles define what products offer - required for product creation.

**Independent Test**: Can be tested by creating a bundle with usage units.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I create a bundle with data units, **Then** the bundle is saved
2. **Given** I am creating a bundle, **When** I add voice/SMS units, **Then** all units are stored
3. **Given** bundles exist, **When** I view the list, **Then** I see all bundles with their units

---

### User Story 3 - Create Core Products (Priority: P1)

As an admin, I want to create core products combining bundles with coverage and validity.

**Why this priority**: Core products are the base for company-specific products.

**Independent Test**: Can be tested by creating a product with bundle, coverage, and validity period.

**Acceptance Scenarios**:

1. **Given** bundles and regions exist, **When** I create a product, **Then** I can select bundle and coverage
2. **Given** I am creating a product, **When** I set validity period, **Then** it's saved correctly
3. **Given** products exist, **When** I filter by region, **Then** I see filtered results

---

### User Story 4 - Manage Provider Products (Priority: P2)

As an admin, I want to link service providers to coverage areas with provider-specific configurations.

**Why this priority**: Important for multi-provider setup but not blocking for single-provider MVP.

**Independent Test**: Can be tested by creating a provider product with metadata.

**Acceptance Scenarios**:

1. **Given** I select a provider, **When** I link it to coverage, **Then** provider product is created
2. **Given** a provider product exists, **When** I set it inactive, **Then** status updates
3. **Given** I view provider products, **When** I filter by provider, **Then** results are filtered

---

### User Story 5 - Manage Company Products with Pricing (Priority: P1)

As an admin, I want to create company-specific product instances with pricing in multiple currencies.

**Why this priority**: Company products are what customers actually purchase.

**Independent Test**: Can be tested by creating a company product with price.

**Acceptance Scenarios**:

1. **Given** a core product exists, **When** I create a company product, **Then** I can set price
2. **Given** I am setting price, **When** I choose currency, **Then** price is saved with currency
3. **Given** a company product exists, **When** I schedule a future price, **Then** it's stored with validFrom

---

### User Story 6 - Price Schedule Management (Priority: P2)

As a business user, I want to schedule future price changes with specific validFrom dates.

**Why this priority**: Enables business planning but manual price updates work for MVP.

**Independent Test**: Can be tested by adding a future price and verifying it becomes active.

**Acceptance Scenarios**:

1. **Given** a company product exists, **When** I add a price with future date, **Then** it's stored
2. **Given** multiple prices exist, **When** validFrom passes, **Then** new price becomes current
3. **Given** I view pricing history, **When** I look at past prices, **Then** they are read-only

---

### Edge Cases

- What if a region is deleted that products depend on? → Prevent deletion, show error
- How to handle currency conversion? → Not supported, each currency is separate
- What if validFrom dates overlap? → Must be unique per product

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creation of regions with country assignments
- **FR-002**: System MUST allow creation of bundles with data/voice/SMS units
- **FR-003**: System MUST allow creation of products with bundle, coverage, validity
- **FR-004**: System MUST allow creation of provider products with metadata
- **FR-005**: System MUST allow creation of company products with pricing
- **FR-006**: System MUST support pricing in USD, EUR, GBP currencies
- **FR-007**: System MUST support price scheduling with validFrom dates
- **FR-008**: System MUST allow activate/deactivate for all entities
- **FR-009**: System MUST use GenericTableComponent for all lists
- **FR-010**: System MUST use FormGeneratorComponent for all forms

### Key Entities

- **Region**: Named group of countries for coverage definition
- **MobileBundle**: Usage package with data/voice/SMS units
- **ProviderProduct**: Link between service provider and coverage
- **Product**: Core product template with bundle, coverage, validity
- **CompanyProduct**: Customer-facing product with company-specific pricing

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can create a complete product (region → bundle → product → company product) in under 10 minutes
- **SC-002**: Product list loads in under 2 seconds with 500+ products
- **SC-003**: Price changes are reflected immediately after save
- **SC-004**: Filtering by region/country returns results in under 1 second

---

## Technical Implementation

### Data Models

```typescript
interface Region {
  id: number;
  name: string;
  countries?: Country[];
}

interface MobileBundle {
  id: string;
  name: string;
  usageUnits: UsageUnit[];
}

interface Product {
  id: string;
  name: string;
  bundle: MobileBundle;
  serviceCoverage: ServiceCoverage;
  validityPeriod: ValidityPeriod;
  active: boolean;
}

interface CompanyProduct {
  id: string;
  company: { id: string; name: string };
  name: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  usageUnits: UsageUnit[];
  validityPeriod: ValidityPeriod;
  active: boolean;
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/esim-product/regions` | Manage regions |
| GET/POST | `/api/v1/esim-product/bundles` | Manage bundles |
| GET/POST | `/api/v1/esim-product/provider-products` | Manage provider products |
| GET/POST | `/api/v1/esim-product/products` | Manage core products |
| GET/POST | `/api/v1/esim-product/company-products` | Manage company products |
| GET | `/api/v1/esim-product/countries` | List all countries |

### File Structure

```
src/app/views/product-constructor/
├── models/
├── services/
├── components/
│   ├── overview/
│   ├── region-management/
│   ├── bundle-management/
│   ├── provider-products/
│   ├── products/
│   └── company-products/
└── product-constructor.routes.ts
```

### Pricing Schedule Rules

| Rule | Description |
|------|-------------|
| Current Price | `validFrom <= today` closest to today |
| Future Price | `validFrom > today` (editable) |
| Past Price | `validFrom < today` (read-only) |

---

**Specification Version:** 1.0.0 | **Last Updated:** 2025-12-03
