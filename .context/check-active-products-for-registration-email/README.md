# Check Active Products for Registration Email Feature

## Overview

This feature validates whether a subscriber has active purchased products before allowing the user to send registration emails. If no active products are found, it displays an informational message instead of the registration form.

## Business Logic

- Before showing the registration email form, check if the subscriber has active purchased products
- Use the `getPurchasedProducts` API call with the subscriber ID and `isActive: true` parameter
- If the API returns an empty array or throws an error, show an info strip message
- If active products exist, show the normal registration form

## Implementation Details

### Components Affected
- `SendRegistrationEmailComponent` - Main dialog component that needs modification

### API Dependencies
- `PurchasedProductsDataService.getPurchasedProducts()` - Used to check for active products

### Flow
1. Dialog opens with subscriber ID
2. Component calls `getPurchasedProducts` API with `{ subscriberId, isActive: true }`
3. If no active products found or error occurs:
   - Hide form generator
   - Show info strip with message about no active packages
4. If active products exist:
   - Show normal form for sending registration email

## Error Handling

- Empty array response: Show info message
- API error: Show info message
- Network issues: Show info message

## User Experience

When no active products are found, the user sees:
- Dialog title remains the same  
- Info strip message with localized text (supports English, Russian, Ukrainian, Hebrew)
- Only Cancel button (no Submit button)

## Technical Notes

- The check happens on component initialization
- Form generation is conditional based on product availability
- Error states are handled gracefully with user-friendly messaging
- Info strip message supports internationalization (i18n) with translations in 4 languages
- Uses Angular's translate pipe for dynamic language switching 