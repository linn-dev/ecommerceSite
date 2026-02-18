import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllOrders } from '../../hooks/queries/useOrderQueries';
import { useUpdateOrderStatus } from '../../hooks/queries/useOrderMutation';
import GlassCard from '../../components/glasses/GlassCard';
import GlassButton from '../../components/glasses/GlassButton';

const STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PROCESSING: 'bg-blue-500/20 text-blue-400',
    SHIPPED: 'bg-purple-500/20 text-purple-400',
    DELIVERED: 'bg-green-500/20 text-green-400',
    CANCELLED: 'bg-red-500/20 text-red-400'
};

const PAYMENT_STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    PAID: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
    REFUNDED: 'bg-gray-500/20 text-gray-400'
};

const NEXT_STATUS = {
    PENDING: 'PROCESSING',
    PROCESSING: 'SHIPPED',
    SHIPPED: 'DELIVERED'
};

export default function AdminOrdersPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');

    const { data, isLoading } = useAllOrders({
        page,
        status: statusFilter || undefined,
        paymentStatus: paymentFilter || undefined
    });

    const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
    const orders = data?.data || [];
    const pagination = data?.pagination;

    const handleStatusChange = (orderId, newStatus) => {
        updateStatus({ id: orderId, status: newStatus });
    };

    const handlePaymentStatusChange = (orderId, newPaymentStatus) => {
        updateStatus({ id: orderId, paymentStatus: newPaymentStatus });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading orders...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Order Management</h1>
            {/* Filters */}
            <GlassCard className="mb-6">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Order Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="p-2 bg-white/5 border border-gray-600 rounded text-white"
                        >
                            <option value="">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Payment Status</label>
                        <select
                            value={paymentFilter}
                            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
                            className="p-2 bg-white/5 border border-gray-600 rounded text-white"
                        >
                            <option value="">All</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                </div>
            </GlassCard>
            {orders.length === 0 ? (
                <GlassCard>
                    <div className="text-center py-8 text-gray-400">
                        No orders found
                    </div>
                </GlassCard>
            ) : (
                <>
                    {/* Orders Table */}
                    <GlassCard className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-gray-600">
                                <th className="text-left p-3">Order ID</th>
                                <th className="text-left p-3">Customer</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Items</th>
                                <th className="text-left p-3">Total</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Payment</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order) => (
                                <tr key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="border-b border-gray-700 hover:bg-white/5 cursor-pointer">
                                    <td className="p-3">
                                        <span className="text-blue-400 hover:text-blue-300 font-medium">
                                            #{order.id}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div>{order.user.firstName} {order.user.lastName}</div>
                                        <div className="text-gray-400 text-xs">{order.user.email}</div>
                                    </td>
                                    <td className="p-3 text-gray-400">
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="p-3">{order.itemCount}</td>
                                    <td className="p-3 font-semibold">
                                        {parseFloat(order.total).toLocaleString()} MMK
                                    </td>
                                    <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                                                {order.status}
                                            </span>
                                    </td>
                                    <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                                                {order.paymentStatus}
                                            </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            {NEXT_STATUS[order.status] && (
                                                <button
                                                    onClick={() => handleStatusChange(order.id, NEXT_STATUS[order.status])}
                                                    disabled={isUpdating}
                                                    className="text-xs text-blue-400 hover:text-blue-300"
                                                    title={`Move to ${NEXT_STATUS[order.status]}`}
                                                >
                                                    {NEXT_STATUS[order.status]}
                                                </button>
                                            )}
                                            {order.paymentStatus === 'PENDING' && (
                                                <button
                                                    onClick={() => handlePaymentStatusChange(order.id, 'PAID')}
                                                    disabled={isUpdating}
                                                    className="text-xs text-green-400 hover:text-green-300"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                                                    disabled={isUpdating}
                                                    className="text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </GlassCard>
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
                </>
            )}
        </div>
    );
}