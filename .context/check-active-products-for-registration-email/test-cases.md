# Test Cases for Active Products Check Feature

## Test Case 1: Subscriber with Active Products
**Precondition:** Subscriber has active purchased products in the system (isActive=true)  
**Steps:**
1. Open customer details page
2. Select a subscriber tab
3. Click "Send Registration Email" from menu
4. Dialog opens

**Expected Result:**
- Loading indicator appears briefly
- Form with email field is displayed
- Both Cancel and Submit buttons are visible
- Submit button is disabled until valid email is entered

## Test Case 2: Subscriber with No Active Products
**Precondition:** Subscriber has no active purchased products (no products with isActive=true)  
**Steps:**
1. Open customer details page
2. Select a subscriber tab
3. Click "Send Registration Email" from menu
4. Dialog opens

**Expected Result:**
- Loading indicator appears briefly
- Info strip message displays: "You don't have any active packages to send activation instructions email"
- Only Cancel button is visible
- No form is displayed

## Test Case 3: API Error Response
**Precondition:** API endpoint returns error  
**Steps:**
1. Mock API to return error response
2. Open customer details page
3. Select a subscriber tab
4. Click "Send Registration Email" from menu
5. Dialog opens

**Expected Result:**
- Loading indicator appears briefly
- Info strip message displays (same as no products scenario)
- Only Cancel button is visible
- Error is handled gracefully without user-facing error messages

## Test Case 4: API Returns Empty Array
**Precondition:** API returns successful response but empty array  
**Steps:**
1. Mock API to return `[]`
2. Open customer details page
3. Select a subscriber tab
4. Click "Send Registration Email" from menu
5. Dialog opens

**Expected Result:**
- Loading indicator appears briefly
- Info strip message displays
- Only Cancel button is visible
- Treated same as no products scenario

## Test Case 5: API Returns Null
**Precondition:** API returns null response  
**Steps:**
1. Mock API to return `null`
2. Open customer details page
3. Select a subscriber tab
4. Click "Send Registration Email" from menu
5. Dialog opens

**Expected Result:**
- Loading indicator appears briefly
- Info strip message displays
- Only Cancel button is visible
- Handled gracefully as no products scenario

## Test Case 6: Subscriber with Only Inactive Products
**Precondition:** Subscriber has purchased products but all are inactive (isActive=false)  
**Steps:**
1. Open customer details page
2. Select a subscriber tab with only inactive products
3. Click "Send Registration Email" from menu
4. Dialog opens

**Expected Result:**
- API call includes `isActive: true` parameter
- API returns empty array (no active products)
- Info strip message displays
- Only Cancel button is visible
- Behaves same as no products scenario

## Visual Tests

### Info Strip Styling
- Blue background (#e3f2fd)
- Blue left border (#2196f3)
- Info icon displayed
- Proper spacing and typography
- Responsive design

### Loading State
- Centered loading text
- Appropriate padding
- Gray text color

### Button Visibility
- Submit button hidden when no products
- Submit button shown when products exist
- Cancel button always visible

## Integration Tests

### API Integration
- Correct subscriber ID passed to API
- Proper error handling for network issues
- Correct parameter structure `{ subscriberId: string, isActive: true }`

### Component State Management
- `isLoadingProducts` starts as `true`
- `hasActiveProducts` updated based on API response
- `formConfig` only created when products exist 