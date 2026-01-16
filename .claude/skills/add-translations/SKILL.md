---
name: add-translations
description: Adds translations to all 4 language files (en, he, ru, ua). Use when asked to add translation, translate, add i18n, internationalization, or localization.
allowed-tools: Read, Edit, Glob
---

# Add Translations

Add translations to all 4 language files in One-Sim-Portal.

> **Rules Reference:** Documentation/i18n in `constitution.md` Section IX.
> This skill provides the **procedure** for adding translations.

## Translation Files

| Language | File |
|----------|------|
| English | `src/assets/i18n/en.json` |
| Hebrew | `src/assets/i18n/he.json` |
| Russian | `src/assets/i18n/ru.json` |
| Ukrainian | `src/assets/i18n/ua.json` |

## Procedure

1. **Identify the feature/module** the translation belongs to
2. **Read en.json first** to understand existing structure
3. **Create English translation** (source of truth)
4. **Add to all 4 files** maintaining same key structure
5. **Verify JSON validity** (no trailing commas)

## Key Naming Convention

```
feature.title           → Page/section titles
feature.field           → Form field labels
feature.button.action   → Button labels
feature.message.type    → Toast/alert messages
feature.placeholder.x   → Input placeholders
feature.validation.x    → Validation messages
common.action           → Shared across features
```

## Interpolation

Use `{{variable}}` for dynamic values:
```json
"deleteMessage": "Are you sure you want to delete \"{{name}}\"?"
```

## Example: Adding "products" Section

**en.json:**
```json
"products": {
  "title": "Products",
  "create": "Create Product",
  "message": {
    "created": "Product created successfully"
  }
}
```

**he.json:**
```json
"products": {
  "title": "מוצרים",
  "create": "צור מוצר",
  "message": {
    "created": "המוצר נוצר בהצלחה"
  }
}
```

**ru.json:**
```json
"products": {
  "title": "Продукты",
  "create": "Создать продукт",
  "message": {
    "created": "Продукт успешно создан"
  }
}
```

**ua.json:**
```json
"products": {
  "title": "Продукти",
  "create": "Створити продукт",
  "message": {
    "created": "Продукт успішно створено"
  }
}
```

## Usage in Code

```typescript
// Template
{{ 'products.title' | translate }}

// Service
this.translate.instant('products.message.created');
```

## Quick Checklist

- [ ] All 4 files updated
- [ ] Keys follow naming convention
- [ ] JSON is valid
- [ ] Interpolation variables match across languages
