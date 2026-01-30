# Comprehensive Testing Guide

This guide covers all testing scenarios for the voucher system and HubSpot CRM integration.

## Table of Contents
1. [Pre-Testing Setup](#pre-testing-setup)
2. [Voucher System Testing](#voucher-system-testing)
3. [HubSpot Integration Testing](#hubspot-integration-testing)
4. [End-to-End Testing Scenarios](#end-to-end-testing-scenarios)
5. [Performance Testing](#performance-testing)
6. [Security Testing](#security-testing)

---

## Pre-Testing Setup

### 1. Environment Configuration

**Backend Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env and configure:
# - DATABASE_URL (Supabase PostgreSQL)
# - STRIPE_SECRET_KEY
# - RESEND_API_KEY
# - HUBSPOT_API_KEY (optional)
npm install
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

### 2. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 3. Test Data Setup

```bash
# Create admin user and test vouchers
cd scripts
node setupTestData.js
```

**Expected Output:**
- ✅ Admin user created: admin@olayemi.com / Admin123!
- ✅ 3 test vouchers created (SAVE10, WELCOME15, SUMMER25)

---

## Voucher System Testing

### Test Case 1: Create Voucher (Admin)

**Objective:** Verify admin can create vouchers with all validation

**Steps:**
1. Navigate to `/admin/vouchers`
2. Click "New Voucher"
3. Fill in form:
   - Code: `TEST10`
   - Type: `FIXED`
   - Value: `10`
   - Description: `Test voucher`
   - Minimum Order: `20`
   - Max Uses: `5`
   - One-time per user: ✓
   - Valid From: Today
   - Valid Until: +30 days
   - Active: ✓
4. Click "Create Voucher"

**Expected Result:**
- ✅ Voucher appears in table
- ✅ Code is uppercase
- ✅ All fields saved correctly
- ✅ Current uses shows 0/5

**Test Data:**
```json
{
  "code": "TEST10",
  "type": "FIXED",
  "value": 10,
  "minimumOrder": 20,
  "maxUses": 5
}
```

---

### Test Case 2: Validate Voucher (Valid)

**Objective:** Verify valid voucher applies discount correctly

**Steps:**
1. Add items to cart (subtotal > £30)
2. Go to checkout
3. Enter voucher code: `SAVE10`
4. Click "Apply"

**Expected Result:**
- ✅ Success message: "Voucher Applied: SAVE10"
- ✅ Discount shows: "-£10.00"
- ✅ Total updates correctly
- ✅ Voucher code shown in summary

**Calculations:**
```
Subtotal: £50.00
Discount (SAVE10): -£10.00
Delivery: £5.00
Total: £45.00
```

---

### Test Case 3: Validate Voucher (Below Minimum Order)

**Objective:** Verify minimum order validation

**Steps:**
1. Add items to cart (subtotal = £25)
2. Enter voucher code: `SAVE10` (min order £30)
3. Click "Apply"

**Expected Result:**
- ❌ Error: "Minimum order of £30.00 required"
- ❌ Discount NOT applied
- ❌ Total unchanged

---

### Test Case 4: Validate Voucher (Expired)

**Objective:** Verify expired vouchers are rejected

**Setup:**
1. Create voucher with `validUntil` in the past
2. Code: `EXPIRED10`

**Steps:**
1. Add items to cart
2. Enter code: `EXPIRED10`
3. Click "Apply"

**Expected Result:**
- ❌ Error: "This voucher has expired"
- ❌ Discount NOT applied

---

### Test Case 5: Validate Voucher (One-Time Per User)

**Objective:** Verify one-time-per-user enforcement

**Steps:**
1. User A places order with `WELCOME15`
2. Order completes successfully
3. User A tries to use `WELCOME15` again
4. Click "Apply"

**Expected Result:**
- ❌ Error: "You have already used this voucher"
- ❌ Discount NOT applied

**Database Check:**
```sql
SELECT * FROM voucher_usages
WHERE voucher_id = 'WELCOME15_ID'
AND user_id = 'USER_A_ID';
-- Should return 1 row
```

---

### Test Case 6: Validate Voucher (Max Uses Reached)

**Objective:** Verify max uses limit enforcement

**Setup:**
1. Voucher: `LIMIT5` with max_uses = 5
2. 5 different users have already used it

**Steps:**
1. User 6 tries to use `LIMIT5`
2. Click "Apply"

**Expected Result:**
- ❌ Error: "This voucher has reached its usage limit"
- ❌ Discount NOT applied

**Database Check:**
```sql
SELECT current_uses, max_uses FROM vouchers WHERE code = 'LIMIT5';
-- Should show: current_uses = 5, max_uses = 5
```

---

### Test Case 7: Percentage Voucher Calculation

**Objective:** Verify percentage discount calculates correctly

**Steps:**
1. Add items (subtotal = £100)
2. Apply voucher: `WELCOME15` (15% off)
3. Complete checkout

**Expected Result:**
- ✅ Discount: £15.00 (15% of £100)
- ✅ Final subtotal: £85.00
- ✅ Email shows discount line

**Calculations:**
```
Subtotal: £100.00
Discount (WELCOME15 - 15%): -£15.00
Final Subtotal: £85.00
Delivery: £5.00
Total: £90.00
```

---

### Test Case 8: Fixed Voucher Greater Than Subtotal

**Objective:** Verify fixed discount is capped at subtotal

**Steps:**
1. Add items (subtotal = £8)
2. Apply: `SAVE10` (£10 off)

**Expected Result:**
- ✅ Discount capped at £8.00
- ✅ Final subtotal: £0.00
- ✅ Total = delivery fee only

**Calculations:**
```
Subtotal: £8.00
Discount (SAVE10): -£8.00 (capped, not -£10)
Final Subtotal: £0.00
Delivery: £5.00
Total: £5.00
```

---

### Test Case 9: Remove Applied Voucher

**Objective:** Verify user can remove voucher before payment

**Steps:**
1. Apply voucher: `SAVE10`
2. Discount shows correctly
3. Click "X" to remove voucher

**Expected Result:**
- ✅ Voucher removed
- ✅ Discount line disappears
- ✅ Total recalculates to original
- ✅ Input field shows again

---

### Test Case 10: Voucher in Order Confirmation Email

**Objective:** Verify discount appears in order email

**Steps:**
1. Complete order with voucher
2. Check order confirmation email

**Expected Result:**
- ✅ Email shows:
  - Subtotal: £50.00
  - Discount (SAVE10): -£10.00
  - Delivery: £5.00
  - Total: £45.00
- ✅ Discount line in green color
- ✅ Voucher code displayed

---

### Test Case 11: Edit Voucher (Admin)

**Objective:** Verify admin can update voucher details

**Steps:**
1. Go to `/admin/vouchers`
2. Click edit on `TEST10`
3. Change:
   - Value: 15 (was 10)
   - Max Uses: 10 (was 5)
4. Save

**Expected Result:**
- ✅ Voucher updated in table
- ✅ New value applies to future uses
- ✅ Current uses preserved

---

### Test Case 12: Delete Voucher (Admin)

**Objective:** Verify admin can delete vouchers

**Steps:**
1. Go to `/admin/vouchers`
2. Click delete on `TEST10`
3. Confirm deletion

**Expected Result:**
- ✅ Voucher removed from table
- ✅ Code no longer valid for checkout
- ✅ Historical orders still show voucher used

**Database Check:**
```sql
-- Voucher deleted
SELECT * FROM vouchers WHERE code = 'TEST10';
-- Returns: 0 rows

-- Order history preserved
SELECT * FROM orders WHERE voucher_id = 'TEST10_OLD_ID';
-- Returns: orders that used this voucher
```

---

### Test Case 13: Voucher Statistics

**Objective:** Verify statistics calculation accuracy

**Setup:**
1. Voucher `STATS20` used 3 times:
   - Order 1: £50 subtotal, £10 discount
   - Order 2: £100 subtotal, £20 discount
   - Order 3: £75 subtotal, £15 discount

**Steps:**
1. Click on usage count (3/∞)
2. View statistics modal

**Expected Result:**
- ✅ Total Uses: 3
- ✅ Unique Users: 3
- ✅ Total Discount Given: £45.00
- ✅ Average Discount/Use: £15.00

---

### Test Case 14: Guest Checkout with Voucher

**Objective:** Verify vouchers work for non-logged-in users

**Steps:**
1. Log out (or use incognito)
2. Add items to cart
3. Apply voucher: `SAVE10`
4. Complete checkout as guest

**Expected Result:**
- ✅ Voucher validates correctly
- ✅ Discount applied
- ✅ Order created with voucher
- ✅ Usage recorded with guest email

**Database Check:**
```sql
SELECT * FROM voucher_usages
WHERE guest_email = 'guest@example.com'
AND voucher_id = 'SAVE10_ID';
-- Should return 1 row with userId = NULL
```

---

### Test Case 15: Concurrent Voucher Use

**Objective:** Verify race condition handling for max uses

**Setup:**
1. Voucher with max_uses = 1
2. 2 users apply simultaneously

**Steps:**
1. User A starts checkout with voucher
2. User B starts checkout with same voucher
3. User A completes payment first
4. User B tries to complete payment

**Expected Result:**
- ✅ User A: Order succeeds with discount
- ❌ User B: Error at payment (voucher already used)
- ✅ Only 1 usage recorded
- ✅ Data integrity maintained

---

## HubSpot Integration Testing

### Test Case 16: Contact Creation on First Order

**Objective:** Verify contact syncs to HubSpot on first purchase

**Prerequisites:**
- HubSpot API key configured
- HubSpot custom properties created

**Steps:**
1. New customer places order
   - Email: test@example.com
   - Name: John Doe
   - Phone: 07700900000
2. Order completes successfully
3. Check HubSpot

**Expected Result in HubSpot:**
- ✅ Contact created with email: test@example.com
- ✅ Name: John Doe
- ✅ Phone: 07700900000
- ✅ Lifecycle stage: Customer
- ✅ Custom properties:
  - total_orders: 1
  - total_revenue: £50.00
  - first_order_date: [today]
  - last_order_date: [today]

**Database Check:**
```sql
SELECT * FROM hubspot_contacts WHERE user_id = 'JOHN_DOE_ID';
-- Should have hubspot_id populated
```

---

### Test Case 17: Deal Creation for Order

**Objective:** Verify order creates deal in HubSpot

**Steps:**
1. Place order (Order #ORD-123456)
2. Total: £75.00
3. Check HubSpot Deals

**Expected Result:**
- ✅ Deal created: "Order ORD-123456"
- ✅ Amount: £75.00
- ✅ Stage: Qualified to buy (PENDING status)
- ✅ Associated with contact
- ✅ Custom properties:
  - order_number: ORD-123456
  - order_status: PENDING

---

### Test Case 18: Deal Stage Updates

**Objective:** Verify deal stages update with order status

**Steps:**
1. Admin updates order status:
   - PENDING → CONFIRMED
   - CONFIRMED → PACKING
   - PACKING → OUT_FOR_DELIVERY
   - OUT_FOR_DELIVERY → DELIVERED

**Expected Result in HubSpot:**
| Order Status | Deal Stage |
|-------------|------------|
| PENDING | Qualified to buy |
| CONFIRMED | Presentation scheduled |
| PACKING | Decision maker bought-in |
| OUT_FOR_DELIVERY | Contract sent |
| DELIVERED | Closed won |

**Check Each Stage:**
- ✅ Deal moves to correct stage
- ✅ order_status property updates
- ✅ Contact stats update on DELIVERED

---

### Test Case 19: UTM Parameter Capture

**Objective:** Verify marketing attribution tracking

**Steps:**
1. Visit site with UTM link:
   ```
   https://yoursite.com?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale&utm_term=frozen_food&utm_content=ad_variant_a
   ```
2. Browse products
3. Add to cart
4. Place order
5. Check HubSpot contact

**Expected Result:**
- ✅ UTM params stored in browser (30 days)
- ✅ Contact in HubSpot has:
  - utm_source: facebook
  - utm_medium: cpc
  - utm_campaign: summer_sale
  - utm_term: frozen_food
  - utm_content: ad_variant_a

**Browser Check:**
```javascript
// Open browser console
localStorage.getItem('utm_params')
// Should show stored UTM data
```

**Database Check:**
```sql
SELECT * FROM hubspot_contacts WHERE user_id = 'USER_ID';
-- Should have UTM fields populated
```

---

### Test Case 20: Repeat Customer Stats Update

**Objective:** Verify customer lifetime value tracking

**Setup:**
1. Customer with 1 previous order (£50)
2. Places second order (£75)

**Steps:**
1. Complete second order
2. Check HubSpot contact

**Expected Result:**
- ✅ total_orders: 2 (was 1)
- ✅ total_revenue: £125.00 (was £50)
- ✅ average_order_value: £62.50
- ✅ last_order_date: [today]
- ✅ first_order_date: [unchanged]

---

### Test Case 21: Email Open Tracking

**Objective:** Verify email engagement tracking

**Steps:**
1. Place order
2. Open order confirmation email
3. Check HubSpot

**Expected Result:**
- ✅ Note created on contact timeline
- ✅ Note: "Email open: Order Confirmation"
- ✅ Timestamp recorded

**Check Email HTML:**
```html
<!-- Should contain tracking pixel -->
<img src="https://yoursite.com/api/email-tracking/open?email=...&type=order_confirmation"
     width="1" height="1" style="display:none" />
```

---

### Test Case 22: HubSpot Integration Disabled

**Objective:** Verify system works without HubSpot

**Setup:**
1. Remove/comment out HUBSPOT_API_KEY in .env
2. Restart server

**Steps:**
1. Place order normally
2. Apply voucher
3. Complete checkout

**Expected Result:**
- ✅ Order created successfully
- ✅ Voucher applied correctly
- ✅ Email sent
- ✅ Console log: "HubSpot not configured. Skipping sync."
- ✅ No errors thrown
- ✅ System fully functional

---

### Test Case 23: HubSpot Sync Failure Handling

**Objective:** Verify graceful degradation on HubSpot errors

**Setup:**
1. Invalid HUBSPOT_API_KEY in .env

**Steps:**
1. Place order
2. Check server logs
3. Check order status

**Expected Result:**
- ✅ Order still created successfully
- ✅ Console log: "HubSpot sync failed: [error details]"
- ✅ Error doesn't affect customer
- ✅ Payment processes normally
- ✅ Email still sent

---

## End-to-End Testing Scenarios

### Scenario 1: Complete Purchase Flow with Voucher

**User Story:** First-time customer with marketing campaign voucher

**Steps:**
1. User clicks Facebook ad with UTM:
   ```
   ?utm_source=facebook&utm_medium=cpc&utm_campaign=new_customer
   ```
2. Browses products, adds £60 worth to cart
3. Proceeds to checkout
4. Enters details:
   - Name: Sarah Smith
   - Email: sarah@example.com
   - Address: Complete delivery info
5. Validates postcode (successful)
6. Selects delivery slot
7. Applies voucher: `WELCOME15` (15% off, min £50)
8. Reviews order summary:
   - Subtotal: £60.00
   - Discount: -£9.00
   - Delivery: £5.00
   - Total: £56.00
9. Enters payment details
10. Completes payment

**Expected Results:**

**Database:**
- ✅ Order created with:
  - voucher_id: [WELCOME15_ID]
  - discount_amount: 9.00
  - final_subtotal: 51.00
  - total: 56.00
- ✅ VoucherUsage record created
- ✅ Voucher current_uses incremented
- ✅ HubSpotContact created with UTMs

**HubSpot:**
- ✅ Contact created: sarah@example.com
- ✅ UTM source: facebook
- ✅ Campaign: new_customer
- ✅ Deal created: Order #[NUMBER]
- ✅ Deal amount: £56.00
- ✅ Custom properties set

**Email:**
- ✅ Order confirmation sent
- ✅ Discount line shown
- ✅ Tracking pixel included

**Frontend:**
- ✅ Cart cleared
- ✅ Success page shown
- ✅ UTM params still in localStorage

---

### Scenario 2: Repeat Customer B2B Order

**User Story:** Business customer places second order

**Steps:**
1. Logged-in user (previous order £100)
2. Adds £150 worth of products
3. Applies voucher: `SUMMER25` (25% off)
4. Checks "Business Order"
5. Enters VAT number: GB123456789
6. Enters PO number: PO-2024-001
7. Completes checkout

**Expected Results:**

**Database:**
- ✅ Order marked as business order
- ✅ VAT number saved
- ✅ PO number saved
- ✅ Discount: £37.50 (25% of £150)

**HubSpot:**
- ✅ Contact updated:
  - total_orders: 2
  - total_revenue: £212.50 (£100 + £112.50)
  - average_order_value: £106.25
- ✅ New deal created
- ✅ Both deals associated with contact

---

### Scenario 3: Order Status Workflow

**User Story:** Track order from placement to delivery

**Steps:**
1. Customer places order
2. Admin confirms order → Status: CONFIRMED
3. Admin packs order → Status: PACKING
4. Driver departs → Status: OUT_FOR_DELIVERY
5. Customer receives → Status: DELIVERED

**Expected Results:**

**Emails Sent:**
1. ✅ Order Confirmation (on placement)
2. ✅ Order Being Packed (on PACKING)
3. ✅ Out for Delivery (on OUT_FOR_DELIVERY)

**HubSpot Deal Stages:**
1. ✅ Qualified to buy
2. ✅ Presentation scheduled
3. ✅ Decision maker bought-in
4. ✅ Contract sent
5. ✅ Closed won

**Email Tracking:**
- ✅ Open events tracked for each email
- ✅ Timeline entries in HubSpot

---

## Performance Testing

### Test Case 24: Voucher Validation Performance

**Objective:** Verify validation completes within acceptable time

**Steps:**
1. Apply voucher with 1000+ previous uses
2. Measure validation time

**Expected Result:**
- ✅ Validation completes in < 500ms
- ✅ No database timeout errors
- ✅ Response includes discount amount

**Load Test:**
```bash
# Use Apache Bench
ab -n 100 -c 10 \
  -p voucher.json \
  -T application/json \
  http://localhost:3000/api/vouchers/validate
```

**Expected:**
- ✅ 100 requests complete successfully
- ✅ Average response time < 500ms
- ✅ No 500 errors

---

### Test Case 25: Concurrent Order Creation

**Objective:** Verify system handles simultaneous orders

**Steps:**
1. Simulate 10 users placing orders simultaneously
2. 5 using the same voucher (max_uses = 10)

**Expected Result:**
- ✅ All 10 orders created
- ✅ Voucher usage tracked correctly
- ✅ No race condition errors
- ✅ No duplicate HubSpot contacts

---

## Security Testing

### Test Case 26: SQL Injection Prevention

**Objective:** Verify voucher code input is sanitized

**Steps:**
1. Attempt to apply voucher with SQL injection:
   ```
   CODE'; DROP TABLE vouchers; --
   ```

**Expected Result:**
- ❌ Voucher invalid
- ✅ No SQL query executed
- ✅ Database tables intact
- ✅ Error logged safely

---

### Test Case 27: Admin Authorization

**Objective:** Verify non-admin cannot access voucher management

**Steps:**
1. Log in as regular user
2. Try to access `/admin/vouchers`
3. Try API call:
   ```
   POST /api/vouchers/admin
   ```

**Expected Result:**
- ❌ Access denied
- ✅ Redirect to login or 403 error
- ✅ No vouchers created

---

### Test Case 28: Voucher Code Enumeration

**Objective:** Verify system doesn't leak valid voucher codes

**Setup:**
1. Active voucher: `REAL2024`
2. Invalid code: `FAKE2024`

**Steps:**
1. Try `REAL2024` → Success
2. Try `FAKE2024` → Error

**Expected Result:**
- ✅ Both return generic error message
- ❌ No hint which codes exist
- ✅ No different response times (timing attack prevention)

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] Existing vouchers still validate
- [ ] Previous orders still display correctly
- [ ] HubSpot sync doesn't break existing functionality
- [ ] Cart calculations remain accurate
- [ ] Email templates render properly
- [ ] Admin dashboard loads correctly
- [ ] Guest checkout still works
- [ ] User authentication unchanged

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS)
- [ ] Mobile Safari (iOS)

**Key Areas:**
- Voucher input field
- Discount display
- UTM parameter capture
- localStorage functionality

---

## Troubleshooting Common Issues

### Voucher Not Applying

1. Check voucher is active
2. Verify date range
3. Check minimum order met
4. Confirm max uses not reached
5. Check browser console for errors

### HubSpot Not Syncing

1. Verify HUBSPOT_API_KEY set
2. Check server logs
3. Verify custom properties exist
4. Test API key with curl:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" \
     https://api.hubapi.com/crm/v3/objects/contacts
   ```

### Email Tracking Not Working

1. Verify FRONTEND_URL set correctly
2. Check email HTML source for pixel
3. Test tracking endpoint:
   ```bash
   curl http://localhost:3000/api/email-tracking/open?email=test@example.com
   ```

---

## Test Automation

### Backend API Tests (Recommended)

```javascript
// Example test with Jest
describe('Voucher Validation', () => {
  test('Valid voucher applies discount', async () => {
    const response = await request(app)
      .post('/api/vouchers/validate')
      .send({
        code: 'SAVE10',
        subtotal: 50,
        guestEmail: 'test@example.com'
      });

    expect(response.status).toBe(200);
    expect(response.body.valid).toBe(true);
    expect(response.body.discountAmount).toBe(10);
  });
});
```

### Frontend E2E Tests (Recommended)

```javascript
// Example test with Playwright
test('Apply voucher in checkout', async ({ page }) => {
  await page.goto('/checkout');
  await page.fill('[placeholder="Enter code"]', 'SAVE10');
  await page.click('text=Apply');

  await expect(page.locator('text=Voucher Applied')).toBeVisible();
  await expect(page.locator('text=-£10.00')).toBeVisible();
});
```

---

## Test Coverage Goals

- **Backend API Routes:** 80%+
- **Voucher Service:** 90%+
- **HubSpot Service:** 70%+ (external API)
- **Frontend Components:** 70%+
- **Critical User Flows:** 100%

---

## Sign-Off Checklist

Before production deployment:

**Voucher System:**
- [ ] All 15 voucher test cases pass
- [ ] Performance tests meet targets
- [ ] Security tests pass
- [ ] Admin can create/edit/delete vouchers
- [ ] Customers can apply vouchers
- [ ] Edge cases handled gracefully

**HubSpot Integration:**
- [ ] All 8 HubSpot test cases pass
- [ ] Contacts sync correctly
- [ ] Deals create and update
- [ ] UTM tracking works
- [ ] Email tracking functional
- [ ] Graceful degradation verified

**Overall System:**
- [ ] End-to-end scenarios complete
- [ ] Regression tests pass
- [ ] Browser compatibility verified
- [ ] Production data backup taken
- [ ] Rollback plan documented

---

## Post-Deployment Verification

After deploying to production:

1. **Smoke Tests (30 minutes):**
   - [ ] Place test order with voucher
   - [ ] Verify email received
   - [ ] Check HubSpot contact created
   - [ ] Confirm admin panel accessible

2. **Monitor (24 hours):**
   - [ ] Check error logs
   - [ ] Monitor HubSpot sync failures
   - [ ] Review customer support tickets
   - [ ] Verify voucher usage tracking

3. **Data Integrity (1 week):**
   - [ ] Audit voucher usage counts
   - [ ] Verify HubSpot data matches database
   - [ ] Check for any sync gaps
   - [ ] Review discount calculations in orders

---

## Support Contacts

- **Backend Issues:** Check server logs in `/var/log/app.log`
- **HubSpot Issues:** https://knowledge.hubspot.com
- **Stripe Issues:** https://stripe.com/docs
- **Database Issues:** Check Supabase dashboard

---

**Last Updated:** January 2026
**Version:** 1.0
**Maintainer:** Development Team
