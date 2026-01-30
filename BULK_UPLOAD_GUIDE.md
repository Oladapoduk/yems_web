# Bulk Upload Guide - 26 Seafood Products

This guide will help you bulk upload all 26 products from the Yemi-pictures folder.

## 📋 Quick Overview

You'll run 3 simple commands to:
1. Install script dependencies
2. Create an admin user
3. Bulk upload all 26 products

Then you'll manually edit each product to add prices and descriptions.

---

## 🚀 Step-by-Step Instructions

### **Step 1: Make sure Backend is Running**

Open a terminal and run:

```bash
cd backend
npm run dev
```

Keep this terminal open. You should see:
```
✓ Server running on http://localhost:3000
✓ Connected to database
```

---

### **Step 2: Install Script Dependencies**

Open a **NEW terminal** and run:

```bash
cd scripts
npm install
```

This will install the required packages (axios, form-data, prisma client, bcryptjs).

---

### **Step 3: Create Admin User**

Before uploading products, you need admin credentials.

**Option A: Use default credentials (quickest)**

Just run:
```bash
npm run create-admin
```

This will create an admin user with:
- Email: `admin@olayemifoods.com`
- Password: `Admin123!`

**Option B: Use custom credentials**

1. Open `scripts/createAdmin.js`
2. Change these lines at the top:
   ```javascript
   const ADMIN_EMAIL = 'your-email@example.com';
   const ADMIN_PASSWORD = 'YourSecurePassword123!';
   const ADMIN_FIRST_NAME = 'Your';
   const ADMIN_LAST_NAME = 'Name';
   ```
3. Save the file
4. Run: `npm run create-admin`

**Expected output:**
```
╔════════════════════════════════════════════╗
║   Create Admin User Script                ║
╚════════════════════════════════════════════╝

🔍 Checking if admin user already exists...
🔐 Hashing password...
👤 Creating admin user...

═══════════════════════════════════════════════
🎉 ADMIN USER CREATED SUCCESSFULLY!
═══════════════════════════════════════════════

✓ Admin credentials:
  Email:    admin@olayemifoods.com
  Password: Admin123!
  Name:     Admin User
  Role:     ADMIN

⚠️  IMPORTANT: Save these credentials securely!
```

---

### **Step 4: Update Bulk Upload Script with Credentials**

1. Open `scripts/bulkUploadProducts.js`
2. Find these lines near the top (around line 8-9):
   ```javascript
   const ADMIN_EMAIL = 'admin@example.com';
   const ADMIN_PASSWORD = 'your_admin_password';
   ```
3. Replace with your admin credentials:
   ```javascript
   const ADMIN_EMAIL = 'admin@olayemifoods.com';
   const ADMIN_PASSWORD = 'Admin123!';
   ```
4. Save the file

---

### **Step 5: Run Bulk Upload**

```bash
npm run bulk-upload
```

**This will:**
- ✓ Login with your admin credentials
- ✓ Create/find a "Seafood" category
- ✓ Process all 26 images from `C:\Users\Dapo\Downloads\Yemi-pictures`
- ✓ Upload images to Cloudinary (if configured) or skip
- ✓ Create products in database

**Expected output:**
```
╔════════════════════════════════════════════╗
║   Bulk Product Upload Script              ║
╚════════════════════════════════════════════╝

📋 Step 1: Authenticating...
✓ Authentication successful

📋 Step 2: Setting up category...
✓ Using category ID: xxx-xxx-xxx

📋 Step 3: Reading image files...
✓ Found 26 images

📋 Step 4: Processing products...
──────────────────────────────────────────────────

[1/26] Catfish Steak
  → Uploading image...
  ⚠️  Image upload skipped (will add manually)
  → Creating product in database...
  ✓ Created product: Catfish Steak

[2/26] Catfish Whole
  → Uploading image...
  ⚠️  Image upload skipped (will add manually)
  → Creating product in database...
  ✓ Created product: Catfish Whole

... (continues for all 26 products)

═══════════════════════════════════════════════
🎉 UPLOAD COMPLETE!
═══════════════════════════════════════════════

✓ Products created:   26
✓ Images uploaded:    0
✗ Failed:             0
📊 Total processed:   26

⚠️  CLOUDINARY NOTE:
   No images were uploaded (Cloudinary not configured).
   You'll need to upload images manually in the admin panel
```

---

### **Step 6: Add Prices and Descriptions Manually**

Now go to the admin panel to complete each product:

1. **Open admin panel:** http://localhost:5173/admin/products
2. **Login** with your admin credentials
3. **For EACH of the 26 products:**
   - Click the ✏️ (pencil) Edit button
   - **Upload image** (from `C:\Users\Dapo\Downloads\Yemi-pictures`)
   - **Add price** (currently £0.00)
   - **Add description** (currently placeholder)
   - **Select price type:** PER_KG or PER_PIECE
   - **Set "Available"** to YES
   - Click **Save**

---

## 📊 Products That Will Be Created

All 26 products from your folder:

1. Catfish Steak
2. Catfish Whole
3. Catfish1
4. Cooked And Peeled Prawns
5. Croaker Steak
6. Denton Snapper
7. Eja-kika
8. Hake Steaks
9. Herring Flaps
10. Little Tuna
11. Mackerel Fillets
12. New Zealand Half-shell Mussels
13. Pangasius Fillets
14. Pangasius Portion
15. Pangasius Steak
16. Raw Head On Shell On Prawns
17. Raw Peeled & Deveined Vannamei Prawns
18. Red Snapper Fillets
19. Red Snapper Portion
20. Ribbon Fish Steak
21. Squid
22. Trevally
23. Whole Croaker
24. Whole Herrings
25. Whole Mackerel
26. Whole Tilapia

---

## ⚠️ Important Notes

### About Images
- Images will **NOT upload automatically** because Cloudinary is not configured
- You'll upload images **manually** in the admin panel (drag & drop)
- This is actually easier since you can review each product

### About Availability
- All products are created as **"Not Available"** by default
- This prevents customers from ordering items without prices
- Mark as "Available" only after you've added price & description

### About Categories
- All products will be in the **"Seafood"** category
- You can change the category later if needed

---

## 🔧 Troubleshooting

### "Login failed"
- Check that you updated the credentials in `bulkUploadProducts.js`
- Make sure backend is running (`cd backend && npm run dev`)

### "Database connection error"
- Make sure backend is running
- Check that `backend/.env` has correct `DATABASE_URL`

### "Product already exists"
- Script will skip products that already exist
- Delete duplicates from admin panel first, or
- Edit the product name in the script

### "Cannot find module"
- Run `npm install` in the scripts folder
- Make sure you're in the `scripts` directory when running commands

---

## 💡 Tips

1. **Start backend first** - Always have backend running before the scripts
2. **Save credentials** - Write down your admin email/password
3. **Review before saving** - Check each product in admin panel before marking as available
4. **Batch similar items** - Edit all prawns together, all catfish together, etc.
5. **Use consistent pricing** - Decide on PER_KG vs PER_PIECE for similar items

---

## ✅ Summary Commands

```bash
# Terminal 1 (keep running)
cd backend
npm run dev

# Terminal 2
cd scripts
npm install                 # Install dependencies
npm run create-admin        # Create admin user
npm run bulk-upload        # Upload all products
```

Then visit: http://localhost:5173/admin/products

---

**Questions?** Check the detailed README in the `scripts/` folder or the error messages from the terminal.
