export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                    <p className="text-gray-700 mb-4">We collect information you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Name, email address, phone number, and delivery address</li>
                        <li>Payment information (processed securely through Stripe)</li>
                        <li>Order history and preferences</li>
                        <li>Business information for B2B customers (company name, VAT number)</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                    <p className="text-gray-700 mb-4">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Process and fulfill your orders</li>
                        <li>Send you order confirmations and delivery updates</li>
                        <li>Respond to your comments and questions</li>
                        <li>Improve our products and services</li>
                        <li>Generate VAT invoices for business customers</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                    <p className="text-gray-700 mb-4">
                        We do not sell or rent your personal information to third parties. We may share your information with:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Delivery partners to fulfill your orders</li>
                        <li>Payment processors (Stripe) to process payments</li>
                        <li>Service providers who assist in our operations</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies and Tracking</h2>
                    <p className="text-gray-700 mb-4">
                        We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                    <p className="text-gray-700 mb-4">
                        We implement appropriate technical and organizational measures to protect your personal data against
                        unauthorized or unlawful processing, accidental loss, destruction, or damage.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                    <p className="text-gray-700 mb-4">You have the right to:</p>
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing of your data</li>
                        <li>Request transfer of your data</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                    <p className="text-gray-700">
                        If you have any questions about this Privacy Policy, please contact us at:
                        <br />
                        Email: privacy@olayemi.com
                        <br />
                        Phone: +44 (0) 20 1234 5678
                    </p>
                </section>
            </div>
        </div>
    );
}
