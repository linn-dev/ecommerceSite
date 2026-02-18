import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/queries/useOrderQueries';
import { useCancelOrder } from '../../hooks/queries/useOrderMutation';
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

const PAYMENT_METHOD_LABELS = {
    COD: 'Cash on Delivery',
    BANK_TRANSFER: 'Bank Transfer',
    KPAY: 'KBZ Pay',
    WAVE_PAY: 'Wave Pay',
    UAB_PAY: 'UAB Pay'
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const justPlaced = location.state?.justPlaced;
    const { data, isLoading, isError } = useOrder(id);
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
    const order = data?.data;
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            cancelOrder(id);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading order...</div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <GlassCard>
                    <div className="text-center py-8">
                        <p className="text-gray-400">Order not found</p>
                        <GlassButton onClick={() => navigate('/orders')} className="mt-4">
                            View All Orders
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Success Banner */}
            {justPlaced && (
                <GlassCard className="mb-6 border-green-500/30!">
                    <div className="flex items-center gap-3 text-green-400">
                        <i className="fa-solid fa-circle-check text-3xl"></i>
                        <div>
                            <h2 className="text-xl font-bold">Order Placed Successfully!</h2>
                            <p className="text-sm text-green-300">Thank you for your order. We'll process it shortly.</p>
                        </div>
                    </div>
                </GlassCard>
            )}
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Order #{order.id}</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                        {order.paymentStatus}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-4">
                    <GlassCard>
                        <h2 className="text-lg font-bold mb-4">Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item) => {
                                const image = item.product?.images?.[0]?.imageUrl;
                                return (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-700 last:border-0 last:pb-0">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                            {image ? (
                                                <img src={image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i className="fa-solid fa-image text-xl"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.product?.name || 'Product'}</p>
                                            {(item.size || item.color) && (
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {item.size && `Size: ${item.size}`}
                                                    {item.size && item.color && ' | '}
                                                    {item.color && `Color: ${item.color}`}
                                                </p>
                                            )}
                                            <div className="flex justify-between mt-2">
                                                <span className="text-sm text-gray-400">
                                                    {parseFloat(item.price).toLocaleString()} MMK x {item.quantity}
                                                </span>
                                                <span className="font-bold">
                                                    {(parseFloat(item.price) * item.quantity).toLocaleString()} MMK
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>
                {/* Order Summary Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Payment & Totals */}
                    <GlassCard>
                        <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Payment Method</span>
                                <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 mt-2"></div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{parseFloat(order.subtotal).toLocaleString()} MMK</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-green-400">
                                    {parseFloat(order.shippingCost) > 0
                                        ? `${parseFloat(order.shippingCost).toLocaleString()} MMK`
                                        : 'Free'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tax</span>
                                <span>{parseFloat(order.tax).toLocaleString()} MMK</span>
                            </div>
                            {parseFloat(order.discount) > 0 && (
                                <div className="flex justify-between text-green-400">
                                    <span>Discount</span>
                                    <span>-{parseFloat(order.discount).toLocaleString()} MMK</span>
                                </div>
                            )}
                            <div className="border-t border-gray-600 pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{parseFloat(order.total).toLocaleString()} MMK</span>
                            </div>
                        </div>
                    </GlassCard>
                    {/* Shipping Address */}
                    <GlassCard>
                        <h2 className="text-lg font-bold mb-3">
                            <i className="fa-solid fa-location-dot me-2"></i>
                            Shipping Address
                        </h2>
                        {order.shippingAddress && (
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">{order.shippingAddress.fullName}</p>
                                <p className="text-gray-400">{order.shippingAddress.phone}</p>
                                <p className="text-gray-300">
                                    {order.shippingAddress.addressLine}, {order.shippingAddress.city},
                                    {' '}{order.shippingAddress.state}
                                    {order.shippingAddress.zipCode && `, ${order.shippingAddress.zipCode}`},
                                    {' '}{order.shippingAddress.country}
                                </p>
                            </div>
                        )}
                    </GlassCard>
                    {/* Actions */}
                    <div className="space-y-3">
                        {order.status === 'PENDING' && (
                            <GlassButton
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="w-full py-3 text-red-400!"
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </GlassButton>
                        )}
                        <button
                            onClick={() => navigate('/products')}
                            className="w-full text-center text-gray-400 hover:text-white text-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}