import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-wide">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <p className="text-gray-600 leading-relaxed">
                        Have a question about your order, our products, or just want to say hello?
                        We're here to help! Fill out the form or reach us via the details below.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase">Phone</h3>
                                <p>+44 20 1234 5678</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase">Email</h3>
                                <p>support@tantyfoods.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-gray-700">
                            <div className="bg-primary-50 p-3 rounded-lg text-primary-600">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm uppercase">Address</h3>
                                <p>123 African Market St, London, UK</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0" placeholder="Your name" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0" placeholder="your@email.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                        <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-0" placeholder="How can we help?"></textarea>
                    </div>
                    <button type="button" className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Message
                    </button>
                </form>
            </div>
        </div>
    );
}
