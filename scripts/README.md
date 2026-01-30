# Bulk Product Upload Script

This script allows you to bulk upload products from a folder of images, using the filenames as product names.

## Prerequisites

1. **Backend must be running**
   ```bash
   cd backend
   npm run dev
   ```

2. **You need admin credentials**
   - Email and password of an admin user

## Setup

1. **Install dependencies:**
   ```bash
   cd scripts
   npm install
   ```

2. **Configure the script:**
   Open `bulkUploadProducts.js` and update these values at the top:
   ```javascript
   const ADMIN_EMAIL = 'your-admin@example.com';  // Your admin email
   const ADMIN_PASSWORD = 'your-password';         // Your admin password
   ```

## How to Run

```bash
cd scripts
npm run bulk-upload
```

## What the Script Does

1. **Authenticates** with your admin credentials
2. **Creates/finds** a "Seafood" category (or uses existing one)
3. **Reads all images** from: `C:\Users\Dapo\Downloads\Yemi-pictures`
4. **For each image:**
   - Cleans up filename to create product name
   - Attempts to upload image to Cloudinary (if configured)
   - Creates product in database with:
     - ✓ Name (from filename)
     - ✓ Auto-generated slug
     - ⚠️ Price: £0.00 (you'll update manually)
     - ⚠️ Description: Placeholder (you'll update manually)
     - ⚠️ Available: No (prevents orders before you add price)
     - ✓ Stock: 100 units
     - ✓ Category: Seafood

## After Running the Script

1. **Go to admin panel:** http://localhost:5173/admin/products
2. **Edit each product** to add:
   - Real price
   - Detailed description
   - Set price type (PER_KG or PER_PIECE)
   - Upload image manually (if Cloudinary upload failed)
   - Mark as "Available" when ready

## Example Output

```
╔════════════════════════════════════════════╗
║   Bulk Product Upload Script              ║
╚════════════════════════════════════════════╝

📋 Step 1: Authenticating...
✓ Authentication successful

📋 Step 2: Setting up category...
✓ Using existing category: Seafood
✓ Using category ID: abc-123-def-456

📋 Step 3: Reading image files...
✓ Found 26 images

📋 Step 4: Processing products...
──────────────────────────────────────────────────

[1/26] Catfish Steak
  → Uploading image...
  ✓ Image uploaded successfully
  → Creating product in database...
  ✓ Created product: Catfish Steak

[2/26] Catfish Whole
  → Uploading image...
  ✓ Image uploaded successfully
  → Creating product in database...
  ✓ Created product: Catfish Whole

... (continues for all products)

══════════════════════════════════════════════════

🎉 UPLOAD COMPLETE!

──────────────────────────────────────────────────
✓ Products created:   26
✓ Images uploaded:    26
✗ Failed:             0
📊 Total processed:   26
──────────────────────────────────────────────────
```

## Troubleshooting

### "Login failed"
- Check your ADMIN_EMAIL and ADMIN_PASSWORD in the script
- Make sure backend is running

### "Image upload failed"
- This is OK! You can upload images manually in the admin panel
- OR configure Cloudinary credentials in `backend/.env`

### "Failed to create product"
- Check if product with same name already exists
- Check database connection
- Look at the error message for details

## Product Name Cleaning Examples

The script automatically cleans up filenames:

| Filename | → | Product Name |
|----------|---|--------------|
| `Catfish Steak.png` | → | `Catfish Steak` |
| `catfish1.png` | → | `Catfish1` |
| `Raw Peeled & Deveined Vannamei Prawns.png` | → | `Raw Peeled & Deveined Vannamei Prawns` |
| `New Zealand Half-Shell Mussels.png` | → | `New Zealand Half-shell Mussels` |

## Notes

- Products are created as **"Not Available"** by default to prevent customers from ordering items without prices
- Default price type is **PER_KG** - change manually for items sold by piece
- Script includes a small delay between uploads to avoid overwhelming the server
- If Cloudinary is not configured, products will be created without images (you can add them manually later)
