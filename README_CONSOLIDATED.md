# Olayemi E-Commerce Website - Setup Guide

This guide will walk you through setting up the Olayemi website for local development.

## Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Stripe** account (for test payments)
- **Resend** account (for email notifications)

---

## 1. Database Setup

1.  **Create a PostgreSQL database** named `olayemi`.
2.  **Configure environment**:
    - Go to the `backend` folder.
    - Copy `.env.example` to `.env`.
    - Update `DATABASE_URL` with your local credentials:
      ```env
      DATABASE_URL=postgresql://username:password@localhost:5432/olayemi
      ```
3.  **Run Migrations**:
    ```bash
    cd backend
    npm install
    npx prisma generate
    npx prisma migrate dev
    ```

---

## 2. Backend Configuration

1.  **Environment Variables**:
    - Open `backend/.env`.
    - Fill in the required keys:
      - `JWT_SECRET`: A secure random string.
      - `STRIPE_SECRET_KEY`: From your Stripe dashboard.
      - `STRIPE_WEBHOOK_SECRET`: See "Stripe Webhook Setup" below.
      - `RESEND_API_KEY`: From your Resend dashboard.
      - `FROM_EMAIL`: The email address you've verified in Resend.
2.  **Start Backend**:
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

---

## 3. Frontend Configuration

1.  **Environment Variables**:
    - Go to the `frontend` folder.
    - Create a `.env` file (you can use `.env.example` as a template).
    - Add your Stripe publishable key:
      ```env
      VITE_API_URL=http://localhost:3000/api
      VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
      ```
2.  **Start Frontend**:
    ```bash
    npm install
    npm run dev
    ```
    The website will be available at `http://localhost:5173`.

---

## 4. Stripe Webhook Setup

To process payments correctly in development, you need the Stripe CLI:

1.  **Install & Login**: `stripe login`
2.  **Listen**:
    ```bash
    stripe listen --forward-to localhost:3000/api/orders/webhook/stripe
    ```
3.  **Copy Secret**: Take the "webhook signing secret" (`whsec_...`) and add it to `backend/.env` as `STRIPE_WEBHOOK_SECRET`.

---

## 5. Initial Data (Optional)

- **Admin Access**: To make yourself an admin, register an account on the site, then run this SQL in your database:
  ```sql
  UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
  ```
- **Categories/Zones**: Use the Admin sections in the app or Prisma Studio (`npx prisma studio` in `backend`) to add initial categories and delivery zones.

---

## 6. Testing Flow

1.  Register at `http://localhost:5173/register`.
2.  Browse products and add to cart.
3.  Checkout using a Stripe test card: `4242 4242 4242 4242`.
