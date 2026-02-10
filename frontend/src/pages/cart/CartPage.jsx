import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useUpdateCartItem, useRemoveCartItem, useClearCart } from "../../hooks/queries/useCardMutation";
import GlassCard from "../../components/glasses/GlassCard";
import GlassButton from "../../components/glasses/GlassButton";

export default function CartPage() {
    const navigate = useNavigate();
    const { cartItems, cartTotal, isLoading } = useCart();
    const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
    const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
    const { mutate: clearAllItems, isPending: isClearing } = useClearCart();

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        updateItem({ itemId, quantity: newQuantity });
    };

    const handleRemoveItem = (itemId) => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            removeItem(itemId);
        }
    };

    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            clearAllItems();
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading cart...</div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <GlassCard>
                    <div className="text-center py-12">
                        <i className="fa-solid fa-cart-shopping text-6xl text-gray-400 mb-4"></i>
                        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                        <p className="text-gray-400 mb-6">Looks like you haven't added anything to your cart yet.</p>
                        <GlassButton onClick={() => navigate("/products")} className="p-3 mx-auto">
                            Continue Shopping
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
                <GlassButton
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="text-red-400! px-6 py-2 text-sm font-bold"
                >
                    Clear All
                </GlassButton>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((item) => {
                        const price = item.variant
                            ? parseFloat(item.variant.price)
                            : parseFloat(item.product.price);
                        const image = item.product.images?.[0]?.imageUrl;
                        const stock = item.variant ? item.variant.stock : item.product.stock;
                        return (
                            <GlassCard key={item.id} className="">
                                <div className="flex gap-4">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <i className="fa-solid fa-image text-2xl"></i>
                                            </div>
                                        )}
                                    </div>
                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/products/${item.product.slug}`}
                                            className="font-semibold hover:text-blue-400 line-clamp-1"
                                        >
                                            {item.product.name}
                                        </Link>
                                        {/* Variant Info */}
                                        {item.variant && (
                                            <div className="text-sm mt-1">
                                                {item.variant.size && <span>Size: {item.variant.size}</span>}
                                                {item.variant.size && item.variant.color && <span> | </span>}
                                                {item.variant.color && <span>Color: {item.variant.color}</span>}
                                            </div>
                                        )}
                                        <div className="text-lg font-bold mt-2">
                                            {price.toLocaleString()} MMK
                                        </div>
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center border border-gray-400 rounded">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1 || isUpdating}
                                                    className="px-3 py-1 hover:bg-white/10 disabled:opacity-50"
                                                >
                                                    -
                                                </button>
                                                <span className="px-4 py-1 border-x border-gray-400">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= stock || isUpdating}
                                                    className="px-3 py-1 hover:bg-white/10 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <GlassButton
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={isRemoving}
                                                className="text-red-400! px-4 py-2 text-sm font-bold"
                                            >
                                                <i className="fa-solid fa-trash me-1"></i>
                                                Remove
                                            </GlassButton>
                                        </div>
                                    </div>
                                    {/* Item Total */}
                                    <div className="text-right">
                                        <div className="font-bold">
                                            {(price * item.quantity).toLocaleString()} MMK
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <GlassCard>
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{cartTotal.toLocaleString()} MMK</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Shipping</span>
                                <span className="text-green-400">Free</span>
                            </div>
                            <div className="border-t border-gray-600 pt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{cartTotal.toLocaleString()} MMK</span>
                            </div>
                        </div>
                        <GlassButton
                            onClick={() => navigate("/checkout")}
                            className="w-full py-3"
                        >
                            Proceed to Checkout
                        </GlassButton>
                        <button
                            onClick={() => navigate("/products")}
                            className="w-full mt-3 text-center text-gray-400 hover:text-white"
                        >
                            Continue Shopping
                        </button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}