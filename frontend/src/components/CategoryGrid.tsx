import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import api from '../services/api';

interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    _count?: {
        products: number;
    };
}

export default function CategoryGrid() {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories');
            return response.data.categories as Category[];
        }
    });

    if (isLoading) {
        return (
            <section className="mb-16">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse"></div>
                    ))}
                </div>
            </section>
        );
    }

    if (!categories.length) {
        return null;
    }

    // Use Unsplash images as placeholders for categories
    const categoryImages: Record<string, string> = {
        'bakery-products': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
        'smoked-frozen-seafoods': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
        'frozen-seafoods': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500',
        'nigerian-snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500',
        'oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
        'flour': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500',
        'essentials': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
        'spices': '/images/category-spices.png',
    };

    return (
        <section className="mb-16">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Shop by Category</h2>
                    <p className="text-gray-500">Find exactly what you need for your next meal</p>
                </div>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1 transition-colors">
                    View All
                    <ChevronRight className="h-5 w-5" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={`/products?category=${category.slug}`}
                        className="group flex flex-col items-center text-center"
                    >
                        <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-500 border-4 border-white">
                            <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                            <img
                                src={category.imageUrl || categoryImages[category.slug] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'}
                                alt={category.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg">
                            {category.name}
                        </h3>
                        <p className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mt-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            {category._count?.products || 0} Products
                        </p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
