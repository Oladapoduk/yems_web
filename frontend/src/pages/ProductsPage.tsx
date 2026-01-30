import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, X, Search, ChevronLeft } from 'lucide-react';

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const currentPage = parseInt(searchParams.get('page') || '1');

    const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', category, search, priceRange, currentPage],
        queryFn: () => productService.getProducts({
            category,
            search,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            page: currentPage,
            limit: 20
        })
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: productService.getCategories
    });

    const handleCategoryChange = (slug: string) => {
        if (slug === category) {
            searchParams.delete('category');
        } else {
            searchParams.set('category', slug);
        }
        searchParams.set('page', '1'); // Reset to page 1 when changing filters
        setSearchParams(searchParams);
    };

    const handlePageChange = (newPage: number) => {
        searchParams.set('page', newPage.toString());
        setSearchParams(searchParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="py-8">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-6">
                    <button
                        className="flex items-center justify-between w-full px-6 py-4 bg-white border border-gray-100 rounded-3xl shadow-sm font-black text-gray-900"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-3">
                            <SlidersHorizontal className="h-5 w-5 text-primary-600" />
                            Filter Products
                        </div>
                        <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {/* Sidebar Filters */}
                <aside className={`w-full md:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 sticky top-28">
                        <div className="flex items-center gap-3 mb-10 border-b border-gray-50 pb-6">
                            <div className="bg-primary-50 p-2 rounded-xl">
                                <Filter className="h-5 w-5 text-primary-600" />
                            </div>
                            <h2 className="font-black text-xl text-gray-900 uppercase tracking-tight">Filters</h2>
                        </div>

                        {/* Categories */}
                        <div className="mb-12">
                            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-6 px-1">Shop Categories</h3>
                            <div className="space-y-3">
                                {categories?.map((cat: any) => (
                                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group px-1">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={category === cat.slug}
                                                onChange={() => handleCategoryChange(cat.slug)}
                                                className="peer h-5 w-5 rounded-lg border-gray-200 text-primary-600 focus:ring-primary-500/20 transition-all cursor-pointer opacity-0 absolute"
                                            />
                                            <div className="h-5 w-5 rounded-lg border-2 border-gray-100 peer-checked:border-primary-600 peer-checked:bg-primary-600 transition-all flex items-center justify-center">
                                                <div className="h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold transition-all ${category === cat.slug ? 'text-primary-600' : 'text-gray-500 group-hover:text-gray-900'}`}>
                                            {cat.name}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-300 ml-auto bg-gray-50 px-2 py-0.5 rounded-full">
                                            {cat._count?.products || 0}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-6 px-1">Price Range (£)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20 placeholder:text-gray-300"
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || undefined }))}
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary-600/20 placeholder:text-gray-300"
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || undefined }))}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                searchParams.delete('category');
                                setSearchParams(searchParams);
                                setPriceRange({});
                            }}
                            className="mt-10 w-full py-3 text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors text-center border-t border-gray-50 pt-6"
                        >
                            Reset All Filters
                        </button>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div>
                            {search && (
                                <p className="text-sm font-bold text-primary-600 mb-2">Search results for "{search}"</p>
                            )}
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                {category ? categories?.find((c: any) => c.slug === category)?.name : 'All Products'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
                            Showing <span className="text-gray-900">{data?.products.length || 0}</span> of <span className="text-gray-900">{data?.total || 0}</span> Products
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-gray-100 rounded-[32px] aspect-[4/5] animate-pulse"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="bg-red-50 text-red-600 p-4 rounded-full w-fit mx-auto mb-4">
                                <X className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h3>
                            <p className="text-gray-500 font-medium">We couldn't load the products. Please try again.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : data?.products.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                            <div className="bg-gray-50 text-gray-400 p-4 rounded-full w-fit mx-auto mb-4">
                                <Search className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500 font-medium">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {data?.products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {data && data.totalPages > 1 && (
                                <div className="mt-12 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                            currentPage === 1
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-primary-600 hover:text-white border border-gray-200'
                                        }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </button>

                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => {
                                            // Show first page, last page, current page, and pages around current
                                            const showPage =
                                                page === 1 ||
                                                page === data.totalPages ||
                                                Math.abs(page - currentPage) <= 1;

                                            const showEllipsis =
                                                (page === 2 && currentPage > 3) ||
                                                (page === data.totalPages - 1 && currentPage < data.totalPages - 2);

                                            if (showEllipsis) {
                                                return (
                                                    <span key={page} className="px-2 text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            if (!showPage) return null;

                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`min-w-10 h-10 rounded-full font-bold text-sm transition-all ${
                                                        page === currentPage
                                                            ? 'bg-primary-600 text-white'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === data.totalPages}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                                            currentPage === data.totalPages
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                : 'bg-white text-gray-700 hover:bg-primary-600 hover:text-white border border-gray-200'
                                        }`}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
