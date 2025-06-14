# Provider Filters Pagination Reset Fix

## Problem

The provider filters component had a pagination issue where changing any filter (provider type, status, location, or search) would not reset the page parameter in the URL. This caused stale pagination where users could end up on page 3 of results after applying a filter that only had 1 page of results, leading to empty result sets.

## Root Cause

The individual filter handlers (`handleProviderTypeChange`, `handleStatusChange`, `handleLocationChange`) and the search debounce effect were only updating their specific filter parameters without resetting the `page` parameter to `null`.

## Solution

Modified all filter update operations to include `page: null` in the `updateUrl` call, ensuring pagination is reset whenever any filter changes.

## Changes Made

### 1. Individual Filter Handlers

**Before:**
```typescript
const handleProviderTypeChange = useCallback(
  (value: string) => {
    setProviderType(value);
    updateUrl({ providerType: value || null });
  },
  [updateUrl]
);
```

**After:**
```typescript
const handleProviderTypeChange = useCallback(
  (value: string) => {
    setProviderType(value);
    updateUrl({ providerType: value || null, page: null });
  },
  [updateUrl]
);
```

### 2. Search Debounce Effect

**Before:**
```typescript
useEffect(() => {
  if (debouncedSearch !== getParam('search')) {
    updateUrl({ search: debouncedSearch || null });
  }
}, [debouncedSearch, updateUrl, getParam]);
```

**After:**
```typescript
useEffect(() => {
  if (debouncedSearch !== getParam('search')) {
    updateUrl({ search: debouncedSearch || null, page: null });
  }
}, [debouncedSearch, updateUrl, getParam]);
```

### 3. Clear Individual Filter

**Before:**
```typescript
case 'providerType': {
  setProviderType('');
  updateUrl({ providerType: null });
  break;
}
```

**After:**
```typescript
case 'providerType': {
  setProviderType('');
  updateUrl({ providerType: null, page: null });
  break;
}
```

### 4. Clear All Filters

**Before:**
```typescript
updateUrl({
  search: null,
  providerType: null,
  status: null,
  locationId: null,
});
```

**After:**
```typescript
updateUrl({
  search: null,
  providerType: null,
  status: null,
  locationId: null,
  page: null,
});
```

## Functions Modified

1. **`handleProviderTypeChange`** (line 279) - Added `page: null`
2. **`handleStatusChange`** (line 287) - Added `page: null`
3. **`handleLocationChange`** (line 295) - Added `page: null`
4. **Search debounce effect** (line 259) - Added `page: null`
5. **`handleClearAll`** (line 311) - Added `page: null`
6. **`handleClearFilter`** (lines 321, 326, 331, 336) - Added `page: null` to all cases

## Behavior Changes

### Before Fix
- User is on page 3 of providers
- User changes provider type filter
- URL becomes: `/providers?providerType=dentist&page=3`
- Results show empty because there's only 1 page of dentists
- User sees "No results found" even though there are dentist providers

### After Fix
- User is on page 3 of providers
- User changes provider type filter
- URL becomes: `/providers?providerType=dentist`
- Results show page 1 of dentist providers
- User sees the correct filtered results

## Testing

Created comprehensive tests in `src/components/providers/provider-filters.test.tsx` covering:

- ✅ Provider type filter changes reset pagination
- ✅ Status filter changes reset pagination
- ✅ Location filter changes reset pagination
- ✅ Search input changes reset pagination
- ✅ Individual filter clearing resets pagination
- ✅ Clear all filters resets pagination
- ✅ Proper URL parameter handling (null values remove parameters)
- ✅ Type safety verification

All 9 tests pass, confirming the fix works correctly.

## Impact

- **User Experience**: Users will always see relevant results when applying filters
- **No Breaking Changes**: Existing functionality remains the same, just with better pagination behavior
- **Type Safety**: All changes maintain proper TypeScript typing
- **Performance**: No performance impact, just additional parameter in URL updates

## Files Modified

- `src/components/providers/provider-filters.tsx` - Main implementation
- `src/components/providers/provider-filters.test.tsx` - Test coverage (new file)
- `docs/fixes/provider-filters-pagination-reset.md` - This documentation (new file)
