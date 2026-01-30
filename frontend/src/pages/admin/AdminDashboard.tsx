import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Truck, Users, Calendar, MapPin, BarChart3, Layers, Tag } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    to="/admin/products"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Products</h2>
                    </div>
                    <p className="text-gray-600">Manage product catalog, pricing, and inventory</p>
                </Link>

                <Link
                    to="/admin/orders"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ShoppingBag className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Orders</h2>
                    </div>
                    <p className="text-gray-600">View and manage customer orders</p>
                </Link>

                <Link
                    to="/admin/analytics"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Analytics</h2>
                    </div>
                    <p className="text-gray-600">View sales reports and performance metrics</p>
                </Link>

                <Link
                    to="/admin/delivery-slots"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Delivery Slots</h2>
                    </div>
                    <p className="text-gray-600">Manage delivery time slots and availability</p>
                </Link>

                <Link
                    to="/admin/delivery-zones"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <MapPin className="h-6 w-6 text-orange-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Delivery Zones</h2>
                    </div>
                    <p className="text-gray-600">Configure delivery areas and pricing</p>
                </Link>

                <Link
                    to="/admin/customers"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-pink-100 rounded-lg">
                            <Users className="h-6 w-6 text-pink-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Customers</h2>
                    </div>
                    <p className="text-gray-600">Manage customer accounts and B2B profiles</p>
                </Link>

                <Link
                    to="/admin/search-synonyms"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Truck className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Search Synonyms</h2>
                    </div>
                    <p className="text-gray-600">Configure search keyword mappings</p>
                </Link>

                <Link
                    to="/admin/categories"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-600 transition-colors">
                            <Layers className="h-6 w-6 text-indigo-600 group-hover:text-white" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900 uppercase tracking-tight">Categories</h2>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Manage product aisles and sorting</p>
                </Link>

                <Link
                    to="/admin/vouchers"
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <Tag className="h-6 w-6 text-red-600" />
                        </div>
                        <h2 className="ml-4 text-xl font-semibold text-gray-900">Vouchers</h2>
                    </div>
                    <p className="text-gray-600">Create and manage discount vouchers</p>
                </Link>
            </div>
        </div>
    );
}
