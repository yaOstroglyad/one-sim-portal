# Context Database

This directory serves as a knowledge base and context repository for the One Sim Portal project.

## Overview

The `.context` directory contains organized information about features, implementations, and architectural decisions to help with faster understanding and development of the project.

## Structure

- Each feature should be documented in its own separate folder
- All documentation and content must be written in English
- Feature folders should contain relevant documentation, examples, and implementation notes

## Rules

1. **Language**: All content in `.context` must be written in English
2. **Organization**: Each new feature gets its own dedicated folder
3. **Documentation**: Include clear descriptions, examples, and relevant code snippets
4. **Consistency**: Follow the established naming conventions and structure
5. **Angular Components**: When creating Angular components, always use separate `.html` and `.scss` files instead of inline templates and styles. This improves maintainability, enables proper syntax highlighting, and follows Angular best practices.
6. **Translation Keys**: All translation keys must be in lowercase with underscores (snake_case), e.g., `"email_logs"` instead of `"EMAIL_LOGS"`, `"user_settings"` instead of `"UserSettings"`
7. **Angular Imports**: In standalone components, always import NgModules (not individual components) when the component is part of a module. Check if component is standalone before importing directly. Import syntax: `ComponentModule` for module-based components, `ComponentName` for standalone components only.
8. **Component Selectors**: Always check the actual component selector before using in templates. For example, `GenericTableComponent` uses selector `generic-table` (not `app-generic-table`). Verify selectors in component `@Component` decorator before usage.
9. **Study Existing Examples**: Before using any existing component or service, always study real working examples in the codebase first. Check how other components use the same APIs, what properties they pass, and what methods they call. Never assume API structure - always verify with existing implementations.
10. **Table Filters Pattern**: When asked to build a new table component using generic-table, always ask first: "Do you want to include filters following the standard pattern?" If yes, implement filters using the header-component (`app-header`) following the same pattern as in companies component with FormGroup, debounced valueChanges (700ms), content projection slots for custom inputs, and proper column selection integration. If no, build a simple table without filters.
11. **Error Prevention Protocol**: Before starting ANY component development, MUST review the common errors documentation (`common-errors-and-solutions/`) to understand typical issues and their solutions. This prevents repeating known problems and ensures adherence to established safe patterns.
12. **Documentation Language**: All documentation in `.context` directory must be written in English only. No Russian, Ukrainian, Hebrew, or other languages are allowed in documentation files. This ensures consistency and accessibility for all developers.
13. **Adding New Rules**: When a new rule is requested, always add it to the appropriate file in the `.context` directory for future reference and consistency.
14. **Development Server Testing**: When checking if changes work, do NOT restart the development server - it's already running. Check for errors by visiting http://localhost:4200 to see runtime errors in the browser console and network tab. The server will automatically reload changes.
15. **Build Verification**: For checking compilation and build errors without restarting the server, use `ng build` or `npm run build` commands. These will show TypeScript errors, missing imports, and other build issues quickly.
16. **Data List Naming Convention**: When working with list components for any entity, the data observable MUST be named `dataList$`. This standardizes naming across all list components (e.g., regions list, products list, customers list). Never use entity-specific names like `regions$`, `products$`, etc. - always use `dataList$` for consistency with established patterns from orders, companies, and customers components.

## Current Features

- `account-selector-component/` - Specialized form control for administrative interfaces, providing consistent account selection experience across admin modules
- `check-active-products-for-registration-email/` - Feature for validating active products before sending registration emails
- `common-errors-and-solutions/` - Comprehensive knowledge base of frequent errors, their root causes, solutions, and prevention strategies to avoid common development pitfalls
- `dashboard/` - Comprehensive analytics dashboard feature with multiple tabs (overview, subscribers, traffic, finance), reusable chart components using Chart.js, and metric cards
- `development-rules/` - Mandatory development rules and guidelines including component naming conventions (os- prefix), CSS variable usage (no hardcoded colors), and best practices
- `email-logs-component/` - View component for displaying email event logs with role-based access control and ICCID filtering capabilities (located in `src/app/views/email-logs/`)
- `feature-toggles/` - Feature toggle service implementation providing global access to feature flags without dependency injection, with static store and configuration-based approach
- `form-generator-hint-optimization/` - Optimization of form generator component to eliminate code duplication, visual space issues, and implement intelligent spacing
- `generic-table-component/` - Comprehensive documentation of the main table component used throughout the application for displaying data with AG-Grid styling
- `header-component/` - Reusable filter and action toolbar component for table views, providing standardized interface for filtering data, column selection, and entity management actions
- `info-strip-component/` - Reusable component for displaying informational messages with configurable styling
- `navigation-system/` - Complete documentation of the application's navigation architecture including routing, layout management, role-based access control, and UI components

## Usage

This context database should be referenced when:
- Understanding existing features
- Implementing new functionality
- Making architectural decisions
- Onboarding new developers 