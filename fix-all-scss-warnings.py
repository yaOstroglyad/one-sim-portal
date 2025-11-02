#!/usr/bin/env python3
"""
Fix all SCSS deprecation warnings in the project
- Replace @import with @use
- Replace map-get() with map.get()
"""

import re
import sys

# List of all files with SCSS warnings
files = [
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/form-generator/form-generator.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/form-inputs/form-array-item/form-array-item.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/form-inputs/rich-text-input/rich-text-input.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/pagination/pagination.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/components/user-avatar/user-avatar.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/components/error-display/error-display.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/components/loading-indicator/loading-indicator.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/executive/executive-tab.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/finance/finance-tab.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/subscribers/subscribers-tab.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/analytics/dashboard/tabs/traffic/traffic-tab.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/companies/companies.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/customers/customers.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/customers/private-customer-details/add-subscriber-product/add-subscriber-product.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/customers/private-customer-details/add-subscriber/add-subscriber.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/customers/private-customer-details/send-registration-email/send-registration-email.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/inventory/inventory.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/orders/orders.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/pages/login/login.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/pages/register/register.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/bundles/bundle-details/bundle-details.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/bundles/bundle-form/bundle-form.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/company-products/company-product-details/company-product-details.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/company-products/company-product-form/company-product-form.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/company-products/selected-tariff-offer-details/selected-tariff-offer-details.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/components/products/product-details/product-details.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/products/product-form/product-form.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/provider-products/provider-product-details/provider-product-details.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/provider-products/provider-product-upload-dialog/provider-product-upload-dialog.component.scss",
    "/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/views/product-constructor/components/regions/region-details/region-details.component.scss",
]

def fix_scss_file(filepath):
    """Fix SCSS deprecation warnings in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Track if @use "sass:map" is needed
        needs_map_import = 'map-get(' in content or 'map.get(' in content
        has_map_import = '@use "sass:map"' in content

        # Step 1: Replace @import with @use (if not already using @use)
        if '@import' in content and '@use' not in content:
            # Replace @import "../../../scss/variables" with @use "../../../scss/variables" as vars
            content = re.sub(
                r'@import\s+"([^"]*)/variables"\s*;',
                r'@use "\1/variables" as vars;',
                content
            )
            content = re.sub(
                r'@import\s+"([^"]*)/mixins"\s*;',
                r'@use "\1/mixins" as mixins;',
                content
            )
            content = re.sub(
                r'@import\s+"([^"]*)/utilities"\s*;',
                r'@use "\1/utilities" as utils;',
                content
            )

        # Step 2: Add @use "sass:map" if needed and not present
        if needs_map_import and not has_map_import:
            # Find the position after the last @use statement or at the beginning
            use_match = list(re.finditer(r'@use\s+[^;]+;', content))
            if use_match:
                last_use_pos = use_match[-1].end()
                content = content[:last_use_pos] + '\n@use "sass:map";' + content[last_use_pos:]
            else:
                # No @use statements, add at the beginning
                content = '@use "sass:map";\n' + content

        # Step 3: Replace map-get($var, ...) with map.get(vars.$var, ...)
        # Handle different variable names that might be used
        content = re.sub(
            r'map-get\(\s*\$os-([a-zA-Z-]+)\s*,',
            r'map.get(vars.$os-\1,',
            content
        )

        # Also handle if variables already use vars. prefix
        content = re.sub(
            r'map-get\(\s*vars\.\$',
            r'map.get(vars.$',
            content
        )

        # If content changed, write it back
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed {filepath}")
            return True
        else:
            print(f"ℹ️  No changes needed for {filepath}")
            return False

    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    print("🔧 Fixing SCSS deprecation warnings...\n")

    fixed_count = 0
    for filepath in files:
        if fix_scss_file(filepath):
            fixed_count += 1

    print(f"\n🎉 Fixed {fixed_count}/{len(files)} files!")

if __name__ == "__main__":
    main()
