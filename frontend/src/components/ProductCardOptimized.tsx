import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import LazyImage from './LazyImage';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    priceType: 'FIXED' | 'PER_KG';
    imageUrls: string[];
    category: {
        name: string;
    };
    stockQuantity: number;
    isAvailable: boolean;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: string) => void;
}

function ProductCardOptimized({ product, onAddToCart }: ProductCardProps) {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(product.id);
    };

    return (
        <Link
            to={`/products/${product.id}`}
            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
            <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.imageUrls?.[0] ? (
                    <LazyImage
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="mb-2">
                    <p className="text-xs text-gray-500 uppercase">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xl font-bold text-green-600">
                            £{Number(product.price).toFixed(2)}
                            {product.priceType === 'PER_KG' && <span className="text-sm font-normal">/kg</span>}
                        </p>
                        {product.stockQuantity > 0 ? (
                            <p className="text-xs text-gray-500">In stock</p>
                        ) : (
                            <p className="text-xs text-red-500">Out of stock</p>
                        )}
                    </div>

                    {product.isAvailable && product.stockQuantity > 0 && (
                        <button
                            onClick={handleAddToCart}
                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                            aria-label="Add to cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(ProductCardOptimized, (prevProps, nextProps) => {
    // Only re-render if product data actually changed
    return (
        prevProps.product.id === nextProps.product.id &&
        prevProps.product.stockQuantity === nextProps.product.stockQuantity &&
        prevProps.product.isAvailable === nextProps.product.isAvailable &&
        prevProps.product.price === nextProps.product.price
    );
});
