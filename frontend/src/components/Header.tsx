import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SearchBar from './SearchBar';

export default function Header() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const cartItemCount = useCartStore((state) => state.getItemCount());
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20 md:h-24">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative overflow-hidden rounded-xl bg-primary-50 p-1 group-hover:bg-primary-100 transition-colors">
                            <img src="/tanti-logo.png" alt="Tanti Foods" className="h-12 w-auto transform group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-primary-900 leading-none tracking-tight uppercase">Tanti Foods</span>
                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5">Premium African Grocer</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-2">
                        <Link to="/" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 rounded-full transition-all hover:bg-gray-50">Home</Link>
                        <Link to="/products" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 rounded-full transition-all hover:bg-gray-50">Shop</Link>

                        {/* The Tanti Difference Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 rounded-full transition-all hover:bg-gray-50">
                                The Tanti Difference
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-3 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50">
                                <Link to="/info/about-tanti" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">About Tanti Foods</Link>
                                <Link to="/info/quality-sourcing" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Quality & Sourcing</Link>
                                <Link to="/info/our-standards" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Our Standards</Link>
                                <Link to="/info/sustainability" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Sustainability</Link>
                                <Link to="/info/community-impact" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Community & Impact</Link>
                            </div>
                        </div>

                        {/* Help Centre Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-700 hover:text-primary-600 rounded-full transition-all hover:bg-gray-50">
                                Help Centre
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-3 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2 z-50">
                                <Link to="/info/faq" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">FAQs</Link>
                                <Link to="/info/shipping" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Delivery Information</Link>
                                <Link to="/info/returns" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Returns & Refunds</Link>
                                <Link to="/contact" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Contact Us</Link>
                                <Link to="/account" className="block px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50">Account & Orders</Link>
                            </div>
                        </div>
                    </nav>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-sm mx-8">
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        <Link to="/cart" className="relative p-3 text-gray-700 hover:bg-gray-50 rounded-full transition-all group">
                            <ShoppingCart className="h-6 w-6 group-hover:text-primary-600 transition-colors" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-2 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-primary-600 rounded-full border-2 border-white">
                                    {cartItemCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative group ml-2">
                                <button className="flex items-center gap-2 p-2 pl-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-100 transition-all">
                                    <span className="text-sm font-bold text-gray-900">{user?.firstName}</span>
                                    <div className="bg-primary-600 p-1.5 rounded-full text-white">
                                        <User className="h-4 w-4" />
                                    </div>
                                </button>
                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100 z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-2">
                                    <Link to="/account" className="block px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">Personal Info</Link>
                                    <Link to="/orders" className="block px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">Order History</Link>
                                    <div className="border-t border-gray-50 my-1"></div>
                                    <button onClick={logout} className="block w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden md:flex items-center justify-center px-6 py-2.5 text-sm font-black rounded-full text-white bg-gray-900 hover:bg-gray-800 transition-all shadow-md transform active:scale-95 ml-2">
                                Member Login
                            </Link>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-3 text-gray-700 hover:bg-gray-50 rounded-full transition-all"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
                <div className="px-4 space-y-1">
                    <Link to="/products" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 hover:text-primary-600 hover:bg-primary-50">Shop All Products</Link>
                    <Link to="/about" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 hover:text-primary-600 hover:bg-primary-50">Our Story</Link>
                    <Link to="/cart" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 hover:text-primary-600 hover:bg-primary-50">My Shopping Cart</Link>
                    {!isAuthenticated ? (
                        <Link to="/login" className="block px-4 py-3 rounded-2xl text-base font-bold text-white bg-primary-600 mt-4 text-center">Sign in to Account</Link>
                    ) : (
                        <>
                            <Link to="/account" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 hover:bg-primary-50">My Profile</Link>
                            <button onClick={logout} className="w-full text-left px-4 py-3 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50">Sign out</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
