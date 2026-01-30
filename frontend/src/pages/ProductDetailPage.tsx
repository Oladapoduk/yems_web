import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { Minus, Plus, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const addItem = useCartStore((state) => state.addItem);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productService.getProduct(id!)
    });

    const [quantity, setQuantity] = useState(1);

    if (isLoading) return <div className="container mx-auto px-4 py-8 animate-pulse">Loading...</div>;
    if (error || !product) return <div className="container mx-auto px-4 py-8 text-red-500">Product not found</div>;

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addItem(product, quantity);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Image Gallery */}
                <div className="space-y-6">
                    <div className="aspect-[4/5] bg-gray-50 rounded-[40px] overflow-hidden shadow-sm border border-gray-100">
                        {product.imageUrls[0] ? (
                            <img
                                src={product.imageUrls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover shadow-inner"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50">
                                No Image Available
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <div className="mb-8">
                        <div className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black tracking-widest uppercase rounded-full mb-4">
                            {product.category.name}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4">
                            <div className="text-4xl font-black text-primary-700">
                                £{Number(product.price).toFixed(2)}
                                {product.priceType === 'PER_KG' && <span className="text-lg text-gray-400 font-bold"> / kg</span>}
                            </div>
                            <div className="h-6 w-[1.5px] bg-gray-100"></div>
                            <div className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                In Stock
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg text-gray-600 mb-10 leading-relaxed font-medium">
                        <p>{product.description}</p>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="bg-gray-50 p-8 rounded-[32px] mb-10">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Select Quantity</label>
                        <div className="flex flex-col sm:flex-row items-stretch gap-4">
                            <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    className="p-4 hover:bg-gray-50 text-gray-900 transition-colors disabled:opacity-30"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-5 w-5" />
                                </button>
                                <span className="w-14 text-center font-black text-xl text-gray-900">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    className="p-4 hover:bg-gray-50 text-gray-900 transition-colors disabled:opacity-30"
                                    disabled={quantity >= product.stockQuantity}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-200 transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!product.isAvailable || product.stockQuantity === 0}
                            >
                                <ShoppingCart className="h-6 w-6" />
                                Add to Basket
                            </button>
                        </div>
                    </div>

                    {/* Features / Trust */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                        <div className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-gray-50 shadow-sm">
                            <div className="bg-primary-50 p-3 rounded-2xl">
                                <Truck className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">Express Delivery</h4>
                                <p className="text-xs font-bold text-gray-400">Next day service available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-gray-50 shadow-sm">
                            <div className="bg-primary-50 p-3 rounded-2xl">
                                <ShieldCheck className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">Quality Promise</h4>
                                <p className="text-xs font-bold text-gray-400">Freshness guaranteed</p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {(product.weightMin || product.weightMax) && (
                        <div className="mt-12">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-4">Specifications</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {product.weightMin && (
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Min Weight</p>
                                        <p className="font-bold text-gray-900">{product.weightMin}g</p>
                                    </div>
                                )}
                                {product.weightMax && (
                                    <div className="bg-gray-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Max Weight</p>
                                        <p className="font-bold text-gray-900">{product.weightMax}g</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
