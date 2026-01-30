import prisma from '../src/prisma';

async function seedDeliveryData() {
    console.log('🚀 Seeding delivery zones and slots...');

    try {
        // Create Delivery Zones
        const zones = await Promise.all([
            prisma.deliveryZone.create({
                data: {
                    name: 'Central London',
                    postcodePrefixes: ['SE', 'SW', 'E', 'W', 'N', 'NW', 'EC', 'WC'],
                    deliveryFee: 5.00,
                    minimumOrder: 30.00,
                    isActive: true
                }
            }),
            prisma.deliveryZone.create({
                data: {
                    name: 'Outer London',
                    postcodePrefixes: ['BR', 'CR', 'DA', 'EN', 'HA', 'IG', 'KT', 'RM', 'SM', 'TW', 'UB'],
                    deliveryFee: 7.50,
                    minimumOrder: 40.00,
                    isActive: true
                }
            }),
            prisma.deliveryZone.create({
                data: {
                    name: 'Greater London',
                    postcodePrefixes: ['AL', 'CM', 'SL', 'WD'],
                    deliveryFee: 10.00,
                    minimumOrder: 50.00,
                    isActive: true
                }
            })
        ]);

        console.log(`✅ Created ${zones.length} delivery zones`);

        // Create Delivery Slots for the next 7 days
        const today = new Date();
        const slots = [];

        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Standard time slots
            const timeSlots = [
                { startTime: '09:00', endTime: '12:00' },
                { startTime: '12:00', endTime: '15:00' },
                { startTime: '15:00', endTime: '18:00' }
            ];

            for (const slot of timeSlots) {
                slots.push({
                    date: new Date(dateStr),
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    maxOrders: 10,
                    currentBookings: 0,
                    isAvailable: true
                });
            }
        }

        await prisma.deliverySlot.createMany({
            data: slots
        });

        console.log(`✅ Created ${slots.length} delivery slots`);
        console.log('🎉 Delivery data seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding delivery data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedDeliveryData()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
