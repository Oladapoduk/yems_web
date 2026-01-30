# E-Commerce Platform - Backend

Production-ready backend API for the e-commerce platform built with Node.js, Express, TypeScript, and Prisma.

## Setup Instructions

### 1. Install Dependencies
Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### 2. Set Up Environment Variables
Copy the example environment file:
```bash
copy .env.example .env
```

Then edit `.env` and update the following:

**Required for Development:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing

**Required for Production:**
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `RESEND_API_KEY`: Your Resend API key for emails
- `CLOUDINARY_*`: Cloudinary credentials for image uploads

### 3. Set Up PostgreSQL Database

**Option A: Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database: `CREATE DATABASE ecommerce_db;`
3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db?schema=public"
   ```

**Option B: Cloud Database (Recommended)**
Use a free PostgreSQL database from:
- **Supabase** (https://supabase.com) - Free tier available
- **Railway** (https://railway.app) - Free tier available
- **Neon** (https://neon.tech) - Free tier available

After creating your database, copy the connection string to `DATABASE_URL` in `.env`.

### 4. Run Database Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create all database tables
- Apply the schema

### 5. Seed the Database (Optional)
Create sample data for testing:
```bash
npx ts-node prisma/seed.ts
```

### 6. Start the Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category with products

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   └── categories.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts
│   ├── utils/           # Utility functions
│   │   └── auth.ts
│   ├── prisma.ts        # Prisma client instance
│   └── server.ts        # Express app entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Next Steps

1. **Set up database** (see step 3 above)
2. **Run migrations** (see step 4 above)
3. **Create seed data** for categories and products
4. **Set up Stripe** for payment processing
5. **Set up Resend** for email notifications
6. **Build the frontend** React application

## Testing the API

You can test the API using:
- **Thunder Client** (VS Code extension)
- **Postman**
- **curl** commands

Example: Test health check
```bash
curl http://localhost:3000/health
```

## Production Deployment

For production deployment:
1. Build the TypeScript code: `npm run build`
2. Start the server: `npm start`
3. Deploy to Railway, Render, or AWS
