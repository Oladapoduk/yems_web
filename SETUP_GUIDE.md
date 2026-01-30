# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Stripe account (for payments)
- Resend account (for emails)

## Step 1: Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE olayemi;
```

2. Update `backend/.env` with your database URL:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/olayemi
```

3. Run Prisma migrations:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
```

## Step 2: Backend Configuration

1. Copy `.env.example` to `.env` in the backend folder:
```bash
cd backend
cp .env.example .env
```

2. Fill in all environment variables in `backend/.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/olayemi
JWT_SECRET=your-super-secret-jwt-key-change-this
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=re_your_resend_key
FROM_EMAIL=orders@yourdomain.com
FRONTEND_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

3. Install dependencies and start the server:
```bash
npm install
npm run dev
```

The backend should now be running on http://localhost:3000

## Step 3: Frontend Configuration

1. Create `.env` file in the frontend folder:
```bash
cd frontend
```

2. Add environment variables to `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

3. Install dependencies and start the dev server:
```bash
npm install
npm run dev
```

The frontend should now be running on http://localhost:5173

## Step 4: Seed Initial Data (Optional)

You may want to seed your database with:

### Categories
Create categories using Prisma Studio or API:
```bash
cd backend
npx prisma studio
```

Example categories:
- Frozen Fish
- Seafood
- Meat
- Groceries
- Packaged Foods
- Drinks

### Delivery Zones
Use the admin API to create delivery zones:
```bash
POST http://localhost:3000/api/delivery-zones/admin
Content-Type: application/json

{
  "name": "Central London",
  "postcodePrefixes": ["SE", "SW", "E", "W"],
  "deliveryFee": 5.99,
  "minimumOrder": 30.00
}
```

### Delivery Slots
Create delivery slots for the next week:
```bash
POST http://localhost:3000/api/delivery-slots/admin/bulk
Content-Type: application/json

{
  "startDate": "2025-12-02",
  "endDate": "2025-12-08",
  "timeSlots": [
    { "startTime": "09:00", "endTime": "12:00", "maxOrders": 20 },
    { "startTime": "12:00", "endTime": "15:00", "maxOrders": 20 },
    { "startTime": "15:00", "endTime": "18:00", "maxOrders": 20 }
  ]
}
```

### Products
Add products via Prisma Studio or create an admin UI.

## Step 5: Test the Application

1. **Register a customer account**: http://localhost:5173/register
2. **Browse products**: http://localhost:5173/products
3. **Add items to cart**: Click "Add to Cart" on products
4. **Test checkout flow**:
   - Go to cart
   - Proceed to checkout
   - Enter shipping details
   - Validate postcode
   - Select delivery slot
   - Use Stripe test card: `4242 4242 4242 4242` (any future expiry, any CVC)

## Stripe Test Cards

For testing payments:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Stripe Webhook Setup (Development)

1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli
```

2. Login to Stripe:
```bash
stripe login
```

3. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:3000/api/orders/webhook/stripe
```

4. Copy the webhook signing secret to your `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Port Already in Use
- Change PORT in backend/.env
- Update VITE_API_URL in frontend/.env

### CORS Errors
- Ensure FRONTEND_URL in backend/.env matches frontend URL
- Check CORS middleware in server.ts

### Stripe Payment Fails
- Verify STRIPE_SECRET_KEY is correct
- Check webhook secret if using webhooks
- Use test cards for development

## Default Admin Access

To create an admin user, manually update the database:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

Then access admin dashboard at: http://localhost:5173/admin

## Production Deployment

See [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for production checklist.

## Support

For issues or questions:
1. Check the logs in backend console
2. Check browser console for frontend errors
3. Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture details
