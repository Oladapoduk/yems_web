export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                    <p className="text-gray-700 mb-4">
                        By accessing and using Tanti Foods's e-commerce platform, you accept and agree to be bound by the terms
                        and provision of this agreement.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Product Information</h2>
                    <p className="text-gray-700 mb-4">
                        We strive to provide accurate product descriptions and images. However:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Weight ranges may vary slightly (e.g., 800g-1200g for certain fish products)</li>
                        <li>Product availability is subject to change</li>
                        <li>We reserve the right to offer substitutions for out-of-stock items</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pricing</h2>
                    <p className="text-gray-700 mb-4">
                        All prices are in GBP (£) and include VAT where applicable. We reserve the right to change prices
                        at any time, but changes will not affect orders already placed.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Delivery</h2>
                    <p className="text-gray-700 mb-4">Delivery terms:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>We deliver to specific postcode areas only</li>
                        <li>Minimum order requirements apply based on delivery zone</li>
                        <li>You must select a delivery time slot during checkout</li>
                        <li>Someone must be available to receive frozen goods</li>
                        <li>Frozen products must be stored immediately upon delivery</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Product Substitutions</h2>
                    <p className="text-gray-700 mb-4">
                        If an ordered item is unavailable, we may contact you to offer a suitable substitution.
                        You have the right to accept the substitution or request a refund for that item.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
                    <p className="text-gray-700 mb-4">
                        Due to the nature of frozen food products, we cannot accept returns unless the product is:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Defective or damaged upon delivery</li>
                        <li>Incorrectly supplied</li>
                        <li>Past its use-by date</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        Please contact us within 24 hours of delivery to report any issues.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Allergen Information</h2>
                    <p className="text-gray-700 mb-4">
                        While we provide allergen information for all products, customers with severe allergies should
                        contact us directly before placing orders.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Business Customers (B2B)</h2>
                    <p className="text-gray-700 mb-4">
                        Business customers must provide valid VAT numbers. Bulk pricing and invoicing terms apply.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
                    <p className="text-gray-700">
                        For questions about these terms:
                        <br />
                        Email: support@olayemi.com
                        <br />
                        Phone: +44 (0) 20 1234 5678
                    </p>
                </section>
            </div>
        </div>
    );
}
