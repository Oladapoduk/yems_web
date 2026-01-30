import prisma from '../src/prisma';

const categoriesWithProducts = [
    {
        name: 'Bakery products',
        slug: 'bakery-products',
        description: 'Fresh baked goods and pastries',
        products: [
            { name: 'Bread', price: 5.00, priceType: 'FIXED' as const },
            { name: 'Meat pie', price: 3.50, priceType: 'FIXED' as const },
            { name: 'Cakes', price: 15.00, priceType: 'FIXED' as const },
            { name: 'Chin chin', price: 4.00, priceType: 'FIXED' as const }
        ]
    },
    {
        name: 'Smoked Frozen Seafoods',
        slug: 'smoked-frozen-seafoods',
        description: 'Premium smoked seafood products',
        products: [
            { name: 'Smoked catfish', price: 12.00, priceType: 'PER_KG' as const },
            { name: 'Smoked mackerel', price: 10.00, priceType: 'PER_KG' as const },
            { name: 'Smoked blue whiting fish (Panla)', price: 9.00, priceType: 'PER_KG' as const },
            { name: 'Smoked prawns', price: 18.00, priceType: 'PER_KG' as const }
        ]
    },
    {
        name: 'Frozen Seafoods',
        slug: 'frozen-seafoods',
        description: 'Fresh frozen seafood',
        products: [
            { name: 'Catfish', price: 10.00, priceType: 'PER_KG' as const },
            { name: 'Mackerel', price: 8.00, priceType: 'PER_KG' as const },
            { name: 'Prawns', price: 15.00, priceType: 'PER_KG' as const },
            { name: 'Blue whiting fish (Panla)', price: 7.00, priceType: 'PER_KG' as const },
            { name: 'Tilapia', price: 9.00, priceType: 'PER_KG' as const },
            { name: 'Pangasius', price: 8.50, priceType: 'PER_KG' as const },
            { name: 'Red beam fish', price: 11.00, priceType: 'PER_KG' as const }
        ]
    },
    {
        name: 'Nigerian Snacks',
        slug: 'nigerian-snacks',
        description: 'Traditional Nigerian snacks',
        products: [
            { name: 'Peanuts', price: 3.00, priceType: 'FIXED' as const },
            { name: 'Kuli kuli', price: 2.50, priceType: 'FIXED' as const },
            { name: 'Burger', price: 4.50, priceType: 'FIXED' as const }
        ]
    },
    {
        name: 'Oils',
        slug: 'oils',
        description: 'Cooking oils',
        products: [
            { name: 'Palm oil', price: 8.00, priceType: 'FIXED' as const },
            { name: 'Peanut oil', price: 10.00, priceType: 'FIXED' as const }
        ]
    },
    {
        name: 'Flour',
        slug: 'flour',
        description: 'Traditional Nigerian flours',
        products: [
            { name: 'Plantain flour (elubo ogede)', price: 6.00, priceType: 'FIXED' as const },
            { name: 'Yam flour (elubo isu)', price: 7.00, priceType: 'FIXED' as const }
        ]
    },
    {
        name: 'Essentials',
        slug: 'essentials',
        description: 'Kitchen essentials',
        products: [
            { name: 'Peeled beans', price: 5.00, priceType: 'FIXED' as const }
        ]
    },
    {
        name: 'Spices',
        slug: 'spices',
        description: 'Traditional Nigerian spices',
        products: [
            { name: 'Ground pepper (ata kuku)', price: 4.00, priceType: 'FIXED' as const },
            { name: 'Ground crayfish', price: 6.00, priceType: 'FIXED' as const }
        ]
    }
];

async function seedData() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Delete existing data
        console.log('🗑️  Cleaning existing data...');
        await prisma.product.deleteMany({});
        await prisma.category.deleteMany({});
        console.log('✅ Cleaned existing data\n');

        // Create categories and products
        let totalProducts = 0;

        for (const categoryData of categoriesWithProducts) {
            console.log(`📁 Creating category: ${categoryData.name}`);

            const category = await prisma.category.create({
                data: {
                    name: categoryData.name,
                    slug: categoryData.slug,
                    description: categoryData.description,
                    sortOrder: categoriesWithProducts.indexOf(categoryData)
                }
            });

            console.log(`   ✅ Created category: ${category.name}`);

            // Create products for this category
            for (const productData of categoryData.products) {
                const product = await prisma.product.create({
                    data: {
                        name: productData.name,
                        slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        categoryId: category.id,
                        price: productData.price,
                        priceType: productData.priceType,
                        stockQuantity: 100, // Default stock
                        isAvailable: true,
                        imageUrls: [], // Empty for now, you can add later
                        allergens: []
                    }
                });
                console.log(`      ✅ Created product: ${product.name} (£${product.price}/${productData.priceType === 'PER_KG' ? 'kg' : 'item'})`);
                totalProducts++;
            }
            console.log('');
        }

        console.log('🎉 Seeding completed successfully!');
        console.log(`📊 Summary:`);
        console.log(`   - Categories created: ${categoriesWithProducts.length}`);
        console.log(`   - Products created: ${totalProducts}`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
