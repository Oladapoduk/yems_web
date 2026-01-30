const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

// ===== CONFIGURATION - UPDATE THESE VALUES =====
const IMAGES_FOLDER = 'C:\\Users\\Dapo\\Downloads\\Yemi-pictures';
const BACKEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@olayemifoods.com'; // UPDATE THIS
const ADMIN_PASSWORD = 'Admin123!'; // UPDATE THIS
// ===============================================

let DEFAULT_CATEGORY_ID = '';

// Function to generate slug from product name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

// Function to clean product name from filename
function cleanProductName(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');

  // Clean up the name
  return nameWithoutExt
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Function to login and get auth token
async function login() {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate. Check ADMIN_EMAIL and ADMIN_PASSWORD in the script.');
  }
}

// Function to get or create "Seafood" category
async function getOrCreateSeafoodCategory(token) {
  try {
    // Try to get existing categories
    const response = await axios.get(`${BACKEND_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const categories = response.data.categories || [];
    const seafoodCategory = categories.find(cat =>
      cat.name.toLowerCase().includes('seafood') ||
      cat.name.toLowerCase().includes('fish')
    );

    if (seafoodCategory) {
      console.log(`✓ Using existing category: ${seafoodCategory.name}`);
      return seafoodCategory.id;
    }

    // Create new category if not found
    console.log('Creating new "Seafood" category...');
    const createResponse = await axios.post(
      `${BACKEND_URL}/api/categories`,
      {
        name: 'Seafood',
        slug: 'seafood',
        description: 'Fresh seafood and fish products',
        imageUrl: '',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log('✓ Created new category: Seafood');
    return createResponse.data.category.id;
  } catch (error) {
    console.error('Error getting/creating category:', error.response?.data || error.message);
    throw error;
  }
}

// Function to upload image (with local fallback if Cloudinary not configured)
async function uploadImage(imagePath, token) {
  try {
    const formData = new FormData();
    formData.append('images', fs.createReadStream(imagePath));
    formData.append('folder', 'products');

    const response = await axios.post(
      `${BACKEND_URL}/api/upload/images`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    if (response.data.urls && response.data.urls.length > 0) {
      return response.data.urls[0];
    }
    return null;
  } catch (error) {
    console.error(`    ⚠️  Image upload failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Function to create product
async function createProduct(productData, token) {
  try {
    await axios.post(
      `${BACKEND_URL}/api/products`,
      productData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`  ✓ Created product: ${productData.name}`);
  } catch (error) {
    console.error(`  ✗ Failed to create product: ${productData.name}`);
    console.error('    Error:', error.response?.data || error.message);
    throw error;
  }
}

// Main bulk upload function
async function bulkUploadProducts() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Bulk Product Upload Script              ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Step 1: Login
    console.log('📋 Step 1: Authenticating...');
    const token = await login();
    console.log('✓ Authentication successful\n');

    // Step 2: Get or create category
    console.log('📋 Step 2: Setting up category...');
    DEFAULT_CATEGORY_ID = await getOrCreateSeafoodCategory(token);
    console.log(`✓ Using category ID: ${DEFAULT_CATEGORY_ID}\n`);

    // Step 3: Read all image files
    console.log('📋 Step 3: Reading image files...');
    if (!fs.existsSync(IMAGES_FOLDER)) {
      throw new Error(`Folder not found: ${IMAGES_FOLDER}`);
    }

    const files = fs.readdirSync(IMAGES_FOLDER);
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg|webp)$/i.test(file)
    );
    console.log(`✓ Found ${imageFiles.length} images\n`);

    if (imageFiles.length === 0) {
      console.log('❌ No image files found in the folder.');
      return;
    }

    // Step 4: Process each image
    console.log('📋 Step 4: Processing products...\n');
    console.log('─'.repeat(50));

    let successCount = 0;
    let failCount = 0;
    let imagesUploadedCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const productName = cleanProductName(file);
      const imagePath = path.join(IMAGES_FOLDER, file);

      console.log(`\n[${i + 1}/${imageFiles.length}] ${productName}`);

      try {
        // Upload image
        console.log('  → Uploading image...');
        const imageUrl = await uploadImage(imagePath, token);

        if (imageUrl) {
          imagesUploadedCount++;
          console.log('  ✓ Image uploaded successfully');
        } else {
          console.log('  ⚠️  Image upload skipped (will add manually)');
        }

        // Prepare product data
        const productData = {
          name: productName,
          slug: generateSlug(productName),
          description: `Fresh ${productName}. Price and detailed description to be added.`,
          categoryId: DEFAULT_CATEGORY_ID,
          price: 0.01, // Placeholder - update manually (0.01 instead of 0 to pass validation)
          priceType: 'PER_KG', // Default
          stockQuantity: 100,
          isAvailable: false, // Set to false until price is added
          imageUrls: imageUrl ? [imageUrl] : [],
        };

        // Create product
        console.log('  → Creating product in database...');
        await createProduct(productData, token);
        successCount++;

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        failCount++;
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('\n🎉 UPLOAD COMPLETE!\n');
    console.log('─'.repeat(50));
    console.log(`✓ Products created:   ${successCount}`);
    console.log(`✓ Images uploaded:    ${imagesUploadedCount}`);
    console.log(`✗ Failed:             ${failCount}`);
    console.log(`📊 Total processed:   ${imageFiles.length}`);
    console.log('─'.repeat(50));

    console.log('\n⚠️  IMPORTANT NEXT STEPS:\n');
    console.log('1. Open admin panel: http://localhost:5173/admin/products');
    console.log('2. For EACH product, click Edit and update:');
    console.log('   • Price (currently set to £0.00)');
    console.log('   • Description (add detailed info)');
    console.log('   • Price Type (PER_KG or PER_PIECE)');
    console.log('   • Upload image (if not auto-uploaded)');
    console.log('   • Set "Available" to YES when ready');
    console.log('\n💡 TIP: Products are set to "Not Available" by default');
    console.log('   to prevent customers from ordering before you add prices.\n');

    if (imagesUploadedCount === 0) {
      console.log('⚠️  CLOUDINARY NOTE:');
      console.log('   No images were uploaded (Cloudinary not configured).');
      console.log('   You\'ll need to upload images manually in the admin panel');
      console.log('   OR configure Cloudinary credentials in backend/.env\n');
    }

  } catch (error) {
    console.error('\n❌ BULK UPLOAD FAILED\n');
    console.error('Error:', error.message);
    console.log('\n🔍 Common issues:');
    console.log('   • Backend not running (run: cd backend && npm run dev)');
    console.log('   • Wrong admin credentials in this script');
    console.log('   • Database connection issue');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
bulkUploadProducts().catch(console.error);
