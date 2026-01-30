import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Nigerian products...');

    // Get existing categories
    const frozenFish = await prisma.category.findUnique({ where: { slug: 'frozen-fish' } });
    const seafood = await prisma.category.findUnique({ where: { slug: 'seafood' } });
    const meat = await prisma.category.findUnique({ where: { slug: 'meat' } });
    const groceries = await prisma.category.findUnique({ where: { slug: 'groceries' } });
    const packagedFoods = await prisma.category.findUnique({ where: { slug: 'packaged-foods' } });
    const drinks = await prisma.category.findUnique({ where: { slug: 'drinks' } });

    if (!frozenFish || !seafood || !meat || !groceries || !packagedFoods || !drinks) {
        console.error('❌ Please run the main seed file first to create categories');
        process.exit(1);
    }

    // Nigerian Frozen Fish Products
    const fishProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Mackerel (Titus)',
                slug: 'mackerel-titus',
                description: 'Premium frozen mackerel fish, perfect for Nigerian soups and stews',
                categoryId: frozenFish.id,
                price: 8.99,
                priceType: 'FIXED',
                weightMin: 400,
                weightMax: 600,
                stockQuantity: 100,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Keep frozen at -18°C. Once defrosted, cook within 24 hours.',
                imageUrls: ['/images/products/mackerel-titus.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Croaker Fish',
                slug: 'croaker-fish',
                description: 'Whole frozen croaker fish, ideal for pepper soup and grilling',
                categoryId: frozenFish.id,
                price: 12.99,
                priceType: 'PER_KG',
                weightMin: 500,
                weightMax: 800,
                stockQuantity: 75,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Store frozen. Defrost in refrigerator before cooking.',
                imageUrls: ['https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Tilapia',
                slug: 'tilapia',
                description: 'Fresh frozen tilapia, cleaned and gutted',
                categoryId: frozenFish.id,
                price: 10.99,
                priceType: 'PER_KG',
                weightMin: 600,
                weightMax: 1000,
                stockQuantity: 80,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Keep frozen. Do not refreeze once thawed.',
                imageUrls: ['https://images.unsplash.com/photo-1594002494803-fd4599580ca0?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Catfish (Panla)',
                slug: 'catfish-panla',
                description: 'Frozen catfish, perfect for point and kill style preparation',
                categoryId: frozenFish.id,
                price: 14.99,
                priceType: 'PER_KG',
                weightMin: 1000,
                weightMax: 1500,
                stockQuantity: 60,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Keep frozen until ready to use.',
                imageUrls: ['https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Stockfish (Okporoko)',
                slug: 'stockfish-okporoko',
                description: 'Premium dried stockfish, essential for authentic Nigerian soups',
                categoryId: frozenFish.id,
                price: 18.99,
                priceType: 'FIXED',
                weightMin: 200,
                weightMax: 300,
                stockQuantity: 50,
                isAvailable: true,
                allergens: ['Fish'],
                storageInstructions: 'Store in a cool dry place. Soak before use.',
                imageUrls: ['https://images.unsplash.com/photo-1596464870020-0083ca1e67fa?w=800&q=80']
            }
        })
    ]);

    console.log(`✅ Created ${fishProducts.length} fish products`);

    // Seafood Products
    const seafoodProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'King Prawns',
                slug: 'king-prawns',
                description: 'Large frozen king prawns, peeled and deveined',
                categoryId: seafood.id,
                price: 16.99,
                priceType: 'PER_KG',
                weightMin: 500,
                weightMax: 500,
                stockQuantity: 40,
                isAvailable: true,
                allergens: ['Crustaceans', 'Shellfish'],
                storageInstructions: 'Keep frozen. Cook from frozen or defrost in fridge.',
                imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Crayfish (Ground)',
                slug: 'crayfish-ground',
                description: 'Finely ground crayfish, essential Nigerian seasoning',
                categoryId: seafood.id,
                price: 12.99,
                priceType: 'FIXED',
                weightMin: 100,
                weightMax: 100,
                stockQuantity: 150,
                isAvailable: true,
                allergens: ['Crustaceans', 'Shellfish'],
                storageInstructions: 'Store in airtight container in cool dry place.',
                imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Periwinkle (Isam)',
                slug: 'periwinkle-isam',
                description: 'Fresh frozen periwinkles, perfect for Edikang Ikong soup',
                categoryId: seafood.id,
                price: 9.99,
                priceType: 'FIXED',
                weightMin: 400,
                weightMax: 400,
                stockQuantity: 70,
                isAvailable: true,
                allergens: ['Molluscs', 'Shellfish'],
                storageInstructions: 'Keep frozen. Wash thoroughly before cooking.',
                imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80']
            }
        })
    ]);

    console.log(`✅ Created ${seafoodProducts.length} seafood products`);

    // Meat Products
    const meatProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Goat Meat',
                slug: 'goat-meat',
                description: 'Fresh goat meat chunks, perfect for pepper soup and asun',
                categoryId: meat.id,
                price: 13.99,
                priceType: 'PER_KG',
                weightMin: 1000,
                weightMax: 1000,
                stockQuantity: 60,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep refrigerated. Use within 2 days or freeze.',
                imageUrls: ['/images/products/goat-meat.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Beef (Shaki - Tripe)',
                slug: 'beef-shaki-tripe',
                description: 'Cleaned beef tripe, great for traditional Nigerian stews',
                categoryId: meat.id,
                price: 11.99,
                priceType: 'PER_KG',
                weightMin: 800,
                weightMax: 800,
                stockQuantity: 55,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep frozen. Cook thoroughly before consumption.',
                imageUrls: ['https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Chicken (Whole)',
                slug: 'chicken-whole',
                description: 'Whole frozen chicken, cleaned and ready to cook',
                categoryId: meat.id,
                price: 8.99,
                priceType: 'PER_KG',
                weightMin: 1200,
                weightMax: 1500,
                stockQuantity: 90,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep frozen. Defrost completely before cooking.',
                imageUrls: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Smoked Turkey',
                slug: 'smoked-turkey',
                description: 'Premium smoked turkey pieces for rich Nigerian soups',
                categoryId: meat.id,
                price: 19.99,
                priceType: 'FIXED',
                weightMin: 500,
                weightMax: 500,
                stockQuantity: 45,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep frozen. Rinse before adding to soups.',
                imageUrls: ['https://images.unsplash.com/photo-1510444333911-30691efdf979?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Ponmo (Cow Skin)',
                slug: 'ponmo-cow-skin',
                description: 'Soft and chewy ponmo, perfect for stews and soups',
                categoryId: meat.id,
                price: 7.99,
                priceType: 'FIXED',
                weightMin: 400,
                weightMax: 400,
                stockQuantity: 120,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep frozen. Soak in warm water before use.',
                imageUrls: ['https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=800&q=80']
            }
        })
    ]);

    console.log(`✅ Created ${meatProducts.length} meat products`);

    // Groceries & Fresh Produce
    const groceryProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Plantain (Ripe)',
                slug: 'plantain-ripe',
                description: 'Sweet ripe plantains, perfect for dodo or boiling',
                categoryId: groceries.id,
                price: 4.99,
                priceType: 'FIXED',
                stockQuantity: 200,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store at room temperature until desired ripeness.',
                imageUrls: ['/images/products/plantain-ripe.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Plantain (Unripe)',
                slug: 'plantain-unripe',
                description: 'Green plantains for frying chips or making plantain fufu',
                categoryId: groceries.id,
                price: 3.99,
                priceType: 'FIXED',
                stockQuantity: 200,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store in cool dry place.',
                imageUrls: ['https://images.unsplash.com/photo-1628102476625-59274239b030?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Yam',
                slug: 'yam',
                description: 'Fresh Nigerian yam tubers, perfect for pounding or porridge',
                categoryId: groceries.id,
                price: 8.99,
                priceType: 'PER_KG',
                weightMin: 2000,
                weightMax: 3000,
                stockQuantity: 100,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store in cool dry place away from sunlight.',
                imageUrls: ['/images/products/yam.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Ugu Leaves (Pumpkin Leaves)',
                slug: 'ugu-leaves',
                description: 'Fresh ugu leaves for Nigerian vegetable soups',
                categoryId: groceries.id,
                price: 3.49,
                priceType: 'FIXED',
                weightMin: 200,
                weightMax: 200,
                stockQuantity: 80,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate. Use within 3 days.',
                imageUrls: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Bitter Leaf (Onugbu)',
                slug: 'bitter-leaf',
                description: 'Washed bitter leaves, ready for Ofe Onugbu soup',
                categoryId: groceries.id,
                price: 4.99,
                priceType: 'FIXED',
                weightMin: 250,
                weightMax: 250,
                stockQuantity: 60,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate. Best used within 2 days.',
                imageUrls: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Scotch Bonnet Peppers',
                slug: 'scotch-bonnet-peppers',
                description: 'Hot and flavorful scotch bonnet peppers for authentic heat',
                categoryId: groceries.id,
                price: 2.99,
                priceType: 'FIXED',
                weightMin: 100,
                weightMax: 100,
                stockQuantity: 150,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate for longer freshness.',
                imageUrls: ['/images/products/scotch-bonnet-peppers.png']
            }
        })
    ]);

    console.log(`✅ Created ${groceryProducts.length} grocery products`);

    // Packaged Foods & Staples
    const packagedProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Semovita',
                slug: 'semovita',
                description: 'Golden penny semovita for smooth swallow',
                categoryId: packagedFoods.id,
                price: 5.99,
                priceType: 'FIXED',
                weightMin: 1000,
                weightMax: 1000,
                stockQuantity: 180,
                isAvailable: true,
                allergens: ['Gluten', 'Wheat'],
                storageInstructions: 'Store in airtight container in cool dry place.',
                imageUrls: ['https://images.unsplash.com/photo-1564936281404-399f9281a8ca?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Garri (White)',
                slug: 'garri-white',
                description: 'Premium white garri for eba',
                categoryId: packagedFoods.id,
                price: 4.99,
                priceType: 'FIXED',
                weightMin: 1000,
                weightMax: 1000,
                stockQuantity: 200,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep in airtight container away from moisture.',
                imageUrls: ['/images/products/garri.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Pounded Yam Flour',
                slug: 'pounded-yam-flour',
                description: 'Instant pounded yam flour, just add hot water',
                categoryId: packagedFoods.id,
                price: 6.99,
                priceType: 'FIXED',
                weightMin: 900,
                weightMax: 900,
                stockQuantity: 150,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store in cool dry place.',
                imageUrls: ['https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Egusi (Melon Seeds)',
                slug: 'egusi-melon-seeds',
                description: 'Ground egusi for authentic Nigerian soups',
                categoryId: packagedFoods.id,
                price: 8.99,
                priceType: 'FIXED',
                weightMin: 500,
                weightMax: 500,
                stockQuantity: 120,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store in airtight container.',
                imageUrls: ['/images/products/egusi.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Ogbono (Ground)',
                slug: 'ogbono-ground',
                description: 'Finely ground ogbono for draw soup',
                categoryId: packagedFoods.id,
                price: 9.99,
                priceType: 'FIXED',
                weightMin: 400,
                weightMax: 400,
                stockQuantity: 100,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Keep in cool dry place in sealed container.',
                imageUrls: ['/images/products/egusi.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Palm Oil (Red)',
                slug: 'palm-oil-red',
                description: 'Pure red palm oil for authentic Nigerian cooking',
                categoryId: packagedFoods.id,
                price: 12.99,
                priceType: 'FIXED',
                weightMin: 1000,
                weightMax: 1000,
                stockQuantity: 140,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Store at room temperature.',
                imageUrls: ['/images/products/palm-oil-red.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Maggi Seasoning Cubes',
                slug: 'maggi-seasoning-cubes',
                description: 'Classic Maggi cubes for Nigerian cooking',
                categoryId: packagedFoods.id,
                price: 3.99,
                priceType: 'FIXED',
                stockQuantity: 250,
                isAvailable: true,
                allergens: ['Soy'],
                storageInstructions: 'Store in dry place.',
                imageUrls: ['https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80']
            }
        })
    ]);

    console.log(`✅ Created ${packagedProducts.length} packaged food products`);

    // Drinks & Beverages
    const drinkProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Zobo (Hibiscus) Drink',
                slug: 'zobo-hibiscus-drink',
                description: 'Refreshing homemade zobo drink',
                categoryId: drinks.id,
                price: 3.99,
                priceType: 'FIXED',
                stockQuantity: 100,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate. Consume within 5 days.',
                imageUrls: ['/images/products/zobo.png']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Chapman Mix',
                slug: 'chapman-mix',
                description: 'Ready-to-drink Nigerian chapman cocktail',
                categoryId: drinks.id,
                price: 4.99,
                priceType: 'FIXED',
                stockQuantity: 80,
                isAvailable: true,
                allergens: [],
                storageInstructions: 'Refrigerate. Shake well before serving.',
                imageUrls: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80']
            }
        }),
        prisma.product.create({
            data: {
                name: 'Malt Drink',
                slug: 'malt-drink',
                description: 'Classic Nigerian malt beverage',
                categoryId: drinks.id,
                price: 2.49,
                priceType: 'FIXED',
                stockQuantity: 200,
                isAvailable: true,
                allergens: ['Barley', 'Gluten'],
                storageInstructions: 'Store in cool place. Best served chilled.',
                imageUrls: ['https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80']
            }
        })
    ]);

    console.log(`✅ Created ${drinkProducts.length} drink products`);

    const totalProducts = fishProducts.length + seafoodProducts.length + meatProducts.length +
        groceryProducts.length + packagedProducts.length + drinkProducts.length;

    console.log(`\n🎉 Successfully seeded ${totalProducts} Nigerian food products!`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding Nigerian products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
