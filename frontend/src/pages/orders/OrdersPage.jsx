import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyOrders } from '../../hooks/queries/useOrderQueries';
import GlassCard from '../../components/glasses/GlassCard';
import GlassButton from '../../components/glasses/GlassButton';

const STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    SHIPPED: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400'
};

export default function OrdersPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyOrders(page);
    const orders = data?.data || [];
    const pagination = data?.pagination;

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>
            {orders.length === 0 ? (
                <GlassCard>
                    <div className="text-center py-12">
                        <i className="fa-solid fa-box-open text-6xl text-gray-400 mb-4"></i>
                        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
                        <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
                        <GlassButton className="px-4 py-2 mx-auto" onClick={() => navigate('/products')}>
                            Start Shopping
                        </GlassButton>
                    </div>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                        const firstImage = order.items[0]?.product?.images?.[0]?.imageUrl;

                        return (
                            <GlassCard
                                key={order.id}
                                className="cursor-pointer hover:border-blue-500/30 transition-colors"
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex gap-4">
                                        {/* Preview Image */}
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                            {firstImage ? (
                                                <img src={firstImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i className="fa-solid fa-box"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold">Order #{order.id}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {itemCount} item{itemCount > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right sm:text-right">
                                        <p className="font-bold text-lg">
                                            {parseFloat(order.total).toLocaleString()} MMK
                                        </p>
                                        <p className="text-sm text-gray-400">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            <GlassButton
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2"
                            >
                                Previous
                            </GlassButton>
                            <span className="flex items-center text-gray-400 px-4">
                                Page {page} of {pagination.pages}
                            </span>
                            <GlassButton
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="px-4 py-2"
                            >
                                Next
                            </GlassButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}