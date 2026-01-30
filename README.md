# One Sim Portal

[![Angular](https://img.shields.io/badge/Angular-21.0.5-dd0031?logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20.9.0-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> B2B SaaS platform for eSIM product management (white-label solution)

## Overview

One Sim Portal is a comprehensive web application for managing eSIM products, customers, orders, and inventory. Built with Angular 21 (standalone, zoneless) and designed for white-label deployment.

## Features

- **Dashboard & Analytics** — Real-time metrics, charts, and KPIs
- **Customer Management** — Customer profiles, subscriptions, and history
- **Order Processing** — Order lifecycle management and tracking
- **Inventory Management** — eSIM inventory control and allocation
- **Product Constructor** — Create and configure eSIM products
- **Support Tickets** — Integrated ticketing system
- **User & Role Management** — RBAC with granular permissions
- **Multi-language Support** — English, Hebrew, Russian, Ukrainian
- **Public API Documentation** — Interactive API docs with Mermaid diagrams
- **White-label Ready** — Customizable branding per company

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Angular 21.0.5 (Standalone, Zoneless) |
| Language | TypeScript 5.9 |
| UI Components | CoreUI 5.6 + Angular Material 21 |
| Charts | Chart.js 4.4 |
| State | Angular Signals + RxJS 7.8 |
| i18n | @ngx-translate |
| Testing | Vitest 4 + @angular/build:unit-test |
| Styling | SCSS (Dart Sass) |

## Getting Started

### Prerequisites

- **Node.js** >= 20.9.0
- **npm** >= 10

### Installation

```bash
# Clone the repository
git clone https://github.com/quantum-soft-dev/one-sim-portal-ui.git
cd one-sim-portal-ui

# Install dependencies
npm ci --legacy-peer-deps
```

### Development Server

```bash
# Start dev server with API proxy
npm start

# Open browser
open http://localhost:4200
```

The app proxies API requests to the development backend automatically.

### Mock Server (Optional)

For offline development without backend:

```bash
npm run start:mock
```

## Project Structure

```
src/app/
├── shared/                     # Shared resources
│   ├── components/             # 59 reusable UI components
│   ├── services/               # 65+ services (API, UI, cache)
│   ├── models/                 # TypeScript interfaces
│   ├── utils/                  # Utility functions
│   ├── pipes/                  # Custom pipes
│   └── directives/             # Custom directives
│
├── views/                      # Feature modules
│   ├── analytics/              # Dashboard & analytics
│   ├── customers/              # Customer management
│   ├── orders/                 # Order processing
│   ├── inventory/              # eSIM inventory
│   ├── product-constructor/    # Product management
│   ├── tickets/                # Support tickets
│   ├── companies/              # Company management
│   ├── providers/              # Provider management
│   ├── users/                  # User management
│   ├── roles/                  # Role/permission management
│   ├── settings/               # Application settings
│   └── docs/                   # API documentation
│
├── containers/default-layout/  # Main app layout
└── features/support-chat/      # Support chat feature
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server (port 4200) |
| `npm run build-prod` | Production build |
| `npm test` | Run tests (jsdom) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ui` | Run tests with Vitest UI |

## Testing

```bash
# Run all tests (jsdom environment)
npm test

# Watch mode (re-run on changes)
npm run test:watch

# With coverage report
npm run test:coverage

# Vitest UI (interactive test explorer)
npm run test:ui

# Browser Mode (real Chromium browser)
npm test -- --browsers=chromium
```

Tests use **Vitest 4** with `@angular/build:unit-test` builder for zoneless Angular testing.

### Testing Environments

| Environment | Command | Use Case |
|-------------|---------|----------|
| jsdom (default) | `npm test` | Fast, lightweight, CI/CD |
| Browser Mode | `npm test -- --browsers=chromium` | Real browser APIs, DOM accuracy |
| Vitest UI | `npm run test:ui` | Interactive debugging |

### Browser Mode Setup

Browser Mode requires Playwright browser:

```bash
npx playwright install chromium
```

## Building for Production

```bash
npm run build-prod
```

Output is generated in `dist/` directory.

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t one-sim-portal .

# Run container
docker run -p 80:80 \
  -e MAIN_BACKEND_SERVER=https://api.example.com \
  one-sim-portal
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MAIN_BACKEND_SERVER` | Main backend API URL |
| `MAIN_BACKEND_HOST` | Backend host header |
| `API_PRODUCT_SERVER` | Product API URL |
| `API_TICKETING_SERVER` | Ticketing API URL |

## CI/CD

The project uses GitHub Actions for CI/CD:

- **Pull Requests** — Runs install, test, build (validation only)
- **Push to main** — Deploys to test environment
- **Push to release** — Bumps version (if PR merge), deploys to production

See [RELEASING.md](RELEASING.md) for detailed release process.

## Internationalization

Supported languages:
- English (`en`)
- Hebrew (`he`)
- Russian (`ru`)
- Ukrainian (`uk`)

Translation files: `src/assets/i18n/{lang}.json`

## Contributing

1. Create a feature branch from `release`
2. Make your changes
3. Ensure tests pass: `npm test`
4. Create a Pull Request to `release`

### Code Standards

- Use standalone components with `changeDetection: OnPush`
- Use `inject()` for dependency injection
- Use Angular Signals (`signal()`, `computed()`, `input()`, `output()`)
- Follow the selector prefix: `os-`
- See `.specify/memory/constitution.md` for full coding standards

## Documentation

| Document | Description |
|----------|-------------|
| [RELEASING.md](RELEASING.md) | Release process and versioning |
| [CLAUDE.md](CLAUDE.md) | AI developer guide |
| `.specify/memory/constitution.md` | Coding standards |
| `.specify/memory/project-map.md` | Project structure reference |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with Angular by [Quantum Soft](https://github.com/quantum-soft-dev)
