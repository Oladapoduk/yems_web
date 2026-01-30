const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test data
const testVoucher = {
  code: 'SAVE10',
  type: 'FIXED',
  value: 10,
  description: 'Get £10 off your order',
  minimumOrder: 30,
  maxUses: 100,
  oneTimePerUser: true,
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  isActive: true
};

const testVoucher2 = {
  code: 'WELCOME15',
  type: 'PERCENTAGE',
  value: 15,
  description: 'Get 15% off your first order',
  minimumOrder: 50,
  maxUses: null,
  oneTimePerUser: true,
  validFrom: new Date().toISOString(),
  validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
  isActive: true
};

async function testVoucherAPI() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Voucher API Testing                     ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Step 1: Login as admin to get token
    console.log('1️⃣  Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@olayemi.com',
      password: 'Admin123!'
    }).catch(err => {
      console.log('   ⚠️  Admin login failed. Make sure you have an admin user created.');
      console.log('   Using test without authentication (will fail on protected routes)\n');
      return null;
    });

    const token = loginResponse?.data?.token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (token) {
      console.log('   ✅ Logged in successfully\n');
    }

    // Step 2: Create vouchers
    console.log('2️⃣  Creating test vouchers...');

    try {
      const createResponse1 = await axios.post(`${API_URL}/vouchers/admin`, testVoucher, { headers });
      console.log(`   ✅ Created voucher: ${createResponse1.data.voucher.code}`);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.log(`   ℹ️  Voucher ${testVoucher.code} already exists`);
      } else {
        console.log(`   ❌ Failed to create ${testVoucher.code}:`, err.response?.data?.message || err.message);
      }
    }

    try {
      const createResponse2 = await axios.post(`${API_URL}/vouchers/admin`, testVoucher2, { headers });
      console.log(`   ✅ Created voucher: ${createResponse2.data.voucher.code}`);
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already exists')) {
        console.log(`   ℹ️  Voucher ${testVoucher2.code} already exists`);
      } else {
        console.log(`   ❌ Failed to create ${testVoucher2.code}:`, err.response?.data?.message || err.message);
      }
    }

    console.log('');

    // Step 3: Get all vouchers
    console.log('3️⃣  Fetching all vouchers...');
    try {
      const allVouchersResponse = await axios.get(`${API_URL}/vouchers/admin/all`, { headers });
      console.log(`   ✅ Found ${allVouchersResponse.data.vouchers.length} vouchers\n`);

      allVouchersResponse.data.vouchers.forEach(v => {
        console.log(`      • ${v.code} - ${v.type} ${v.value}${v.type === 'PERCENTAGE' ? '%' : '£'} off`);
        console.log(`        Min order: £${v.minimumOrder}, Uses: ${v.currentUses}/${v.maxUses || '∞'}, Active: ${v.isActive}`);
      });
      console.log('');
    } catch (err) {
      console.log(`   ❌ Failed to fetch vouchers:`, err.response?.data?.message || err.message, '\n');
    }

    // Step 4: Validate vouchers (public endpoint)
    console.log('4️⃣  Testing voucher validation...\n');

    // Test valid FIXED voucher
    console.log('   Testing SAVE10 (£10 off, min £30):');
    try {
      const validateResponse = await axios.post(`${API_URL}/vouchers/validate`, {
        code: 'SAVE10',
        subtotal: 50,
        guestEmail: 'test@example.com'
      });
      console.log(`   ✅ Valid! Discount: £${validateResponse.data.discountAmount}\n`);
    } catch (err) {
      console.log(`   ❌ Validation failed:`, err.response?.data?.message || err.message, '\n');
    }

    // Test valid PERCENTAGE voucher
    console.log('   Testing WELCOME15 (15% off, min £50):');
    try {
      const validateResponse = await axios.post(`${API_URL}/vouchers/validate`, {
        code: 'WELCOME15',
        subtotal: 100,
        guestEmail: 'test2@example.com'
      });
      console.log(`   ✅ Valid! Discount: £${validateResponse.data.discountAmount}\n`);
    } catch (err) {
      console.log(`   ❌ Validation failed:`, err.response?.data?.message || err.message, '\n');
    }

    // Test below minimum order
    console.log('   Testing SAVE10 with subtotal below minimum (£20):');
    try {
      const validateResponse = await axios.post(`${API_URL}/vouchers/validate`, {
        code: 'SAVE10',
        subtotal: 20,
        guestEmail: 'test3@example.com'
      });
      console.log(`   ✅ Valid! Discount: £${validateResponse.data.discountAmount}\n`);
    } catch (err) {
      console.log(`   ✅ Correctly rejected:`, err.response?.data?.message, '\n');
    }

    // Test invalid code
    console.log('   Testing invalid voucher code:');
    try {
      const validateResponse = await axios.post(`${API_URL}/vouchers/validate`, {
        code: 'INVALID',
        subtotal: 50,
        guestEmail: 'test4@example.com'
      });
      console.log(`   ❌ Should have failed but didn't\n`);
    } catch (err) {
      console.log(`   ✅ Correctly rejected:`, err.response?.data?.message, '\n');
    }

    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Testing Complete!                       ║');
    console.log('╚════════════════════════════════════════════╝');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testVoucherAPI();
