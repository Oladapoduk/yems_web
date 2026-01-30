# Olayemi E-Commerce - Railway Deployment Guide

Deploy your e-commerce platform to Railway so your client can preview progress.

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Account** - Push your code to GitHub
2. **Railway Account** - Sign up at https://railway.app (free $5 credit/month)
3. **Supabase Database** - Already set up with `DATABASE_URL`
4. **Stripe Account** - Test mode keys ready
5. **Resend Account** - API key ready

---

## Step 1: Push Code to GitHub

If not already done:

```bash
cd c:\Users\Dapo\Downloads\Olayemi_website

# Initialize git (if needed)
git init

# Create .gitignore
echo "node_modules/
.env
dist/
*.log" > .gitignore

# Add and commit
git add .
git commit -m "Initial commit - E-commerce platform"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/olayemi-ecommerce.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway

### 2.1 Create New Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Select the **backend** folder as root directory

### 2.2 Configure Backend Service

Click on the service, then go to **Settings**:

**Root Directory:** `backend`

**Build Command:** (Railway auto-detects)
```
npm install
```

**Start Command:**
```
npx prisma generate && npm run build && npm start
```

### 2.3 Add Environment Variables

Go to **Variables** tab and add:

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=orders@yourdomain.com
FRONTEND_URL=https://your-frontend.railway.app

# Optional
HUBSPOT_API_KEY=your_hubspot_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 2.4 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://olayemi-backend-production.up.railway.app`)

---

## Step 3: Deploy Frontend on Railway

### 3.1 Add New Service

1. In same project, click **"+ New"**
2. Select **"GitHub Repo"** → Same repository
3. This creates a second service

### 3.2 Configure Frontend Service

**Root Directory:** `frontend`

**Build Command:**
```
npm install && npm run build
```

**Start Command:**
```
npm run preview -- --host --port $PORT
```

### 3.3 Add Environment Variables

Go to **Variables** tab:

```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

**Important:** Replace `your-backend.railway.app` with your actual backend URL from Step 2.4.

### 3.4 Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://olayemi-frontend-production.up.railway.app`)

---

## Step 4: Update Backend FRONTEND_URL

Go back to your **backend service** → **Variables** and update:

```env
FRONTEND_URL=https://your-frontend.railway.app
```

This enables proper CORS and email tracking links.

---

## Step 5: Configure Stripe Webhook (Production)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter URL: `https://your-backend.railway.app/api/orders/webhook/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and update `STRIPE_WEBHOOK_SECRET` in Railway

---

## Step 6: Run Database Migrations

After first deployment, run Prisma migrations:

**Option A: Using Railway CLI**
```bash
npm install -g @railway/cli
railway login
railway link  # Select your project
railway run npx prisma db push
```

**Option B: Through Railway Dashboard**
1. Go to backend service
2. Click **"New"** → **"Database"** → Skip (we use Supabase)
3. Or use Railway's shell feature

---

## Step 7: Create Admin User

After deployment, create your admin user:

1. Open your frontend URL
2. Register a new account with email: `admin@olayemi.com`
3. Connect to Supabase dashboard
4. Go to **Table Editor** → **User** table
5. Set `role` to `ADMIN` for your user

Or run via Railway shell:
```bash
railway run npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@olayemi.com';
EOF
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        RAILWAY                               │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │    Frontend     │  HTTPS  │    Backend      │            │
│  │   (React/Vite)  │ ──────► │   (Express)     │            │
│  │                 │         │                 │            │
│  │ *.railway.app   │         │ *.railway.app   │            │
│  └─────────────────┘         └────────┬────────┘            │
└──────────────────────────────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────┐
          │                             │                      │
          ▼                             ▼                      ▼
   ┌─────────────┐            ┌─────────────┐         ┌─────────────┐
   │  Supabase   │            │   Stripe    │         │   Resend    │
   │  (Database) │            │  (Payments) │         │   (Email)   │
   └─────────────┘            └─────────────┘         └─────────────┘
```

---

## Sharing with Client

Once deployed, share these URLs with your client:

| URL | Purpose |
|-----|---------|
| `https://your-frontend.railway.app` | Main store |
| `https://your-frontend.railway.app/admin` | Admin dashboard |

### Test Credentials
- **Admin Login:** admin@olayemi.com / Admin123!
- **Test Card:** 4242 4242 4242 4242

---

## Troubleshooting

### Build Fails

Check Railway logs for errors. Common issues:

1. **Missing env variables** - Ensure all required vars are set
2. **Prisma issues** - Run `npx prisma generate` in build command

### CORS Errors

Ensure `FRONTEND_URL` in backend matches your frontend domain exactly.

### Database Connection

Verify `DATABASE_URL` is correct and Supabase allows connections from Railway IPs.

### Stripe Webhooks Fail

1. Check webhook URL is correct
2. Verify `STRIPE_WEBHOOK_SECRET` matches
3. Check Railway logs for webhook errors

---

## Cost Estimate

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Railway | $5/month credit | Covers both services for demo |
| Supabase | 500MB free | Database |
| Stripe | Free (test mode) | No charges in test |
| Resend | 100 emails/day | Sufficient for testing |

**Total for demo/preview: $0**

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Railway
- [ ] Backend env variables set
- [ ] Backend domain generated
- [ ] Frontend deployed on Railway
- [ ] Frontend env variables set (with backend URL)
- [ ] Frontend domain generated
- [ ] Backend FRONTEND_URL updated
- [ ] Stripe webhook configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Test order placed successfully
- [ ] Share URLs with client

---

**Your client preview will be live at:** `https://your-frontend.railway.app`
