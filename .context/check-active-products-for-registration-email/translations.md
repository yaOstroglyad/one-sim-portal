# Translations for Active Products Check Feature

## Translation Key

The message displayed when no active products are found uses the translation key:
```
send-registration-email.noActivePackages
```

## Available Translations

### English (en.json)
```json
{
  "send-registration-email": {
    "title": "Send Registration Email",
    "submit": "Send Email",
    "noActivePackages": "You don't have any active packages to send activation instructions email"
  }
}
```

### Russian (ru.json)
```json
{
  "send-registration-email": {
    "title": "Отправить регистрационное письмо",
    "submit": "Отправить письмо",
    "noActivePackages": "У вас нет активных пакетов для отправки письма с инструкциями по активации"
  }
}
```

### Ukrainian (ua.json)
```json
{
  "send-registration-email": {
    "title": "Надіслати реєстраційний лист",
    "submit": "Надіслати лист",
    "noActivePackages": "У вас немає активних пакетів для надсилання листа з інструкціями активації"
  }
}
```

### Hebrew (he.json)
```json
{
  "send-registration-email": {
    "title": "שלח דוא\"ל רישום",
    "submit": "שלח דוא\"ל",
    "noActivePackages": "אין לך חבילות פעילות לשליחת דוא\"ל עם הוראות הפעלה"
  }
}
```

## Usage in Component

### HTML Template
```html
<app-info-strip *ngIf="!isLoadingProducts && !hasActiveProducts"
                [text]="'send-registration-email.noActivePackages' | translate">
</app-info-strip>
```

### Required Dependencies
- `TranslateModule` from `@ngx-translate/core`
- Translation files properly loaded in the application

## Implementation Notes

1. **Translation Pipe**: Uses Angular's `translate` pipe to display localized message
2. **Property Binding**: Uses property binding `[text]` to pass the translated string
3. **Fallback**: If translation key is missing, the key itself will be displayed
4. **Dynamic Language**: Message automatically updates when user changes language

## Testing Translations

To test different languages:
1. Change language in the application header
2. Open send registration email dialog for subscriber without active products
3. Verify the message displays in the selected language

## Adding New Languages

To add support for new languages:
1. Create new JSON file in `src/assets/i18n/[language-code].json`
2. Add the `send-registration-email.noActivePackages` key with appropriate translation
3. Update language configuration in the application 