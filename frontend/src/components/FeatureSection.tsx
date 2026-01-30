import { Truck, ShieldCheck, Star, Clock } from 'lucide-react';

const features = [
    {
        icon: <Truck className="h-8 w-8 text-primary-600" />,
        title: 'Next-Day Delivery',
        description: 'Order before 2pm and receive your fresh groceries the very next day across London.'
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary-600" />,
        title: 'Freshness Guaranteed',
        description: 'We source directly from trusted suppliers to ensure the highest quality and freshness.'
    },
    {
        icon: <Star className="h-8 w-8 text-primary-600" />,
        title: 'Authentic Taste',
        description: 'Genuine African and Nigerian ingredients that bring the taste of home to your kitchen.'
    },
    {
        icon: <Clock className="h-8 w-8 text-primary-600" />,
        title: 'Time-Saving',
        description: 'Skip the trip to the market. We bring the best of the market directly to your doorstep.'
    }
];

export default function FeatureSection() {
    return (
        <section className="py-16 bg-white rounded-3xl mb-16 shadow-sm border border-gray-100">
            <div className="container mx-auto px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Tanti Foods?</h2>
                    <p className="text-gray-600">
                        We are committed to providing the finest selection of African groceries with service you can trust.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors group">
                            <div className="mb-4 p-4 bg-primary-50 rounded-2xl group-hover:bg-primary-100 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
