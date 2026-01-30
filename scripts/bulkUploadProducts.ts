import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number;
  priceType: 'PER_KG' | 'PER_PIECE';
  stockQuantity: number;
  isAvailable: boolean;
  imageUrls: string[];
}

// Configuration
const IMAGES_FOLDER = 'C:\\Users\\Dapo\\Downloads\\Yemi-pictures';
const BACKEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com'; // Change this to your admin email
const ADMIN_PASSWORD = 'your_admin_password'; // Change this to your admin password

// Default category - you can change this to the appropriate category ID
let DEFAULT_CATEGORY_ID = '';

// Function to generate slug from product name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

// Function to clean product name from filename
function cleanProductName(filename: string): string {
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
async function login(): Promise<string> {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    return response.data.token;
  } catch (error: any) {
    console.error('Login failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate');
  }
}

// Function to get or create "Seafood" category
async function getOrCreateSeafoodCategory(token: string): Promise<string> {
  try {
    // Try to get existing categories
    const response = await axios.get(`${BACKEND_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const categories = response.data.categories || [];
    const seafoodCategory = categories.find((cat: any) =>
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
  } catch (error: any) {
    console.error('Error getting/creating category:', error.response?.data || error.message);
    throw error;
  }
}

// Function to upload image (with local fallback if Cloudinary not configured)
async function uploadImage(
  imagePath: string,
  token: string
): Promise<string | null> {
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
      }
    );

    if (response.data.urls && response.data.urls.length > 0) {
      return response.data.urls[0];
    }
    return null;
  } catch (error: any) {
    console.error(`Failed to upload image: ${path.basename(imagePath)}`);
    console.error('Error:', error.response?.data?.message || error.message);

    // Return a placeholder or null - we'll handle this gracefully
    return null;
  }
}

// Function to create product
async function createProduct(
  productData: ProductData,
  token: string
): Promise<void> {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/products`,
      productData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(`✓ Created product: ${productData.name}`);
  } catch (error: any) {
    console.error(`✗ Failed to create product: ${productData.name}`);
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Main bulk upload function
async function bulkUploadProducts() {
  console.log('=== Starting Bulk Product Upload ===\n');

  try {
    // Step 1: Login
    console.log('Step 1: Authenticating...');
    const token = await login();
    console.log('✓ Authentication successful\n');

    // Step 2: Get or create category
    console.log('Step 2: Setting up category...');
    DEFAULT_CATEGORY_ID = await getOrCreateSeafoodCategory(token);
    console.log(`✓ Using category ID: ${DEFAULT_CATEGORY_ID}\n`);

    // Step 3: Read all image files
    console.log('Step 3: Reading image files...');
    const files = fs.readdirSync(IMAGES_FOLDER);
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg|webp)$/i.test(file)
    );
    console.log(`✓ Found ${imageFiles.length} images\n`);

    // Step 4: Process each image
    console.log('Step 4: Processing products...\n');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const productName = cleanProductName(file);
      const imagePath = path.join(IMAGES_FOLDER, file);

      console.log(`[${i + 1}/${imageFiles.length}] Processing: ${productName}`);

      try {
        // Upload image
        console.log('  → Uploading image...');
        const imageUrl = await uploadImage(imagePath, token);

        // Prepare product data
        const productData: ProductData = {
          name: productName,
          slug: generateSlug(productName),
          description: `Fresh ${productName} - Description to be added`, // Placeholder
          categoryId: DEFAULT_CATEGORY_ID,
          price: 0.00, // Placeholder - you'll update manually
          priceType: 'PER_KG', // Default - change as needed
          stockQuantity: 100, // Default stock
          isAvailable: false, // Set to false until you add price/description
          imageUrls: imageUrl ? [imageUrl] : [], // Empty array if upload failed
        };

        // Create product
        console.log('  → Creating product...');
        await createProduct(productData, token);
        successCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failCount++;
        console.error(`  ✗ Failed to process ${productName}\n`);
      }
    }

    // Summary
    console.log('\n=== Upload Complete ===');
    console.log(`✓ Successful: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`Total: ${imageFiles.length}\n`);

    console.log('⚠️  NEXT STEPS:');
    console.log('1. Go to admin panel: http://localhost:5173/admin/products');
    console.log('2. Edit each product to add:');
    console.log('   - Correct price');
    console.log('   - Detailed description');
    console.log('   - Price type (PER_KG or PER_PIECE)');
    console.log('   - Set isAvailable to true when ready');
    console.log('\n⚠️  NOTE: If image uploads failed due to Cloudinary config,');
    console.log('   you can upload images manually through the admin panel.');

  } catch (error: any) {
    console.error('\n❌ Bulk upload failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
bulkUploadProducts().catch(console.error);
