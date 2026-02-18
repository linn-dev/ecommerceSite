import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/cartContext';
import { useAddresses, useCreateAddress } from '../../hooks/queries/useAddressMutation';
import { useCreateOrder } from '../../hooks/queries/useOrderMutation';
import GlassCard from '../../components/glasses/GlassCard';
import GlassButton from '../../components/glasses/GlassButton';

const PAYMENT_METHODS = [
    { value: 'COD', label: 'Cash on Delivery', icon: 'fa-money-bill-wave' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'fa-building-columns' },
    { value: 'KPAY', label: 'KBZ Pay', icon: 'fa-mobile-screen' },
    { value: 'WAVE_PAY', label: 'Wave Pay', icon: 'fa-mobile-screen' },
    { value: 'UAB_PAY', label: 'UAB Pay', icon: 'fa-mobile-screen' }
];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cartItems, cartTotal, isLoading: cartLoading } = useCart();
    const { data: addressData, isLoading: addressLoading } = useAddresses();
    const { mutate: createAddress, isPending: isCreatingAddress } = useCreateAddress();
    const { mutate: placeOrder, isPending: isPlacingOrder } = useCreateOrder();
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Myanmar'
    });

    const addresses = addressData?.data || [];

    // Auto-select default address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr.id : addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    // Redirect if cart is empty
    useEffect(() => {
        if (!cartLoading && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartLoading, cartItems, navigate]);

    const handleAddressInputChange = (e) => {
        setAddressForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleCreateAddress = (e) => {
        e.preventDefault();
        // Basic validation
        const { fullName, phone, addressLine, city, state, country } = addressForm;
        if (!fullName || !phone || !addressLine || !city || !state || !country) {
            alert('Please fill in all required fields');
            return;
        }
        createAddress(addressForm, {
            onSuccess: (data) => {
                setSelectedAddressId(data.data.id);
                setShowAddressForm(false);
                setAddressForm({
                    fullName: '',
                    phone: '',
                    addressLine: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Myanmar'
                });
            },
            onError: (error) => {
                alert(error.response?.data?.message || 'Failed to create address');
            }
        });
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            alert('Please select a shipping address');
            return;
        }
        placeOrder(
            {
                shippingAddressId: selectedAddressId,
                paymentMethod
            },
            {
                onSuccess: (data) => {
                    navigate(`/orders/${data.data.id}`, {
                        state: { justPlaced: true }
                    });
                },
                onError: (error) => {
                    alert(error.response?.data?.message || 'Failed to place order');
                }
            }
        );
    };

    if (cartLoading || addressLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading checkout...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Address & Payment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address Section */}
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4">
                            <i className="fa-solid fa-location-dot me-2"></i>
                            Shipping Address
                        </h2>
                        {addresses.length === 0 && !showAddressForm ? (
                            <div className="text-center py-6">
                                <p className="text-gray-400 mb-4">No saved addresses</p>
                                <GlassButton className="px-4 py-2 mx-auto" onClick={() => setShowAddressForm(true)}>
                                    <i className="fa-solid fa-plus me-2"></i>
                                    Add Address
                                </GlassButton>
                            </div>
                        ) : (
                            <>
                                {/* Address List */}
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <label
                                            key={addr.id}
                                            className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedAddressId === addr.id
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-gray-600 hover:border-gray-400'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{addr.fullName}</span>
                                                        {addr.isDefault && (
                                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-400 mt-1">{addr.phone}</p>
                                                    <p className="text-sm text-gray-300 mt-1">
                                                        {addr.addressLine}, {addr.city}, {addr.state}
                                                        {addr.zipCode && `, ${addr.zipCode}`}, {addr.country}
                                                    </p>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {/* Add New Address Toggle */}
                                {!showAddressForm && (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                                    >
                                        <i className="fa-solid fa-plus me-1"></i>
                                        Add New Address
                                    </button>
                                )}
                            </>
                        )}
                        {/* Address Form */}
                        {showAddressForm && (
                            <form onSubmit={handleCreateAddress} className="mt-4 border-t border-gray-600 pt-4">
                                <h3 className="font-semibold mb-3">New Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={addressForm.fullName}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Phone *</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={addressForm.phone}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm mb-1">Address *</label>
                                        <input
                                            type="text"
                                            name="addressLine"
                                            value={addressForm.addressLine}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={addressForm.city}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">State/Region *</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={addressForm.state}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Zip Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={addressForm.zipCode}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm mb-1">Country *</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={addressForm.country}
                                            onChange={handleAddressInputChange}
                                            className="w-full p-2 bg-white/5 border border-gray-600 rounded focus:outline-none focus:border-slate-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    <GlassButton className={'px-4 py-2'} type="submit" disabled={isCreatingAddress}>
                                        {isCreatingAddress ? 'Saving...' : 'Save Address'}
                                    </GlassButton>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </GlassCard>
                    {/* Payment Method Section */}
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4">
                            <i className="fa-solid fa-credit-card me-2"></i>
                            Payment Method
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PAYMENT_METHODS.map((method) => (
                                <label
                                    key={method.value}
                                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                        paymentMethod === method.value
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.value}
                                        checked={paymentMethod === method.value}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <i className={`fa-solid ${method.icon} text-lg`}></i>
                                    <span>{method.label}</span>
                                </label>
                            ))}
                        </div>
                    </GlassCard>
                </div>
                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        {/* Items */}
                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                            {cartItems.map((item) => {
                                const price = item.variant
                                    ? parseFloat(item.variant.price)
                                    : parseFloat(item.product.price);
                                const image = item.product.images?.[0]?.imageUrl;
                                return (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-14 h-14 bg-gray-200 rounded overflow-hidden shrink-0">
                                            {image ? (
                                                <img src={image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <i className="fa-solid fa-image"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm line-clamp-1">{item.product.name}</p>
                                            {item.variant && (
                                                <p className="text-xs text-gray-400">
                                                    {item.variant.size && item.variant.size}
                                                    {item.variant.size && item.variant.color && ' / '}
                                                    {item.variant.color && item.variant.color}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-400">x{item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-semibold">
                                            {(price * item.quantity).toLocaleString()} MMK
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Totals */}
                        <div className="border-t border-gray-600 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{cartTotal.toLocaleString()} MMK</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Tax</span>
                                <span>0 MMK</span>
                            </div>
                            <div className="border-t border-gray-600 pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{cartTotal.toLocaleString()} MMK</span>
                            </div>
                        </div>
                        {/* Place Order Button */}
                        <GlassButton
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || !selectedAddressId}
                            className="w-full py-3 mt-6"
                        >
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </GlassButton>
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-full mt-3 text-center text-gray-400 hover:text-white text-sm"
                        >
                            Back to Cart
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}