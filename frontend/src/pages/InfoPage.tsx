import { useParams } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function InfoPage() {
    const { type } = useParams();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const contentMap: Record<string, { title: string; content?: React.ReactNode; faqs?: { q: string, a: string }[] }> = {
        'faq': {
            title: 'Frequently Asked Questions',
            faqs: [
                { q: 'Can I order fresh produce from your store?', a: 'Yes! We source fresh African produce weekly to ensure maximum freshness.' },
                { q: 'How is my frozen food shipped?', a: 'We use specialized insulated packaging with dry ice/gel packs to keep items frozen for up to 24 hours during transit.' },
                { q: 'What delivery options are available?', a: 'We offer standard next-day delivery across the UK mainland. Order before 12pm for same-day dispatch.' },
                { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards via Stripe, ensuring secure transactions.' },
                { q: 'Do you offer international shipping?', a: 'Currently, we only ship within the UK Mainland to maintain our quality standards.' }
            ]
        },
        'about-tanti': {
            title: 'About Tanti Foods',
            content: (
                <div className="space-y-6">
                    <p className="text-xl font-medium text-primary-900">“A modern grocer bringing trusted African & global ingredients to UK kitchens”</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold mb-2">Who We Are</h3>
                        <p>Tanti Foods is more than just a grocery store; we are a bridge connecting you to the authentic tastes of home. Born from a passion for quality and culture, we strive to make premium African ingredients accessible to everyone in the UK.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="text-lg font-bold mb-2">What We Stand For</h3>
                        <p>Trust, Quality, and Community. We believe that food brings people together, and every meal starts with the best ingredients. We refuse to compromise on authenticity or freshness.</p>
                    </div>
                </div>
            )
        },
        'quality-sourcing': {
            title: 'Quality & Sourcing',
            content: (
                <div className="space-y-6">
                    <p>We take pride in our rigorous sourcing process, ensuring every product meets our high standards.</p>
                    <ul className="list-none space-y-4">
                        <li className="flex items-start gap-3">
                            <span className="bg-green-100 text-green-700 p-1 rounded-full text-xs font-bold">✓</span>
                            <span><strong>Direct Sourcing:</strong> We work directly with trusted farmers and suppliers to verify the origin of our goods.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-green-100 text-green-700 p-1 rounded-full text-xs font-bold">✓</span>
                            <span><strong>Supplier Standards:</strong> All our partners adhere to strict hygiene and ethical trading practices.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-green-100 text-green-700 p-1 rounded-full text-xs font-bold">✓</span>
                            <span><strong>Freshness Guarantee:</strong> Our supply chain is optimized to minimize time from farm to your door.</span>
                        </li>
                    </ul>
                </div>
            )
        },
        'our-standards': {
            title: 'Our Standards',
            content: (
                <div className="space-y-6">
                    <p>Compliance and safety are at the core of our operations.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2">Quality Control</h4>
                            <p className="text-sm">Every batch undergoes rigorous visual and quality checks upon arrival at our warehouse.</p>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2">Food Safety</h4>
                            <p className="text-sm">We strictly follow UK food safety regulations, including proper temperature controls for all frozen and fresh items.</p>
                        </div>
                        <div className="border border-gray-200 p-4 rounded-xl">
                            <h4 className="font-bold text-gray-900 mb-2">Packaging</h4>
                            <p className="text-sm">Our packaging is designed to protect product integrity while working towards sustainability.</p>
                        </div>
                    </div>
                </div>
            )
        },
        'sustainability': {
            title: 'Sustainability',
            content: (
                <div className="space-y-6">
                    <p>We are committed to reducing our environmental footprint.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Optimizing delivery routes to lower carbon emissions.</li>
                        <li>Working with suppliers who practice sustainable farming.</li>
                        <li>Transitioning to recyclable and biodegradable packaging materials wherever food safety permissions allow.</li>
                    </ul>
                </div>
            )
        },
        'community-impact': {
            title: 'Community & Impact',
            content: (
                <div className="space-y-6">
                    <p>Tanti Foods is built by the community, for the community.</p>
                    <p>We actively support local cultural events and food banks. Detailed impact reports and community stories coming soon.</p>
                </div>
            )
        },
        'shipping': {
            title: 'Delivery Information',
            content: (
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                        <h3 className="text-lg font-bold mb-2 text-blue-900">UK-Wide Delivery</h3>
                        <p className="text-blue-800">We deliver to all postcodes within the UK Mainland.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Delivery Times & Costs</h3>
                        <ul className="space-y-3">
                            <li className="flex justify-between border-b pb-2">
                                <span>Standard Delivery (2-3 days)</span>
                                <span className="font-bold">£5.99</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Next Day Delivery (Order before 12pm)</span>
                                <span className="font-bold">£8.99</span>
                            </li>
                            <li className="flex justify-between border-b pb-2">
                                <span>Orders over £100</span>
                                <span className="font-bold text-green-600">FREE</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        'returns': {
            title: 'Returns & Refunds',
            content: (
                <div className="space-y-6">
                    <p>We want you to be completely satisfied with your order.</p>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Eligibility</h3>
                        <p>Due to the perishable nature of our products, we cannot accept returns on fresh or frozen food unless it arrived damaged or spoiled. Non-perishable items can be returned within 14 days.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Refund Process</h3>
                        <p>If you have an issue, please contact us within 24 hours of delivery with photos of the product. Refunds are processed to your original payment method within 5-7 business days.</p>
                    </div>
                </div>
            )
        },
        'account-orders': { // Placeholder for info view if not logged in
            title: 'Account & Orders',
            content: (
                <div className="space-y-4">
                    <p>Manage your personal details, track your active orders, and view your purchase history.</p>
                    <p><a href="/login" className="text-primary-600 font-bold underline">Login to your account</a> to view your dashboard.</p>
                </div>
            )
        }
    };

    const data = contentMap[type || ''] || { title: 'Information', content: 'Page under construction.' };

    return (
        <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 uppercase tracking-tight text-center decoration-primary-500/30 underline decoration-4 underline-offset-8">
                {data.title}
            </h1>

            {data.faqs ? (
                <div className="space-y-4">
                    {data.faqs.map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md bg-white">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-lg">{faq.q}</span>
                                {openFaq === index ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 text-gray-600 max-w-none">
                    {data.content}
                </div>
            )}
        </div>
    );
}
