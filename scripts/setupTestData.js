const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const bcrypt = require('../backend/node_modules/bcryptjs');

const prisma = new PrismaClient();

async function setupTestData() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Setting Up Test Data                    ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // 1. Create admin user if doesn't exist
    console.log('1️⃣  Creating admin user...');
    const adminEmail = 'admin@olayemi.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    let adminUser;
    if (existingAdmin) {
      console.log('   ℹ️  Admin user already exists\n');
      adminUser = existingAdmin;
    } else {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          phone: '07700900000',
          role: 'ADMIN',
          isVerified: true
        }
      });
      console.log('   ✅ Admin user created\n');
      console.log('   📧 Email: admin@olayemi.com');
      console.log('   🔑 Password: Admin123!\n');
    }

    // 2. Create test vouchers
    console.log('2️⃣  Creating test vouchers...');

    const vouchers = [
      {
        code: 'SAVE10',
        type: 'FIXED',
        value: 10,
        description: 'Get £10 off your order',
        minimumOrder: 30,
        maxUses: 100,
        oneTimePerUser: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'WELCOME15',
        type: 'PERCENTAGE',
        value: 15,
        description: 'Get 15% off your first order',
        minimumOrder: 50,
        maxUses: null,
        oneTimePerUser: true,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      {
        code: 'SUMMER25',
        type: 'PERCENTAGE',
        value: 25,
        description: 'Summer sale - 25% off everything!',
        minimumOrder: 0,
        maxUses: 50,
        oneTimePerUser: false,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    ];

    for (const voucherData of vouchers) {
      const existing = await prisma.voucher.findUnique({
        where: { code: voucherData.code }
      });

      if (existing) {
        console.log(`   ℹ️  ${voucherData.code} already exists`);
      } else {
        await prisma.voucher.create({ data: voucherData });
        console.log(`   ✅ Created ${voucherData.code}`);
      }
    }

    console.log('');

    // 3. Display all vouchers
    console.log('3️⃣  Current vouchers in database:\n');
    const allVouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });

    allVouchers.forEach(v => {
      console.log(`   📌 ${v.code}`);
      console.log(`      Type: ${v.type}`);
      console.log(`      Value: ${v.type === 'FIXED' ? '£' : ''}${v.value}${v.type === 'PERCENTAGE' ? '%' : ''}`);
      console.log(`      Min Order: £${v.minimumOrder}`);
      console.log(`      Uses: ${v.currentUses}/${v.maxUses || '∞'}`);
      console.log(`      Valid: ${v.validFrom.toLocaleDateString()} - ${v.validUntil.toLocaleDateString()}`);
      console.log(`      Active: ${v.isActive ? '✅' : '❌'}`);
      console.log('');
    });

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Setup Complete!                         ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n💡 You can now login with:');
    console.log('   Email: admin@olayemi.com');
    console.log('   Password: Admin123!\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
