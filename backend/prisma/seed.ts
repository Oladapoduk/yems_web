import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Frozen Fish',
                slug: 'frozen-fish',
                description: 'Fresh frozen fish from sustainable sources',
                sortOrder: 1
            }
        }),
        prisma.category.create({
            data: {
                name: 'Seafood',
                slug: 'seafood',
                description: 'Premium seafood selection',
                sortOrder: 2
            }
        }),
        prisma.category.create({
            data: {
                name: 'Meat',
                slug: 'meat',
                description: 'Quality meat products',
                sortOrder: 3
            }
        }),
        prisma.category.create({
            data: {
                name: 'Groceries',
                slug: 'groceries',
                description: 'Essential grocery items',
                sortOrder: 4
            }
        }),
        prisma.category.create({
            data: {
                name: 'Packaged Foods',
                slug: 'packaged-foods',
                description: 'Convenient packaged food items',
                sortOrder: 5
            }
        }),
        prisma.category.create({
            data: {
                name: 'Drinks',
                slug: 'drinks',
                description: 'Refreshing beverages',
                sortOrder: 6
            }
        })
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    const products = await Promise.all([
        // Frozen Fish
        prisma.product.create({
            data: {
                name: 'Atlantic Salmon Fillet',
                slug: 'atlantic-salmon-fillet',
                description: 'Fresh frozen Atlantic salmon fillet, rich in Omega-3',
                categoryId: categories[0].id,
                price: 12.99,
                priceType: 'PER_KG',
                weightMin: 800,
                weightMax: 1200,
                stockQuantity: 50,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Keep frozen at -18°C. Once defrosted, do not refreeze.',
                imageUrls: []
            }
        }),
        prisma.product.create({
            data: {
                name: 'Mackerel (Titus)',
                slug: 'mackerel-titus',
                description: 'Whole frozen mackerel, perfect for grilling',
                categoryId: categories[0].id,
                price: 8.99,
                priceType: 'FIXED',
                weightMin: 400,
                weightMax: 600,
                stockQuantity: 100,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Store frozen. Defrost in refrigerator before cooking.',
                imageUrls: []
            }
        }),
        // Seafood
        prisma.product.create({
            data: {
                name: 'King Prawns',
                slug: 'king-prawns',
                description: 'Large king prawns, peeled and deveined',
                categoryId: categories[1].id,
                price: 15.99,
                priceType: 'PER_KG',
                weightMin: 500,
                weightMax: 500,
                stockQuantity: 30,
                isAvailable: true,
                allergens: ['Crustaceans'],
                storageInstructions: 'Keep frozen. Cook from frozen or defrost thoroughly.',
                imageUrls: []
            }
        }),
        // Meat
        prisma.product.create({
            data: {
                name: 'Chicken Breast',
                slug: 'chicken-breast',
                description: 'Skinless chicken breast fillets',
                categoryId: categories[2].id,
                price: 7.99,
                priceType: 'PER_KG',
                weightMin: 1000,
                weightMax: 1000,
                stockQuantity: 75,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep refrigerated. Use within 2 days of defrosting.',
                imageUrls: []
            }
        }),
        // Groceries
        prisma.product.create({
            data: {
                name: 'Plantain',
                slug: 'plantain',
                description: 'Fresh plantain, perfect for frying',
                categoryId: categories[3].id,
                price: 3.99,
                priceType: 'FIXED',
                stockQuantity: 200,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store at room temperature.',
                imageUrls: []
            }
        }),
        // Drinks
        prisma.product.create({
            data: {
                name: 'Tropical Juice',
                slug: 'tropical-juice',
                description: 'Refreshing tropical fruit juice blend',
                categoryId: categories[5].id,
                price: 2.99,
                priceType: 'FIXED',
                stockQuantity: 150,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate after opening. Consume within 3 days.',
                imageUrls: []
            }
        })
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create delivery zones
    const zones = await Promise.all([
        prisma.deliveryZone.create({
            data: {
                name: 'Central London',
                postcodePrefixes: ['SE', 'SW', 'E', 'EC', 'WC'],
                deliveryFee: 5.99,
                minimumOrder: 30.00,
                isActive: true
            }
        }),
        prisma.deliveryZone.create({
            data: {
                name: 'Greater London',
                postcodePrefixes: ['DA', 'RM', 'BR', 'CR', 'IG'],
                deliveryFee: 7.99,
                minimumOrder: 50.00,
                isActive: true
            }
        })
    ]);

    console.log(`✅ Created ${zones.length} delivery zones`);

    // Create admin user
    const adminPassword = await hashPassword('admin123');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@ecommerce.com',
            passwordHash: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
            isVerified: true
        }
    });

    console.log(`✅ Created admin user: ${admin.email}`);
    console.log(`   Password: admin123`);

    // Create search synonyms
    const synonyms = await Promise.all([
        prisma.searchSynonym.create({
            data: {
                term: 'prawns',
                synonyms: ['shrimp', 'king prawns', 'tiger prawns']
            }
        }),
        prisma.searchSynonym.create({
            data: {
                term: 'mackerel',
                synonyms: ['titus', 'scomber']
            }
        }),
        prisma.searchSynonym.create({
            data: {
                term: 'plantain',
                synonyms: ['banana', 'cooking banana']
            }
        })
    ]);

    console.log(`✅ Created ${synonyms.length} search synonyms`);

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
