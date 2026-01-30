# Tanti Foods - Testing Checklist

## Environment Setup

### 1. Database Setup
- [ ] PostgreSQL/Supabase database is running and accessible
- [ ] Run main seed: `npx prisma db seed`
- [ ] Run delivery zones seed: `npx ts-node scripts/seedDeliveryData.ts`
- [ ] Run Nigerian products seed: `npx ts-node scripts/seedNigerianProducts.ts`
- [ ] Verify all tables have data using Prisma Studio: `npx prisma studio`

### 2. Email Configuration (Resend)
- [ ] Sign up for Resend account at https://resend.com
- [ ] Verify your sending domain
- [ ] Get API key from Resend dashboard
- [ ] Update `backend/.env`: `RESEND_API_KEY="re_your_actual_key"`
- [ ] Update `backend/.env`: `FROM_EMAIL="orders@yourdomain.com"`

### 3. Stripe Configuration
- [ ] Verify Stripe test keys in `backend/.env`
- [ ] Set up Stripe webhook for payment confirmation
- [ ] Update `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] Frontend Stripe publishable key in `frontend/.env`

### 4. Cloudinary Configuration (Optional - for product images)
- [ ] Sign up for Cloudinary account
- [ ] Get API credentials
- [ ] Update Cloudinary settings in `backend/.env`:
  ```
  CLOUDINARY_CLOUD_NAME="your_cloud_name"
  CLOUDINARY_API_KEY="your_api_key"
  CLOUDINARY_API_SECRET="your_api_secret"
  ```

---

## Backend Testing

### 1. Server Startup
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Verify server runs on port 3000
- [ ] Check console for errors
- [ ] Test health check: `GET http://localhost:3000/`

### 2. Authentication Endpoints
- [ ] **POST** `/api/auth/register` - Create new user account
- [ ] **POST** `/api/auth/login` - Login with credentials
- [ ] **GET** `/api/auth/me` - Get current user (with auth token)
- [ ] Verify JWT tokens are generated correctly
- [ ] Test admin login with seeded admin:
  - Email: `admin@ecommerce.com`
  - Password: `admin123`

### 3. Product Endpoints
- [ ] **GET** `/api/products` - List all products
- [ ] **GET** `/api/products?category=frozen-fish` - Filter by category
- [ ] **GET** `/api/products?search=mackerel` - Search products
- [ ] **GET** `/api/products/:id` - Get single product
- [ ] **POST** `/api/products` - Create product (admin only)
- [ ] **PUT** `/api/products/:id` - Update product (admin only)
- [ ] **DELETE** `/api/products/:id` - Delete product (admin only)

### 4. Categories Endpoints
- [ ] **GET** `/api/categories` - List all categories
- [ ] Verify 6 categories exist (Frozen Fish, Seafood, Meat, Groceries, Packaged Foods, Drinks)

### 5. Delivery Zone Endpoints
- [ ] **GET** `/api/delivery-zones` - List all zones
- [ ] **POST** `/api/delivery-zones` - Create zone
- [ ] **PUT** `/api/delivery-zones/:id` - Update zone
- [ ] **DELETE** `/api/delivery-zones/:id` - Delete zone
- [ ] **PATCH** `/api/delivery-zones/:id` - Toggle active status

### 6. Delivery Slot Endpoints
- [ ] **GET** `/api/delivery-slots` - List all slots
- [ ] **GET** `/api/delivery-slots?date=2026-01-15` - Filter by date
- [ ] **POST** `/api/delivery-slots` - Create slot
- [ ] **PUT** `/api/delivery-slots/:id` - Update slot
- [ ] **DELETE** `/api/delivery-slots/:id` - Delete slot
- [ ] Verify capacity tracking works (currentBookings/maxOrders)

### 7. Order Endpoints
- [ ] **POST** `/api/orders` - Create order with payment intent
- [ ] **GET** `/api/orders/my-orders` - Get user orders
- [ ] **GET** `/api/orders/:orderNumber` - Get specific order
- [ ] **GET** `/api/orders/admin/all` - Admin view all orders
- [ ] **PATCH** `/api/orders/admin/:orderNumber/status` - Update order status

### 8. Upload Endpoints
- [ ] **POST** `/api/upload/image` - Upload single image
- [ ] **POST** `/api/upload/images` - Upload multiple images
- [ ] **DELETE** `/api/upload/image` - Delete image
- [ ] Verify images are uploaded to Cloudinary
- [ ] Verify URLs are returned correctly

---

## Frontend Testing

### 1. Application Startup
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Verify app runs on port 5173
- [ ] Check browser console for errors
- [ ] Verify TailwindCSS styles load correctly

### 2. Public Pages
- [ ] **Home Page** (`/`)
  - [ ] Hero section displays
  - [ ] Featured products load
  - [ ] Navigation works
- [ ] **Products Page** (`/products`)
  - [ ] All products display
  - [ ] Category filtering works
  - [ ] Search functionality works
  - [ ] Price filtering works
  - [ ] Pagination works
- [ ] **Product Detail Page** (`/products/:id`)
  - [ ] Product details display
  - [ ] Images load
  - [ ] Add to cart works
  - [ ] Quantity selector works
- [ ] **Cart Page** (`/cart`)
  - [ ] Cart items display
  - [ ] Quantity update works
  - [ ] Remove item works
  - [ ] Total calculation correct
  - [ ] Proceed to checkout button works

### 3. Authentication Pages
- [ ] **Login Page** (`/login`)
  - [ ] Login form works
  - [ ] Validation works
  - [ ] JWT token stored in localStorage
  - [ ] Redirects after login
- [ ] **Register Page** (`/register`)
  - [ ] Registration form works
  - [ ] Password validation works
  - [ ] Account created successfully

### 4. Checkout Flow
- [ ] **Checkout Page** (`/checkout`)
  - [ ] Delivery address form displays
  - [ ] Postcode validation works
  - [ ] Delivery zone detection works
  - [ ] Delivery slot selection works
  - [ ] Available slots only show up
  - [ ] Minimum order validation works
  - [ ] Stripe payment element loads
  - [ ] Order summary shows correct totals
  - [ ] Payment submission works
- [ ] **Order Confirmation Page** (`/order-confirmation/:orderNumber`)
  - [ ] Order details display
  - [ ] Order items show
  - [ ] Delivery information correct
  - [ ] Status tracking displays

### 5. User Account Pages
- [ ] **Account Page** (`/account`)
  - [ ] User details display
  - [ ] Edit profile works
- [ ] **Orders Page** (`/orders`)
  - [ ] User orders list
  - [ ] Order details expandable
  - [ ] Order status shows correctly

### 6. Admin Dashboard
- [ ] **Admin Dashboard** (`/admin`)
  - [ ] Only accessible by admin users
  - [ ] Dashboard cards display
  - [ ] Navigation to sub-pages works

- [ ] **Admin Orders** (`/admin/orders`)
  - [ ] All orders display
  - [ ] Status filter works
  - [ ] Search functionality works
  - [ ] Order details expandable
  - [ ] Status update dropdown works
  - [ ] Customer information displays
  - [ ] Delivery details show

- [ ] **Admin Products** (`/admin/products`)
  - [ ] Products list displays
  - [ ] Add product modal opens
  - [ ] Product form validation works
  - [ ] Image upload works
  - [ ] Create product works
  - [ ] Edit product works
  - [ ] Delete product works
  - [ ] Product availability toggle works

- [ ] **Admin Delivery Zones** (`/admin/delivery-zones`)
  - [ ] Zones list displays
  - [ ] Add zone modal opens
  - [ ] Postcode prefix input works
  - [ ] Create zone works
  - [ ] Edit zone works
  - [ ] Delete zone works
  - [ ] Activate/Deactivate toggle works

- [ ] **Admin Delivery Slots** (`/admin/delivery-slots`)
  - [ ] Slots grouped by date
  - [ ] Add slot modal opens
  - [ ] Bulk create slots works
  - [ ] Capacity progress bars display
  - [ ] Edit slot works
  - [ ] Delete slot works
  - [ ] Available toggle works

---

## Email Notifications Testing

### 1. Order Confirmation Email
- [ ] Place a test order
- [ ] Complete Stripe payment
- [ ] Webhook triggers successfully
- [ ] Order confirmation email received
- [ ] Email contains:
  - [ ] Order number
  - [ ] Customer name
  - [ ] Order items with quantities and prices
  - [ ] Delivery address
  - [ ] Delivery date and time slot
  - [ ] Subtotal, delivery fee, and total
  - [ ] Proper HTML formatting
  - [ ] Tanti Foods branding

### 2. Order Status Update Emails
- [ ] Login to admin dashboard
- [ ] Update order status to "PACKED"
- [ ] Verify "Order Packed" email received
- [ ] Update order status to "OUT_FOR_DELIVERY"
- [ ] Verify "Out for Delivery" email received
- [ ] Check email contains:
  - [ ] Order number
  - [ ] Customer name
  - [ ] Delivery time window
  - [ ] Frozen goods reminder

### 3. Email Error Handling
- [ ] Verify emails fail gracefully (don't break order flow)
- [ ] Check backend logs for email errors
- [ ] Confirm orders still process if email fails

---

## Payment Flow Testing

### 1. Stripe Test Cards
Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`
- **Insufficient Funds**: `4000 0000 0000 9995`

### 2. Payment Scenarios
- [ ] Successful payment completes order
- [ ] Payment webhook updates order status to CONFIRMED
- [ ] Payment intent stores correct amount
- [ ] Failed payment doesn't create order
- [ ] Payment metadata includes order number

---

## Business Logic Testing

### 1. Cart Functionality
- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] Cart persists across page refreshes
- [ ] Cart shows correct totals

### 2. Delivery Zone Validation
- [ ] Enter postcode in checkout
- [ ] Verify correct zone detected
- [ ] Verify delivery fee applied
- [ ] Verify minimum order enforced
- [ ] Out-of-zone postcodes rejected

### 3. Delivery Slot Management
- [ ] Available slots only show future dates
- [ ] Fully booked slots hidden
- [ ] Slot capacity decrements on booking
- [ ] Slot unavailable when maxOrders reached

### 4. Order Workflow
- [ ] Order created with PENDING status
- [ ] Payment success changes to CONFIRMED
- [ ] Admin can update to PACKED
- [ ] Admin can update to OUT_FOR_DELIVERY
- [ ] Admin can update to DELIVERED
- [ ] Order numbers are unique

### 5. Stock Management
- [ ] Products show availability status
- [ ] Out of stock products can't be ordered
- [ ] Stock quantity displays correctly

---

## Security Testing

### 1. Authentication & Authorization
- [ ] Unauthenticated users can't access protected routes
- [ ] Non-admin users can't access admin routes
- [ ] JWT tokens expire correctly
- [ ] Password hashing works
- [ ] SQL injection protection

### 2. Input Validation
- [ ] Form validation on client side
- [ ] Server-side validation enforced
- [ ] XSS protection
- [ ] CSRF protection

---

## Performance Testing

### 1. Load Times
- [ ] Homepage loads < 3 seconds
- [ ] Product list loads efficiently
- [ ] Images lazy load
- [ ] API responses < 500ms

### 2. Database Queries
- [ ] Check for N+1 queries
- [ ] Verify database indexes
- [ ] Query performance acceptable

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Mobile Responsiveness

- [ ] Navigation menu works on mobile
- [ ] Product cards stack properly
- [ ] Forms are usable on mobile
- [ ] Cart page mobile friendly
- [ ] Checkout works on mobile
- [ ] Admin dashboard usable on tablet

---

## Known Issues to Test Later

1. **Email Notifications**
   - Need actual Resend API key
   - Need verified domain
   - Test production email delivery

2. **Cloudinary Images**
   - Need actual Cloudinary account
   - Test image uploads end-to-end
   - Test image deletion

3. **Stripe Webhooks**
   - Need to set up webhook endpoint in production
   - Test webhook signing

---

## Production Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Seed data populated
- [ ] Stripe webhook configured
- [ ] Resend domain verified
- [ ] Cloudinary configured
- [ ] SSL certificate installed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Backup strategy in place

---

## Notes

- Admin credentials (development):
  - Email: `admin@ecommerce.com`
  - Password: `admin123`

- Test customer can be created via registration page

- All timestamps are in UTC

- Currency: GBP (£)

- Default delivery zones cover London postcodes

---

**Last Updated**: January 11, 2026
