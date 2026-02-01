import { Outlet, Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Header from './Header';
import ChatWidget from './ChatWidget';

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2">
                                <img src="/tanti-logo.png" alt="Tanti Foods" className="h-10 w-auto" />
                                <span className="text-xl font-black text-primary-900 tracking-tight uppercase">Tanti Foods</span>
                            </div>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                                Bringing the authentic flavors of Africa directly to your doorstep with premium quality and service you can trust.
                            </p>
                            <div className="flex gap-4">
                                <a
                                    href="https://facebook.com/TanTiFoods"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://instagram.com/tanti_foods"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://tiktok.com/@TanTiFoods0107"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300"
                                    aria-label="TikTok"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                                    </svg>
                                </a>
                                <a
                                    href="https://twitter.com/tantifoods"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 bg-gray-50 rounded-xl hover:bg-primary-600 hover:text-white transition-all duration-300"
                                    aria-label="X (Twitter)"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Company</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/info/about-tanti" className="text-gray-500 hover:text-primary-600 transition-colors">About Tanti Foods</Link></li>
                                <li><Link to="/info/quality-sourcing" className="text-gray-500 hover:text-primary-600 transition-colors">Quality & Sourcing</Link></li>
                                <li><Link to="/info/sustainability" className="text-gray-500 hover:text-primary-600 transition-colors">Sustainability</Link></li>
                                <li><Link to="/info/community-impact" className="text-gray-500 hover:text-primary-600 transition-colors">Community & Impact</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Customer Care</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 transition-colors">Contact Support</Link></li>
                                <li><Link to="/info/faq" className="text-gray-500 hover:text-primary-600 transition-colors">Help Center / FAQs</Link></li>
                                <li><Link to="/info/shipping" className="text-gray-500 hover:text-primary-600 transition-colors">Delivery Information</Link></li>
                                <li><Link to="/info/returns" className="text-gray-500 hover:text-primary-600 transition-colors">Returns & Refunds</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Our Policies</h4>
                            <ul className="space-y-4 text-sm font-medium">
                                <li><Link to="/privacy-policy" className="text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms-of-service" className="text-gray-500 hover:text-primary-600 transition-colors">Terms of Service</Link></li>
                                <li><button className="text-gray-500 hover:text-primary-600 transition-colors text-left">Cookie Settings</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-400 text-xs font-medium">
                            &copy; {new Date().getFullYear()} Tanti Foods. Built with passion for authentic flavors.
                        </p>
                        <div className="flex gap-6">
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-4 w-auto grayscale opacity-50" />
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" className="h-4 w-auto grayscale opacity-50" />
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196565.png" alt="Amex" className="h-4 w-auto grayscale opacity-50" />
                        </div>
                    </div>
                </div>
            </footer>
            <ChatWidget />
        </div>
    );
}
