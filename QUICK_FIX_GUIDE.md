# Quick Fix Guide - Database Setup Issues

## Problem
The backend is trying to connect to a Prisma-specific database that doesn't exist. You need a real PostgreSQL database.

## Solution - Choose ONE option:

---

## Option 1: Use Supabase (EASIEST - Recommended for Testing)

### Steps:

1. **Create Free Database:**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub or email
   - Create a new project
   - Name: `olayemi`
   - Password: Choose a strong password
   - Region: Choose closest to you
   - Click "Create new project"

2. **Get Connection String:**
   - Wait for project to finish setting up (2-3 minutes)
   - Go to Project Settings → Database
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string (looks like: `postgresql://postgres.[project-ref]:[password]@...`)
   - **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password

3. **Update `.env` File:**
   ```bash
   cd c:\Users\Dapo\Downloads\Olayemi_website\backend
   ```

   Edit `.env` file and replace the DATABASE_URL line with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

4. **Add Minimal Config:**
   Add these temporary values to `.env`:
   ```env
   JWT_SECRET="temporary-secret-key-for-testing"
   STRIPE_SECRET_KEY="sk_test_temp"
   STRIPE_WEBHOOK_SECRET="whsec_temp"
   RESEND_API_KEY="re_temp"
   FROM_EMAIL="test@test.com"
   CLOUDINARY_CLOUD_NAME="temp"
   CLOUDINARY_API_KEY="temp"
   CLOUDINARY_API_SECRET="temp"
   FRONTEND_URL="http://localhost:5173"
   PORT=3000
   NODE_ENV="development"
   ```

5. **Run Migration:**
   ```bash
   npx prisma migrate dev --name initial_setup
   ```

6. **Start Backend:**
   ```bash
   npm run dev
   ```

---

## Option 2: Install PostgreSQL Locally

### Steps:

1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download and install PostgreSQL 16
   - During installation:
     - Remember the password you set for `postgres` user
     - Keep default port: 5432

2. **Create Database:**
   - Open "pgAdmin 4" (installed with PostgreSQL)
   - Right-click "Databases" → Create → Database
   - Name: `olayemi`
   - Click "Save"

3. **Update `.env` File:**
   Replace DATABASE_URL in `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/olayemi"
   ```
   Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation

4. **Add Other Config:**
   Add these to `.env`:
   ```env
   JWT_SECRET="temporary-secret-key-for-testing"
   STRIPE_SECRET_KEY="sk_test_temp"
   STRIPE_WEBHOOK_SECRET="whsec_temp"
   RESEND_API_KEY="re_temp"
   FROM_EMAIL="test@test.com"
   CLOUDINARY_CLOUD_NAME="temp"
   CLOUDINARY_API_KEY="temp"
   CLOUDINARY_API_SECRET="temp"
   FRONTEND_URL="http://localhost:5173"
   PORT=3000
   NODE_ENV="development"
   ```

5. **Run Migration:**
   ```bash
   cd c:\Users\Dapo\Downloads\Olayemi_website\backend
   npx prisma migrate dev --name initial_setup
   ```

6. **Start Backend:**
   ```bash
   npm run dev
   ```

---

## After Database is Working:

### 1. Start Backend:
```bash
cd c:\Users\Dapo\Downloads\Olayemi_website\backend
npm run dev
```

### 2. Start Frontend (NEW terminal):
```bash
cd c:\Users\Dapo\Downloads\Olayemi_website\frontend
npm run dev
```

### 3. Create Test Data:

#### A. Create Admin User:
1. Go to http://localhost:5173/register
2. Register with any email/password
3. **Make user admin:**
   ```bash
   # In backend folder:
   npx prisma studio
   ```
4. In browser at http://localhost:5555:
   - Click "User"
   - Find your user
   - Change `role` from `CUSTOMER` to `ADMIN`
   - Click "Save 1 change"

#### B. Create Categories:
In Prisma Studio (http://localhost:5555):
- Click "Category"
- Click "Add record"
- Fill in:
  - `name`: Frozen Fish
  - `slug`: frozen-fish
  - `description`: Fresh frozen fish
- Click "Save 1 change"
- Repeat for: Seafood, Meat, Groceries, Drinks

#### C. Create Products:
1. Login at http://localhost:5173/login (with your admin account)
2. Go to http://localhost:5173/admin/products
3. Click "Add Product"
4. Fill in product details
5. Save

---

## Common Issues:

### Issue: "Can't reach database server"
**Solution:** Database is not running or connection string is wrong
- Check PostgreSQL is running (Windows Services)
- Verify DATABASE_URL in .env
- Test connection: `npx prisma db push`

### Issue: "authentication failed"
**Solution:** Wrong password in connection string
- Check password in DATABASE_URL matches your PostgreSQL password

### Issue: "database 'olayemi' does not exist"
**Solution:** Create the database first
- Use pgAdmin or Prisma Studio to create database named `olayemi`

### Issue: Frontend shows blank page
**Solution:**
1. Check browser console (F12) for errors
2. Ensure backend is running on http://localhost:3000
3. Check `VITE_API_URL` in `frontend/.env` is correct

---

## Verification Steps:

1. **Test Backend:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","message":"E-commerce API is running"}`

2. **Test Frontend:**
   - Open http://localhost:5173
   - Should see homepage

3. **Test Database:**
   ```bash
   npx prisma studio
   ```
   - Opens at http://localhost:5555
   - Should see all tables

---

## Next Steps After Database Works:

1. **Add real API keys** (optional for testing):
   - Stripe: https://stripe.com
   - Resend: https://resend.com
   - Cloudinary: https://cloudinary.com

2. **Create delivery zones:**
   ```bash
   # Use Prisma Studio or API
   ```

3. **Create delivery slots:**
   ```bash
   # Use Prisma Studio or API
   ```

---

**Choose Option 1 (Supabase) if you want to get started quickly without installing PostgreSQL!**
