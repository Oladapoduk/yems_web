import prisma from '../src/prisma';

async function deleteCategories() {
    try {
        // Delete all categories
        const result = await prisma.category.deleteMany({});
        console.log(`✅ Deleted ${result.count} categories`);

    } catch (error) {
        console.error('❌ Error deleting categories:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteCategories();
