import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    { slug: 'bread', imageUrls: ['https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&q=80'] },
    { slug: 'meat-pie', imageUrls: ['https://images.unsplash.com/photo-1621813494191-766282987158?w=800&q=80'] },
    { slug: 'cakes', imageUrls: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80'] },
    { slug: 'chin-chin', imageUrls: ['/images/products/chin-chin.png'] },
    { slug: 'smoked-catfish', imageUrls: ['https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=800&q=80'] },
    { slug: 'smoked-mackerel', imageUrls: ['/images/products/mackerel-titus.png'] },
    { slug: 'smoked-blue-whiting-fish-panla-', imageUrls: ['/images/products/panla.png'] },
    { slug: 'smoked-prawns', imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80'] },
    { slug: 'catfish', imageUrls: ['https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=800&q=80'] },
    { slug: 'mackerel', imageUrls: ['/images/products/mackerel-titus.png'] },
    { slug: 'prawns', imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80'] },
    { slug: 'blue-whiting-fish-panla-', imageUrls: ['/images/products/panla.png'] },
    { slug: 'pangasius', imageUrls: ['https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?w=800&q=80'] },
    { slug: 'red-beam-fish', imageUrls: ['https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?w=800&q=80'] },
    { slug: 'peanuts', imageUrls: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80'] },
    { slug: 'kuli-kuli', imageUrls: ['https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80'] },
    { slug: 'burger', imageUrls: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'] },
    { slug: 'palm-oil', imageUrls: ['/images/products/palm-oil-red.png'] },
    { slug: 'peanut-oil', imageUrls: ['https://images.unsplash.com/photo-1474979266404-7eaacabc88c5?w=800&q=80'] },
    { slug: 'plantain-flour-elubo-ogede-', imageUrls: ['https://images.unsplash.com/photo-1564936281404-399f9281a8ca?w=800&q=80'] },
    { slug: 'yam-flour-elubo-isu-', imageUrls: ['https://images.unsplash.com/photo-1564936281404-399f9281a8ca?w=800&q=80'] },
    { slug: 'peeled-beans', imageUrls: ['https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=800&q=80'] },
    { slug: 'ground-pepper-ata-kuku-', imageUrls: ['/images/products/scotch-bonnet-peppers.png'] },
    { slug: 'ground-crayfish', imageUrls: ['https://images.unsplash.com/photo-1559739511-df8cd904945b?w=800&q=80'] },
    { slug: 'tilapia', imageUrls: ['https://images.unsplash.com/photo-1594002494803-fd4599580ca0?w=800&q=80'] },
];

async function main() {
    console.log('🚀 Updating product images with correct slugs...');
    for (const update of updates) {
        try {
            await prisma.product.update({
                where: { slug: update.slug },
                data: { imageUrls: update.imageUrls }
            });
            console.log(`✅ Updated ${update.slug}`);
        } catch (error) {
            console.warn(`⚠️ Could not update ${update.slug}: product not found`);
        }
    }
    console.log('🎉 Done!');
}

main()
    .catch((e) => {
        console.error('❌ Error updating product images:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
