import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import FeatureSection from '../components/FeatureSection';
import Newsletter from '../components/Newsletter';
import { productService } from '../services/productService';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['featured-products'],
        queryFn: () => productService.getProducts({ limit: 4, sort: 'createdAt' })
    });

    return (
        <div className="space-y-20 pb-12">
            <Hero />

            <CategoryGrid />

            <FeatureSection />

            {/* Featured Products Section */}
            <section>
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">New Arrivals</h2>
                        <p className="text-gray-500">Discover our latest premium products</p>
                    </div>
                    <Link to="/products" className="group flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors">
                        Shop All Products
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-3xl h-80 animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500 py-12 bg-white rounded-3xl border border-gray-100">
                        <p className="font-semibold text-lg">Failed to load products</p>
                        <p className="text-sm">Please try refreshing the page</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {data?.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            <Newsletter />
        </div>
    );
}
