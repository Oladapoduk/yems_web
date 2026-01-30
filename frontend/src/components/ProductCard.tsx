import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import type { Product } from '../services/productService';
import { useCartStore } from '../store/cartStore';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to PDP
        addItem(product, 1);
    };

    return (
        <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
            <Link to={`/products/${product.id}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
                {product.imageUrls[0] ? (
                    <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 font-medium">
                        Coming Soon
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 z-10 flex items-center justify-center">
                    <div className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold text-sm transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
                        View Details
                    </div>
                </div>

                {/* Stock Badge */}
                {!product.isAvailable || product.stockQuantity === 0 ? (
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-md text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        Out of Stock
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        In Stock
                    </div>
                )}

                {/* Favorite Toggle */}
                <button className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                    <Heart className="h-4 w-4" />
                </button>
            </Link>

            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-1 block">
                        {product.category.name}
                    </span>
                    <Link
                        to={`/products/${product.id}`}
                        className="font-bold text-gray-900 hover:text-primary-600 text-lg transition-colors line-clamp-2 leading-tight"
                    >
                        {product.name}
                    </Link>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-black text-primary-900 leading-none">
                            £{Number(product.price).toFixed(2)}
                        </span>
                        {product.priceType === 'PER_KG' && (
                            <span className="text-xs text-gray-500 ml-1 font-bold">/ kg</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="p-3 bg-gray-900 text-white rounded-2xl hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md hover:shadow-lg"
                        disabled={!product.isAvailable || product.stockQuantity === 0}
                        title="Add to Cart"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
