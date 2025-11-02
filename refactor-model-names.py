#!/usr/bin/env python3
"""
Refactor model file names to follow kebab-case.model.ts standard
Updates all imports across the codebase
"""

import os
import re
from pathlib import Path

# Project root
ROOT = Path("/Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal")
MODELS_DIR = ROOT / "src/app/shared/models"

# Rename mapping: old_name -> new_name
RENAMES = {
    # Auth models
    "auth/loginRequest.ts": "auth/login-request.model.ts",
    "auth/loginResponse.ts": "auth/login-response.model.ts",
    "auth/refreshTokenRequest.ts": "auth/refresh-token-request.model.ts",
    "auth/user.ts": "auth/user.model.ts",

    # Business models
    "business/company.ts": "business/company.model.ts",
    "business/customer.ts": "business/customer.model.ts",
    "business/order.ts": "business/order.model.ts",
    "business/provider.ts": "business/provider.model.ts",
    "business/resource.ts": "business/resource.model.ts",

    # Communication models
    "communication/email-log.ts": "communication/email-log.model.ts",
    "communication/email-template.ts": "communication/email-template.model.ts",

    # Core models
    "core/country.ts": "core/country.model.ts",
    "core/domain.ts": "core/domain.model.ts",
    "core/errorResponse.ts": "core/error-response.model.ts",
    "core/page-response.ts": "core/page-response.model.ts",

    # Payment models
    "payment/invoicing-method.ts": "payment/invoicing-method.model.ts",
    "payment/payment-strategies.ts": "payment/payment-strategies.model.ts",

    # Product models
    "product/package.ts": "product/package.model.ts",

    # Subscriber models
    "subscriber/purchaseHistory.ts": "subscriber/purchase-history.model.ts",
    "subscriber/sim.ts": "subscriber/sim.model.ts",
    "subscriber/subscriberInfo.ts": "subscriber/subscriber-info.model.ts",
    "subscriber/subscriberStatusEvent.ts": "subscriber/subscriber-status-event.model.ts",
    "subscriber/subscriberUsage.ts": "subscriber/subscriber-usage.model.ts",
    "subscriber/usageInfo.ts": "subscriber/usage-info.model.ts",

    # UI models
    "ui/brandFull.ts": "ui/brand-full.model.ts",
    "ui/brandNarrow.ts": "ui/brand-narrow.model.ts",
    "ui/field-config.ts": "ui/field-config.model.ts",
    "ui/grid-configs.ts": "ui/grid-configs.model.ts",
    "ui/userViewConfig.ts": "ui/user-view-config.model.ts",
}

def get_export_name(file_path):
    """Extract the export name from old file name (without extension)"""
    basename = os.path.basename(file_path)
    return basename.replace('.ts', '')

def get_new_export_name(new_file_path):
    """Extract the export name from new file name (without .model.ts or .interface.ts)"""
    basename = os.path.basename(new_file_path)
    return basename.replace('.model.ts', '').replace('.interface.ts', '').replace('.ts', '')

def update_barrel_export(category_path, old_name, new_name):
    """Update index.ts barrel export"""
    index_file = MODELS_DIR / category_path.split('/')[0] / "index.ts"
    if not index_file.exists():
        return

    content = index_file.read_text()

    # Update export statement
    old_export = f"from './{old_name.replace('.ts', '')}'"
    new_export = f"from './{new_name.replace('.ts', '')}'"

    content = content.replace(old_export, new_export)

    index_file.write_text(content)
    print(f"  ✅ Updated barrel export in {index_file.relative_to(ROOT)}")

def update_imports_in_codebase(old_path, new_path):
    """Update all imports across the codebase"""
    old_import_base = old_path.replace('.ts', '')
    new_import_base = new_path.replace('.ts', '')

    # Patterns to search for
    patterns = [
        # Direct imports from models folder
        (f"from '@models/{old_import_base}'", f"from '@models/{new_import_base}'"),
        (f"from '@shared/models/{old_import_base}'", f"from '@shared/models/{new_import_base}'"),
        (f'from "@models/{old_import_base}"', f'from "@models/{new_import_base}"'),
        (f'from "@shared/models/{old_import_base}"', f'from "@shared/models/{new_import_base}"'),
    ]

    # Find all TypeScript files
    ts_files = list(ROOT.glob("src/**/*.ts"))
    updated_count = 0

    for ts_file in ts_files:
        try:
            content = ts_file.read_text()
            original_content = content

            # Apply all patterns
            for old_pattern, new_pattern in patterns:
                if old_pattern in content:
                    content = content.replace(old_pattern, new_pattern)

            # Write back if changed
            if content != original_content:
                ts_file.write_text(content)
                updated_count += 1
        except Exception as e:
            print(f"  ⚠️  Error updating {ts_file}: {e}")

    if updated_count > 0:
        print(f"  ✅ Updated imports in {updated_count} files")

def main():
    print("🔄 Refactoring model file names to kebab-case.model.ts standard\n")

    renamed_count = 0

    for old_path, new_path in RENAMES.items():
        old_file = MODELS_DIR / old_path
        new_file = MODELS_DIR / new_path

        if not old_file.exists():
            print(f"⚠️  File not found: {old_path}")
            continue

        if old_file == new_file:
            print(f"ℹ️  Already correct: {old_path}")
            continue

        print(f"\n📝 Renaming: {old_path}")
        print(f"        ➜  {new_path}")

        # Rename the file
        old_file.rename(new_file)
        renamed_count += 1

        # Update barrel export
        update_barrel_export(old_path, os.path.basename(old_path), os.path.basename(new_path))

        # Update imports across codebase
        update_imports_in_codebase(old_path, new_path)

    print(f"\n\n✅ Refactoring complete!")
    print(f"   Renamed: {renamed_count} files")
    print(f"\n🔍 Next steps:")
    print(f"   1. Run: npm run build")
    print(f"   2. Fix any remaining import errors manually")
    print(f"   3. Test the application")

if __name__ == "__main__":
    main()
