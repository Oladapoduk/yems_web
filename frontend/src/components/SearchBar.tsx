import { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    priceType: string;
    imageUrls: string[];
    category: {
        name: string;
    };
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Synonym {
    term: string;
    alternatives: string[];
}

interface SearchSuggestions {
    products: Product[];
    categories: Category[];
    synonyms: Synonym[];
}

export default function SearchBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestions | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search with suggestions API
    useEffect(() => {
        const searchProducts = async () => {
            if (query.length < 2) {
                setSuggestions(null);
                setIsOpen(false);
                setSelectedIndex(-1);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
                setSuggestions(response.data.suggestions);
                setIsOpen(true);
                setSelectedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                setSuggestions(null);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!suggestions || !isOpen) return;

        const totalItems = (suggestions.products?.length || 0) + (suggestions.categories?.length || 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0) {
                handleSelectItem(selectedIndex);
            } else {
                handleSearchSubmit();
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };

    const handleSelectItem = (index: number) => {
        if (!suggestions) return;

        const productsLength = suggestions.products?.length || 0;

        if (index < productsLength) {
            // Navigate to product
            const product = suggestions.products[index];
            navigate(`/products/${product.id}`);
        } else {
            // Navigate to category
            const category = suggestions.categories[index - productsLength];
            navigate(`/products?category=${category.slug}`);
        }

        setQuery('');
        setSuggestions(null);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleProductClick = (productId: string) => {
        navigate(`/products/${productId}`);
        setQuery('');
        setSuggestions(null);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleCategoryClick = (categorySlug: string) => {
        navigate(`/products?category=${categorySlug}`);
        setQuery('');
        setSuggestions(null);
        setIsOpen(false);
        setSelectedIndex(-1);
    };

    const handleSearchSubmit = () => {
        if (query.trim()) {
            navigate(`/products?search=${encodeURIComponent(query.trim())}`);
            setIsOpen(false);
            setSelectedIndex(-1);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions(null);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const totalSuggestions = (suggestions?.products?.length || 0) + (suggestions?.categories?.length || 0);

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for Nigerian foods (e.g., mackerel, egusi, plantain)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {query && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
                {isLoading && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && suggestions && totalSuggestions > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                    {/* Products */}
                    {suggestions.products && suggestions.products.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Products</div>
                            {suggestions.products.map((product, index) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedIndex === index ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {product.imageUrls?.[0] ? (
                                            <img
                                                src={product.imageUrls[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Hide image and show fallback icon
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.classList.add('bg-gray-200');
                                                    // Add a fallback icon element manually if basic cleanup isn't enough, 
                                                    // but for now, hiding the broken image reveals the background 
                                                    // which acts as a placeholder. We can also toggle a state class.
                                                }}
                                            />
                                        ) : (
                                            <Search className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.category.name}</p>
                                    </div>
                                    <div className="text-sm font-semibold text-green-600">
                                        £{Number(product.price).toFixed(2)}
                                        {product.priceType === 'PER_KG' && '/kg'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Categories */}
                    {suggestions.categories && suggestions.categories.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Categories</div>
                            {suggestions.categories.map((category, index) => {
                                const categoryIndex = (suggestions.products?.length || 0) + index;
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.slug)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedIndex === categoryIndex ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        <TrendingUp className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm text-gray-900">{category.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Synonyms/Suggestions */}
                    {suggestions.synonyms && suggestions.synonyms.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Did you mean?</div>
                            {suggestions.synonyms.map((synonym, index) => (
                                <div key={index} className="px-3 py-2">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">{synonym.term}</span>
                                        {synonym.alternatives.length > 0 && (
                                            <span className="text-gray-500"> - also: {synonym.alternatives.join(', ')}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* View All Results */}
                    <div className="p-2 border-t border-gray-100">
                        <button
                            onClick={handleSearchSubmit}
                            className="w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg font-medium transition-colors"
                        >
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}

            {/* No Results */}
            {isOpen && suggestions && totalSuggestions === 0 && query.length >= 2 && !isLoading && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">No products found for "{query}"</p>
                    <p className="text-sm text-gray-500 mt-1">Try different keywords or browse our categories</p>
                </div>
            )}
        </div>
    );
}
