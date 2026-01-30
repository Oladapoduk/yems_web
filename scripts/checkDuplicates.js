const { PrismaClient } = require('../backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   Check Duplicate Products                ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`📊 Total products in database: ${products.length}\n`);

    // Find duplicates by name
    const nameMap = new Map();
    products.forEach(product => {
      const name = product.name.toLowerCase().trim();
      if (!nameMap.has(name)) {
        nameMap.set(name, []);
      }
      nameMap.get(name).push(product);
    });

    const duplicates = Array.from(nameMap.entries()).filter(([_, prods]) => prods.length > 1);

    if (duplicates.length === 0) {
      console.log('✓ No duplicate products found!\n');
    } else {
      console.log(`⚠️  Found ${duplicates.length} duplicate product names:\n`);
      console.log('─'.repeat(80));

      duplicates.forEach(([name, prods]) => {
        console.log(`\n"${name}" (${prods.length} copies):`);
        prods.forEach((p, index) => {
          console.log(`  ${index + 1}. ID: ${p.id.substring(0, 8)}... | Created: ${p.createdAt.toISOString().split('T')[0]} | Category: ${p.category?.name || 'None'}`);
        });
      });

      console.log('\n' + '─'.repeat(80));
      console.log('\n💡 To delete duplicates, you can:');
      console.log('1. Use the admin panel: http://localhost:5173/admin/products');
      console.log('2. Or run the deleteDuplicates.js script (keeps newest version)');
    }

    // Category breakdown
    console.log('\n📂 Products by Category:\n');
    const categoryMap = new Map();
    products.forEach(product => {
      const categoryName = product.category?.name || 'Uncategorized';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, 0);
      }
      categoryMap.set(categoryName, categoryMap.get(categoryName) + 1);
    });

    Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`);
      });

    console.log('');

  } catch (error) {
    console.error('\n❌ Error checking duplicates:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
