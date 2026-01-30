import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function AccountLayout() {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    const navigation = [
        { name: 'My Profile', href: '/account', icon: User },
        { name: 'Orders', href: '/orders', icon: Package },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                            Sign out
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
