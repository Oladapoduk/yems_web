import { Send } from 'lucide-react';
import { useState } from 'react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setEmail('');
        }, 1500);
    };

    return (
        <section className="relative overflow-hidden rounded-3xl mb-16">
            <div className="absolute inset-0 bg-primary-900">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 opacity-90"></div>
                {/* Decorative Pattern / Image */}
                <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80"
                    alt="Background"
                    className="w-full h-full object-cover mix-blend-overlay opacity-20"
                />
            </div>

            <div className="relative z-10 py-16 px-8 md:px-16 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Join the Tanti Foods Family
                </h2>
                <p className="text-primary-100 text-lg mb-10">
                    Subscribe for exclusive offers, authentic recipes, and updates on our latest arrivals.
                </p>

                {status === 'success' ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                        <p className="font-bold text-xl mb-1">Thank you for joining! 🎉</p>
                        <p className="text-primary-100">Check your email for a special welcome gift.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-grow px-6 py-4 bg-white rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 placeholder:text-gray-400"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="bg-primary-500 hover:bg-primary-400 px-10 py-4 rounded-full text-white font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Joining...' : (
                                <>
                                    Subscribe
                                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                )}
                <p className="mt-6 text-primary-200 text-xs uppercase tracking-widest font-semibold">
                    No spam, just goodness. Unsubscribe at any time.
                </p>
            </div>
        </section>
    );
}
