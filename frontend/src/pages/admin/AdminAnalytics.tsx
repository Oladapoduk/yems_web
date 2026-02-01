import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import api from '../../services/api';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    topProducts: Array<{
        productName: string;
        totalSold: number;
        revenue: number;
    }>;
    lowStockProducts: Array<{
        id: string;
        name: string;
        stockQuantity: number;
        category: { name: string };
    }>;
    recentOrders: Array<{
        orderNumber: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
    ordersByStatus: Record<string, number>;
}

export default function AdminAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/analytics/dashboard?range=${timeRange}`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Failed to load analytics data</p>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Revenue',
            value: `£${(Number(data.totalRevenue) || 0).toFixed(2)}`,
            change: data.revenueGrowth,
            icon: DollarSign,
            color: 'green'
        },
        {
            title: 'Total Orders',
            value: data.totalOrders.toString(),
            change: data.ordersGrowth,
            icon: ShoppingCart,
            color: 'blue'
        },
        {
            title: 'Avg Order Value',
            value: `£${(Number(data.averageOrderValue) || 0).toFixed(2)}`,
            change: 0,
            icon: TrendingUp,
            color: 'purple'
        },
        {
            title: 'Low Stock Items',
            value: data.lowStockProducts.length.toString(),
            change: 0,
            icon: AlertTriangle,
            color: 'red'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track your store's performance</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                        </select>
                        <Link
                            to="/admin"
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    const isPositive = stat.change > 0;
                    const isNegative = stat.change < 0;

                    return (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                                    <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                                </div>
                                {stat.change !== 0 && (
                                    <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> :
                                            isNegative ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
                                        {Math.abs(stat.change)}%
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="space-y-4">
                        {data.topProducts.length > 0 ? (
                            data.topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{product.productName}</p>
                                        <p className="text-sm text-gray-500">{product.totalSold} units sold</p>
                                    </div>
                                    <p className="font-semibold text-green-600">£{(Number(product.revenue) || 0).toFixed(2)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">No sales data yet</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        Low Stock Alerts
                    </h2>
                    <div className="space-y-4">
                        {data.lowStockProducts.length > 0 ? (
                            data.lowStockProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.category.name}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                                        {product.stockQuantity} left
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">All products well stocked</p>
                        )}
                    </div>
                    {data.lowStockProducts.length > 0 && (
                        <Link
                            to="/admin/products"
                            className="mt-4 block text-center text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            Manage Inventory →
                        </Link>
                    )}
                </div>
            </div>

            {/* Orders by Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(data.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-sm text-gray-600 mt-1">{status.replace(/_/g, ' ')}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
                <div className="space-y-3">
                    {data.recentOrders.length > 0 ? (
                        data.recentOrders.map((order) => (
                            <div key={order.orderNumber} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {order.status}
                                    </span>
                                    <p className="font-semibold text-gray-900">£{(Number(order.total) || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No recent orders</p>
                    )}
                </div>
                <Link
                    to="/admin/orders"
                    className="mt-4 block text-center text-sm text-green-600 hover:text-green-700 font-medium"
                >
                    View All Orders →
                </Link>
            </div>
        </div>
    );
}
