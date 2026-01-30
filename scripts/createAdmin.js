const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ===== CONFIGURATION - UPDATE THESE VALUES =====
const ADMIN_EMAIL = 'admin@olayemifoods.com';  // Change to your desired admin email
const ADMIN_PASSWORD = 'Admin123!';             // Change to your desired password
const ADMIN_FIRST_NAME = 'Admin';               // Change to your first name
const ADMIN_LAST_NAME = 'User';                 // Change to your last name
// ===============================================

async function createAdminUser() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Create Admin User Script                ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Check if user already exists
    console.log('🔍 Checking if admin user already exists...');
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingUser) {
      console.log(`\n⚠️  User with email "${ADMIN_EMAIL}" already exists!`);
      console.log('\nOptions:');
      console.log('1. Use this existing user for bulk upload');
      console.log('2. Change ADMIN_EMAIL in this script to create a different admin');
      console.log('3. Delete the existing user from database first\n');

      console.log('User details:');
      console.log(`  Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Role: ${existingUser.role}`);

      if (existingUser.role === 'ADMIN') {
        console.log('\n✓ This user is already an admin!');
        console.log('You can use these credentials for the bulk upload script.');
      } else {
        console.log('\n⚠️  This user is NOT an admin. Converting to admin...');
        await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: {
            role: 'ADMIN'
          },
        });
        console.log('✓ User converted to admin successfully!');
      }

      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        passwordHash: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        role: 'ADMIN',
        isVerified: true, // Auto-verify admin
      },
    });

    console.log('\n' + '═'.repeat(50));
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!');
    console.log('═'.repeat(50));
    console.log('\n✓ Admin credentials:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Name:     ${ADMIN_FIRST_NAME} ${ADMIN_LAST_NAME}`);
    console.log(`  Role:     ADMIN`);
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!\n');

    console.log('📋 Next steps:');
    console.log('1. Update bulkUploadProducts.js with these credentials:');
    console.log(`   ADMIN_EMAIL = '${ADMIN_EMAIL}'`);
    console.log(`   ADMIN_PASSWORD = '${ADMIN_PASSWORD}'`);
    console.log('2. Run the bulk upload script: npm run bulk-upload\n');

  } catch (error) {
    console.error('\n❌ ERROR CREATING ADMIN USER\n');
    console.error('Error:', error.message);
    console.error('\n🔍 Common issues:');
    console.error('   • Database connection issue');
    console.error('   • Backend dependencies not installed');
    console.error('   • Prisma client not generated (run: cd ../backend && npx prisma generate)');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser().catch(console.error);
