# Business Domain — One Sim Portal

> **Context Tags:** `@learn-project` `@business`
> **Read when:** Understanding the project's business logic and domain model
> **Last Updated:** 2025-11-26

## 🎯 What is One Sim Portal?

**B2B SaaS platform for eSIM product management.**

White-label solution allowing companies to create, manage, and sell eSIM products to end customers.

---

## 🏗️ Domain Model

### Product Constructor Hierarchy

```
Countries ← Regions ← Provider Products ← Products ← Company Products
                ↑              ↑             ↑
            Mobile Bundles → Tariff Offers ---┘
```

**Flow:**
1. **Countries** — Base geographical units (ISO codes)
2. **Regions** — Group countries for coverage (e.g., "Europe", "Asia")
3. **Provider Products** — Link service providers to coverage areas
4. **Products (Core)** — Base product templates with bundles and validity
5. **Company Products** — Customer-facing products with pricing

---

## 📦 Core Business Entities

### Company
- B2B client (reseller/distributor)
- Owns products and customers
- Has branding settings (logo, colors)
- Multi-tenant architecture

### Customer
- End user purchasing eSIM
- Types: **Private** (individual) or **Corporate** (business)
- Has subscribers (activated SIMs)
- Belongs to a Company

### Product
- eSIM product definition
- Contains: bundles, validity period, coverage
- Pricing in multiple currencies
- Active/inactive status

### Order
- Purchase transaction
- Links Customer → Product → Subscriber
- Status: PENDING → PAID → ACTIVATED → COMPLETED

### Subscriber
- Activated eSIM instance
- Has ICCID (SIM identifier)
- Usage tracking (data, SMS, voice)
- Status: ACTIVE, SUSPENDED, EXPIRED

### Ticket
- Support request
- Status: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- Priority: LOW, MEDIUM, HIGH, URGENT
- Categories: Technical, Billing, Feature Request, etc.

---

## 👥 User Roles

| Role | Access | Typical User |
|------|--------|--------------|
| **Admin** | Full system access | Platform operator |
| **Customer** | Self-service portal, own data | B2B client admin |
| **Support** | Customer management, tickets | Support team |
| **Special** | Extended permissions | Power users |

**Permission check:**
```typescript
this.authService.hasPermission(ADMIN_PERMISSION)
```

---

## 🔧 Key Features

### 1. Product Constructor
- Create eSIM products with coverage and pricing
- Manage regions, bundles, tariff offers
- **Location:** `/views/product-constructor/`
- **HLD:** `docs/features/product-constructor.md`

### 2. Dashboard & Analytics
- **4 tabs:** Overview, Subscribers, Traffic, Finance
- Chart.js visualizations
- Period filtering (day/week/month)
- **Location:** `/views/analytics/dashboard/`

### 3. Customer Management
- Private and Corporate customers
- Subscriber management
- Order history
- **Location:** `/views/customers/`

### 4. Tickets System
- Support ticket management
- Comments and attachments
- Status workflow
- **HLD:** `docs/features/tickets.md`

### 5. Feature Toggles
- Dynamic feature enabling/disabling
- No restart required
- **Pattern:** See `common-patterns.md#feature-toggles-pattern`

---

## 🌐 API Structure

**Base pattern:** `/api/v1/{resource}/{command|query}/{action}`

**Examples:**
```
GET  /api/v1/customers/query/all          → List customers
POST /api/v1/customers/command/create     → Create customer
GET  /api/v1/customers/query/{id}/details → Customer details
GET  /api/v1/esim-product/regions         → List regions
POST /api/v1/tickets/command/create       → Create ticket
```

---

## 🗄️ Data Flow

```
UI Component
    ↓ inject()
Data Service (e.g., CustomersDataService)
    ↓
CacheHubService (optional caching)
    ↓
HttpClient
    ↓
API Proxy (/api/v1/*)
    ↓
Backend (esim-server)
```

---

## 📚 Detailed Documentation

| Topic | Location |
|-------|----------|
| Product Constructor HLD | `docs/features/product-constructor.md` |
| Tickets HLD | `docs/features/tickets.md` |
| Dashboard | `docs/features/dashboard.md` |
| CacheHub (caching) | `docs/features/data-cache.md` |
| Component guides | `docs/components/` |

---

## 🔍 Quick Reference

### Common Translation Prefixes
- `company.` — Company entities
- `customer.` — Customer entities
- `order.` — Orders
- `package.` — Products/Packages
- `user.` — Users
- `inventory.` — eSIM inventory
- `ticket.` — Tickets

### Status Enums (Common Pattern)
```typescript
type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type OrderStatus = 'PENDING' | 'PAID' | 'ACTIVATED' | 'COMPLETED' | 'CANCELLED';
```

---

**Last Updated:** 2025-11-26
