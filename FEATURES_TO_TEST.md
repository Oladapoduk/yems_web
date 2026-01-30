# Olayemi E-Commerce Platform - Complete Testing & Setup Guide

**Version:** 2.0
**Last Updated:** January 2026
**Status:** Ready for Production Testing

---

## Table of Contents

1. [Environment Variables Setup](#1-environment-variables-setup)
2. [Service Subscriptions Required](#2-service-subscriptions-required)
3. [Complete Feature Testing Checklist](#3-complete-feature-testing-checklist)
4. [Test Accounts & Data](#4-test-accounts--data)
5. [Testing Procedures](#5-testing-procedures)

---

## 1. Environment Variables Setup

### Backend Environment Variables (`backend/.env`)

```env
# ═══════════════════════════════════════════════════════════════
# REQUIRED - Application will not start without these
# ═══════════════════════════════════════════════════════════════

# Environment
NODE_ENV=development                    # Options: development, production

# Server
PORT=3000                               # Backend server port

# Database (Supabase PostgreSQL) - REQUIRED
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Authentication - REQUIRED
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d                       # Token expiry (e.g., 7d, 24h)

# Stripe Payments - REQUIRED
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx  # Get from Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx # Get from Stripe Webhooks

# Email Service (Resend) - REQUIRED
RESEND_API_KEY=re_xxxxxxxxxxxx          # Get from Resend Dashboard
FROM_EMAIL=orders@yourdomain.com        # Your verified sender email

# Frontend URL - REQUIRED (for email links, CORS, email tracking)
FRONTEND_URL=http://localhost:5173

# ═══════════════════════════════════════════════════════════════
# OPTIONAL - Enhanced features (system works without these)
# ═══════════════════════════════════════════════════════════════

# Cloudinary - Image Uploads (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# HubSpot CRM - Contact & Order Tracking (Optional)
HUBSPOT_API_KEY=your_hubspot_private_app_access_token
```

### Frontend Environment Variables (`frontend/.env`)

```env
# ═══════════════════════════════════════════════════════════════
# REQUIRED - Frontend will not work without these
# ═══════════════════════════════════════════════════════════════

# API URL
VITE_API_URL=http://localhost:3000/api

# Stripe Publishable Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

---

## 2. Service Subscriptions Required

### REQUIRED SERVICES

| Service | Purpose | Free Tier | Sign Up URL | What You Get |
|---------|---------|-----------|-------------|--------------|
| **Supabase** | PostgreSQL Database | Yes (500MB, 2 projects) | https://supabase.com | `DATABASE_URL` connection string |
| **Stripe** | Payment Processing | Yes (Test mode free) | https://stripe.com | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Resend** | Transactional Emails | Yes (100 emails/day) | https://resend.com | `RESEND_API_KEY`, verified domain for `FROM_EMAIL` |

### OPTIONAL SERVICES

| Service | Purpose | Free Tier | Sign Up URL | What You Get |
|---------|---------|-----------|-------------|--------------|
| **Cloudinary** | Image Hosting/CDN | Yes (25GB storage) | https://cloudinary.com | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **HubSpot** | CRM Integration | Yes (Free CRM forever) | https://hubspot.com | `HUBSPOT_API_KEY` (Private App access token) |

---

### Service Setup Instructions

#### A. Supabase (Database) - REQUIRED

1. Go to https://supabase.com and create account
2. Create new project (choose region closest to you)
3. Wait for project to initialize (~2 min)
4. Go to **Settings** → **Database** → **Connection string**
5. Select **URI** tab and copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

**Test Connection:**
```bash
cd backend
npx prisma db push
# Should complete successfully with "Your database is now in sync"
```

#### B. Stripe (Payments) - REQUIRED

1. Go to https://stripe.com and create account
2. **Stay in Test mode** (toggle at top of dashboard)
3. Go to **Developers** → **API keys**
   - Copy **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`
   - Copy **Publishable key** (`pk_test_...`) → `VITE_STRIPE_PUBLISHABLE_KEY`
4. Go to **Developers** → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://your-domain.com/api/orders/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

**Test Cards:**
| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure required |

#### C. Resend (Emails) - REQUIRED

1. Go to https://resend.com and create account
2. Go to **API Keys** → Create new API key
3. Copy API key → `RESEND_API_KEY`
4. Go to **Domains** → Add your domain (or use sandbox for testing)
5. Set `FROM_EMAIL` to your verified sender address

**Test (optional):**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"from":"your@domain.com","to":"test@test.com","subject":"Test","html":"<p>Test</p>"}'
```

#### D. HubSpot CRM (Optional)

See detailed guide: `docs/HUBSPOT_SETUP.md`

**Quick Setup:**
1. Create HubSpot account at https://hubspot.com
2. Go to **Settings** → **Integrations** → **Private Apps**
3. Create app with CRM scopes
4. Copy access token → `HUBSPOT_API_KEY`

---

## 3. Complete Feature Testing Checklist

### Section A: CUSTOMER SHOPPING FEATURES

#### A1. Product Catalog & Search
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A1.1 | View all products | Go to `/products` | Grid of products displays | ☐ |
| A1.2 | Filter by category | Click category filter | Only filtered products shown | ☐ |
| A1.3 | Search products | Type "fish" in search | Fish products appear | ☐ |
| A1.4 | Search synonyms | Type "titus" | Mackerel products appear (synonym) | ☐ |
| A1.5 | Autocomplete dropdown | Type "mac" | Suggestions dropdown appears | ☐ |
| A1.6 | Keyboard navigation | Use arrow keys in search | Selection moves through items | ☐ |
| A1.7 | Product details | Click any product | Full details, images, price shown | ☐ |
| A1.8 | Out of stock | View unavailable product | "Out of Stock" badge shown | ☐ |

#### A2. Shopping Cart
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A2.1 | Add to cart | Click "Add to Cart" | Item added, cart icon updates | ☐ |
| A2.2 | Update quantity | Change quantity in cart | Total recalculates | ☐ |
| A2.3 | Remove item | Click remove | Item gone from cart | ☐ |
| A2.4 | Cart persistence | Refresh page | Cart items still there | ☐ |
| A2.5 | Cart across sessions | Close & reopen browser | Cart restored | ☐ |
| A2.6 | Empty cart | Remove all items | "Your cart is empty" shown | ☐ |

#### A3. Checkout Flow (CRITICAL)
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A3.1 | Enter shipping | Fill all required fields | Form validates correctly | ☐ |
| A3.2 | Valid postcode | Enter "SW1A 1AA" | "Delivers to [Zone]" message | ☐ |
| A3.3 | Invalid postcode | Enter "ZZ99 9ZZ" | "We don't deliver" error | ☐ |
| A3.4 | Minimum order | Cart below zone minimum | Error shows required amount | ☐ |
| A3.5 | Select delivery slot | Pick date and time | Slot selected, proceed enabled | ☐ |
| A3.6 | Fully booked slot | View maxed slot | Shows "Fully Booked" | ☐ |
| A3.7 | Successful payment | Card: 4242424242424242 | Order confirmed, redirect | ☐ |
| A3.8 | Declined payment | Card: 4000000000000002 | "Card declined" error | ☐ |
| A3.9 | Confirmation page | After payment | Order number & summary shown | ☐ |
| A3.10 | Confirmation email | After payment | Email received with details | ☐ |

#### A4. Voucher/Discount System (NEW)
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A4.1 | Apply FIXED voucher | Enter "SAVE10" | £10 discount applied | ☐ |
| A4.2 | Apply PERCENTAGE voucher | Enter "WELCOME15" | 15% calculated & applied | ☐ |
| A4.3 | Invalid code | Enter "INVALID123" | "Invalid voucher code" error | ☐ |
| A4.4 | Expired voucher | Enter expired code | "Voucher has expired" error | ☐ |
| A4.5 | Below minimum order | Voucher with min £50, cart £30 | "Minimum order required" error | ☐ |
| A4.6 | Max uses reached | Voucher at limit | "Usage limit reached" error | ☐ |
| A4.7 | One-time per user | Use same code twice | "Already used" error on 2nd | ☐ |
| A4.8 | Remove voucher | Click X on applied voucher | Discount removed, total updates | ☐ |
| A4.9 | Voucher in email | Complete order with voucher | Discount line in confirmation | ☐ |
| A4.10 | Guest can use voucher | Checkout without login | Voucher applies for guests | ☐ |
| A4.11 | Discount before payment | Check Stripe amount | Stripe charged discounted total | ☐ |

#### A5. User Accounts
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A5.1 | Register account | Fill registration form | Account created, logged in | ☐ |
| A5.2 | Login | Enter credentials | Successfully logged in | ☐ |
| A5.3 | Invalid login | Wrong password | "Invalid credentials" error | ☐ |
| A5.4 | View order history | Go to `/orders` | Past orders listed | ☐ |
| A5.5 | Order Again | Click "Order Again" button | All items added to cart | ☐ |
| A5.6 | Account page | Go to `/account` | Profile info shown | ☐ |
| A5.7 | Logout | Click logout | Session cleared, redirected | ☐ |

#### A6. Order Tracking
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| A6.1 | View order status | Go to order page | Status stepper displayed | ☐ |
| A6.2 | Status: Confirmed | Admin confirms | Stepper updates | ☐ |
| A6.3 | Status: Packing | Admin marks packing | Stepper shows "Being Packed" | ☐ |
| A6.4 | Status: Out for Delivery | Admin dispatches | Stepper shows "On Its Way" | ☐ |
| A6.5 | Status: Delivered | Admin completes | Stepper shows "Delivered" | ☐ |
| A6.6 | Email on status change | Each status update | Email sent to customer | ☐ |

---

### Section B: ADMIN FEATURES

#### B1. Dashboard Access
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B1.1 | Admin login | Login as admin@olayemi.com | Dashboard accessible | ☐ |
| B1.2 | Non-admin blocked | Login as customer | Admin routes blocked | ☐ |
| B1.3 | Dashboard loads | Go to `/admin` | All sections visible | ☐ |

#### B2. Product Management
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B2.1 | View products | Go to `/admin/products` | Product list displays | ☐ |
| B2.2 | Create product | Fill form, save | Product in list & store | ☐ |
| B2.3 | Edit product | Modify fields, save | Changes reflected | ☐ |
| B2.4 | Toggle availability | Click toggle | Product hides/shows in store | ☐ |
| B2.5 | Delete product | Click delete, confirm | Product removed | ☐ |
| B2.6 | Upload image | Add image | Image displays on product | ☐ |

#### B3. Category Management
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B3.1 | View categories | Go to `/admin/categories` | Category list | ☐ |
| B3.2 | Create category | Fill form, save | Category in navigation | ☐ |
| B3.3 | Edit category | Modify, save | Changes reflected | ☐ |
| B3.4 | Reorder categories | Change sort order | Order updates in store | ☐ |
| B3.5 | Delete category | Delete empty category | Category removed | ☐ |

#### B4. Order Management
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B4.1 | View all orders | Go to `/admin/orders` | Order list with filters | ☐ |
| B4.2 | View order details | Click order | Full breakdown shown | ☐ |
| B4.3 | Update status | Change dropdown | Status updates, email sent | ☐ |
| B4.4 | Filter by status | Select filter | Only matching orders | ☐ |
| B4.5 | Search orders | Search by number | Order found | ☐ |

#### B5. Substitution & Refunds
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B5.1 | Propose substitution | Admin marks item | Email sent to customer | ☐ |
| B5.2 | Customer accepts | Click accept link | Item status updated | ☐ |
| B5.3 | Customer declines | Click decline link | Refund auto-processed | ☐ |
| B5.4 | Stripe refund | Decline substitution | Refund in Stripe dashboard | ☐ |
| B5.5 | Refund email | Decline substitution | Confirmation email sent | ☐ |

#### B6. Delivery Zones
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B6.1 | View zones | Go to `/admin/delivery-zones` | Zone list | ☐ |
| B6.2 | Create zone | Add postcodes, fee, min | Zone available in checkout | ☐ |
| B6.3 | Edit zone | Modify fee/minimum | Changes affect checkout | ☐ |
| B6.4 | Disable zone | Toggle inactive | Postcodes no longer served | ☐ |
| B6.5 | Delete zone | Remove zone | Zone gone | ☐ |

#### B7. Delivery Slots
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B7.1 | View slots | Go to `/admin/delivery-slots` | Slot calendar | ☐ |
| B7.2 | Create slot | Add date, time, capacity | Slot in checkout | ☐ |
| B7.3 | Edit capacity | Change max orders | Capacity updated | ☐ |
| B7.4 | Disable slot | Toggle unavailable | Slot hidden from checkout | ☐ |
| B7.5 | View bookings | Check current count | Shows X/Y booked | ☐ |

#### B8. Voucher Management (NEW)
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B8.1 | View vouchers | Go to `/admin/vouchers` | Voucher list | ☐ |
| B8.2 | Create FIXED voucher | Type=FIXED, value=10 | £10 off voucher created | ☐ |
| B8.3 | Create PERCENTAGE | Type=PERCENTAGE, value=15 | 15% off voucher created | ☐ |
| B8.4 | Set minimum order | MinOrder=50 | Requires £50+ cart | ☐ |
| B8.5 | Set max uses | MaxUses=100 | Limited to 100 uses | ☐ |
| B8.6 | Set validity dates | From/Until dates | Works only in date range | ☐ |
| B8.7 | View statistics | Click usage count | Stats modal appears | ☐ |
| B8.8 | Edit voucher | Modify value | Updated value applies | ☐ |
| B8.9 | Deactivate voucher | Toggle inactive | Voucher stops working | ☐ |
| B8.10 | Delete voucher | Click delete | Voucher removed | ☐ |

#### B9. Analytics
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| B9.1 | View analytics | Go to `/admin/analytics` | Charts display | ☐ |
| B9.2 | Sales metrics | Check dashboard | Revenue shown | ☐ |
| B9.3 | Order count | Check orders | Total displayed | ☐ |

---

### Section C: INTEGRATIONS

#### C1. Stripe Payment Integration
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| C1.1 | Payment intent created | Start checkout | Intent in Stripe | ☐ |
| C1.2 | Successful payment | Complete purchase | Webhook triggers, order confirmed | ☐ |
| C1.3 | Failed payment | Use declined card | Error shown, no order | ☐ |
| C1.4 | Refund processing | Admin refunds | Stripe refund created | ☐ |
| C1.5 | Webhook security | Send fake webhook | Rejected (bad signature) | ☐ |
| C1.6 | Voucher discount in Stripe | Order with voucher | Stripe shows discounted amount | ☐ |

#### C2. Email Integration (Resend)
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| C2.1 | Order confirmation | Complete order | Email with order details | ☐ |
| C2.2 | Order packed | Admin marks PACKED | "Being Packed" email | ☐ |
| C2.3 | Out for delivery | Admin marks OUT_FOR_DELIVERY | "On Its Way" email | ☐ |
| C2.4 | Substitution request | Admin proposes substitute | Email with Accept/Decline | ☐ |
| C2.5 | Refund confirmation | Decline substitute | Refund email | ☐ |
| C2.6 | Voucher discount | Order with voucher | Discount in email | ☐ |
| C2.7 | Email tracking pixel | Open email | Tracking pixel loads | ☐ |

#### C3. HubSpot CRM (Optional)
| ID | Test Case | Steps | Expected Result | ☐ |
|----|-----------|-------|-----------------|---|
| C3.1 | Contact creation | New customer orders | Contact in HubSpot | ☐ |
| C3.2 | Contact update | Repeat customer | Stats updated | ☐ |
| C3.3 | Deal creation | Order placed | Deal with amount | ☐ |
| C3.4 | Deal stage update | Status changes | Stage updates | ☐ |
| C3.5 | UTM tracking | Visit with ?utm_source=... | UTM on contact | ☐ |
| C3.6 | Lifetime value | Multiple orders | Total/AOV updated | ☐ |
| C3.7 | No HubSpot key | Remove API key | System works normally | ☐ |

---

## 4. Test Accounts & Data

### Pre-Created Accounts

Run this command to create test data:
```bash
cd scripts
node setupTestData.js
```

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@olayemi.com | Admin123! | Full admin access |
| Customer | test@example.com | Test123! | Regular testing |

### Test Voucher Codes

| Code | Type | Value | Min Order | Max Uses | Status |
|------|------|-------|-----------|----------|--------|
| SAVE10 | Fixed | £10 | £30 | 100 | Active |
| WELCOME15 | Percentage | 15% | £50 | Unlimited | Active |
| SUMMER25 | Percentage | 25% | £0 | 50 | Active |

### Stripe Test Cards

| Card Number | Expiry | CVC | Result |
|-------------|--------|-----|--------|
| 4242 4242 4242 4242 | Any future | Any | Success |
| 4000 0000 0000 0002 | Any future | Any | Declined |
| 4000 0025 0000 3155 | Any future | Any | 3D Secure |
| 4000 0000 0000 9995 | Any future | Any | Insufficient funds |

---

## 5. Testing Procedures

### Quick Start (30 minutes)

**1. Environment Setup (5 min)**
```bash
# Backend
cd backend
cp .env.example .env
# Fill required variables in .env
npm install
npx prisma db push

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Fill required variables in .env
npm install
```

**2. Start Services (2 min)**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**3. Create Test Data (2 min)**
```bash
cd scripts
node setupTestData.js
```

**4. Smoke Tests (15 min)**
- [ ] Homepage loads at http://localhost:5173
- [ ] Products display
- [ ] Add item to cart
- [ ] Apply voucher SAVE10
- [ ] Complete checkout with test card
- [ ] Check confirmation email
- [ ] Login as admin
- [ ] View orders in admin

**5. Voucher Quick Test (5 min)**
- [ ] Apply "SAVE10" - £10 off
- [ ] Apply "WELCOME15" - 15% off
- [ ] Try invalid code - Error shown
- [ ] Remove voucher - Discount gone

### Full Testing (4+ hours)

Execute all test cases in Section 3 above.

**Priority Order:**
1. ⭐ Section A3 (Checkout) - Critical path
2. ⭐ Section A4 (Vouchers) - New feature
3. ⭐ Section C1 (Stripe) - Payments
4. ⭐ Section C2 (Emails) - Communications
5. Section B4 (Orders Admin)
6. Section B8 (Vouchers Admin)
7. All remaining tests

### Pre-Production Checklist

- [ ] All environment variables set for production
- [ ] Stripe switched to LIVE mode
- [ ] Real domain verified in Resend
- [ ] Database migrated: `npx prisma migrate deploy`
- [ ] HTTPS configured
- [ ] All critical tests pass
- [ ] Test order with real card
- [ ] Verify email delivery
- [ ] Admin access working
- [ ] Backup strategy confirmed

---

## Quick Reference

### Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Admin Dashboard | http://localhost:5173/admin |

### Admin Routes

| Route | Purpose |
|-------|---------|
| /admin | Dashboard |
| /admin/orders | Order management |
| /admin/products | Product management |
| /admin/categories | Category management |
| /admin/vouchers | Voucher management (NEW) |
| /admin/delivery-zones | Delivery zones |
| /admin/delivery-slots | Delivery slots |
| /admin/analytics | Analytics |

### API Endpoints

**Public:**
- `POST /api/vouchers/validate` - Validate voucher code
- `GET /api/products` - Get products
- `POST /api/orders` - Create order

**Admin:**
- `GET /api/vouchers/admin/all` - List vouchers
- `POST /api/vouchers/admin` - Create voucher
- `PATCH /api/vouchers/admin/:id` - Update voucher
- `DELETE /api/vouchers/admin/:id` - Delete voucher

---

## Additional Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| HubSpot Setup | `docs/HUBSPOT_SETUP.md` | Detailed CRM integration guide |
| Testing Guide | `docs/TESTING_GUIDE.md` | Extended test procedures |
| Implementation | `docs/IMPLEMENTATION_COMPLETE.md` | Full feature summary |

---

## Summary of Services Needed

### Minimum Required (System will work):
1. ✅ **Supabase** - Database (free tier)
2. ✅ **Stripe** - Payments (test mode free)
3. ✅ **Resend** - Emails (100/day free)

### Optional (Enhanced features):
4. ☐ **Cloudinary** - Image hosting
5. ☐ **HubSpot** - CRM integration

### Total Cost: **£0** for development/testing with free tiers

---

**Testing Status:** Ready for comprehensive testing
**Next Step:** Set up environment variables and run smoke tests

**Happy Testing! 🧪**
