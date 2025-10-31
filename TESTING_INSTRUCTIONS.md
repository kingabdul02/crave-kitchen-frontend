# Testing Instructions - State Update Fix

## Quick Test for Order Status Update

### Test Case: Update Order Status

This is the exact issue you reported. Follow these steps:

1. **Open the application**

   ```bash
   npm run dev
   ```

2. **Navigate to Orders page**

   - Click "Orders" in the sidebar
   - Find any order in the list

3. **Update Status to "Pending"**

   - Click the "Update Status" button (or status badge)
   - Select "Pending" from dropdown
   - Click "Confirm"

4. **Verify Immediate Update** ✅

   - [ ] Success toast appears
   - [ ] Modal closes automatically
   - [ ] Order in the table shows "Pending" status **immediately** (no refresh)
   - [ ] Dashboard "Pending Orders" count updates **immediately**

5. **Open Browser DevTools**
   - Open Network tab (F12)
   - Filter by "Fetch/XHR"
   - You should see:
     1. `PUT /api/admin/orders/{id}/status` (mutation)
     2. `GET /api/admin/orders` (refetch)
     3. `GET /api/admin/dashboard` (refetch)
   - All should return 200 OK with fresh data

### Test Case: Navigate Away and Back

1. **After updating status**
   - Navigate to Dashboard
   - Navigate back to Orders
2. **Verify** ✅
   - [ ] Order still shows updated status
   - [ ] No stale data appears

### Test Case: Multiple Status Changes

1. **Change status multiple times**
   - Pending → Processed
   - Processed → Completed
   - Each change should:
     - [ ] Update immediately
     - [ ] Update dashboard counts
     - [ ] Persist on navigation

### Test Case: Payment Recording

1. **Record a payment for an order**

   - Go to Payments page
   - Click "Record Payment"
   - Fill in details and submit

2. **Verify** ✅
   - [ ] Payment appears in list immediately
   - [ ] Go to Orders page → Order payment status updated
   - [ ] Go to Dashboard → Payment stats updated
   - [ ] All views synchronized

## Expected Console Output

When you update an order, you should see network calls in this order:

```
1. PUT /api/admin/orders/123/status
   Status: 200 OK
   Response: { success: true, data: { ...updated order... } }

2. GET /api/admin/orders?page=1&...
   Status: 200 OK
   Response: { success: true, data: [...orders with updated status...] }

3. GET /api/admin/dashboard
   Status: 200 OK
   Response: { success: true, data: { ...updated dashboard stats... } }
```

## Common Issues & Solutions

### Issue: Still seeing old data

**Solution**: Clear browser cache and reload

```bash
# In browser console:
localStorage.clear();
location.reload();
```

### Issue: Error "Query not found"

**Solution**: Make sure you're on the correct page when mutation happens

- Queries with `type: 'active'` only refetch if they're mounted

### Issue: Dashboard not updating

**Solution**: Check if dashboard query is active

- Navigate to dashboard first, then back to orders
- Try the mutation again

## React Query DevTools (Optional)

For detailed debugging, install DevTools:

```bash
npm install @tanstack/react-query-devtools
```

Add to `src/App.tsx`:

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Inside your App component, after </Router>:
<ReactQueryDevtools initialIsOpen={false} />;
```

Then:

1. Click the React Query icon in the bottom corner
2. Watch queries refetch in real-time
3. See cache status and data

## Performance Check

### Before Fix (Expected Behavior)

```
Update Status → Backend updates → UI shows OLD status → User refreshes page → UI shows NEW status
Time to see update: Manual refresh required ❌
```

### After Fix (Expected Behavior)

```
Update Status → Backend updates → Refetch → UI shows NEW status
Time to see update: < 1 second ✅
```

## Verification Checklist

- [ ] Order status updates immediately
- [ ] Dashboard stats update immediately
- [ ] No page refresh needed
- [ ] Changes persist on navigation
- [ ] Network tab shows refetch calls
- [ ] All views stay synchronized
- [ ] Error handling works (try invalid data)
- [ ] Loading states work (slow network)

## Report Issues

If you still see stale data after following these tests, please provide:

1. **Network logs**: Screenshot of Network tab showing API calls
2. **Console errors**: Any errors in browser console
3. **Steps to reproduce**: Exact steps you took
4. **Expected vs Actual**: What you expected vs what happened
5. **Browser/Version**: Chrome 120, Safari 17, etc.

## Success Criteria ✅

The fix is working correctly if:

1. ✅ All CRUD operations update UI immediately
2. ✅ Dashboard always shows current stats
3. ✅ No manual refresh ever needed
4. ✅ All related views stay in sync
5. ✅ No console errors appear
