import { useState } from 'react';
import { useAvailableCoupons } from '../../hooks/queries/useCouponQueries';
import GlassCard from '../../components/glasses/GlassCard';

export default function CouponsPage() {
    const { data, isLoading, isError } = useAvailableCoupons();
    const [copiedCode, setCopiedCode] = useState(null);

    const coupons = data?.data || [];

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-white text-center">Loading coupons...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-400 text-center">Failed to load coupons</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-2">Coupons & Deals</h1>
            <p className="text-gray-400 mb-6">Browse available coupons and save on your next order</p>

            {coupons.length === 0 ? (
                <GlassCard>
                    <div className="text-center py-12">
                        <i className="fa-solid fa-ticket text-4xl text-gray-500 mb-4"></i>
                        <p className="text-gray-400 text-lg">No coupons available right now</p>
                        <p className="text-gray-500 text-sm mt-2">Check back later for new deals</p>
                    </div>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => {
                        const isPercentage = coupon.discountType === 'PERCENTAGE';
                        const daysLeft = Math.ceil(
                            (new Date(coupon.validUntil) - new Date()) / (1000 * 60 * 60 * 24)
                        );

                        return (
                            <GlassCard key={coupon.id}>
                                {/* Discount Badge */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-2xl font-bold text-blue-400">
                                        {isPercentage
                                            ? `${parseFloat(coupon.discountValue)}% OFF`
                                            : `${parseFloat(coupon.discountValue).toLocaleString()} MMK OFF`
                                        }
                                    </span>
                                    {daysLeft <= 3 && (
                                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                                            {daysLeft <= 0 ? 'Expiring today' : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}
                                        </span>
                                    )}
                                </div>

                                {/* Code */}
                                <div className="flex items-center gap-2 mb-3">
                                    <code className="flex-1 text-center py-2 px-3 bg-white/5 border border-dashed border-gray-500 rounded font-mono text-lg tracking-wider">
                                        {coupon.code}
                                    </code>
                                    <button
                                        onClick={() => handleCopyCode(coupon.code)}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                            copiedCode === coupon.code
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                        }`}
                                    >
                                        {copiedCode === coupon.code ? (
                                            <><i className="fa-solid fa-check me-1"></i>Copied</>
                                        ) : (
                                            <><i className="fa-solid fa-copy me-1"></i>Copy</>
                                        )}
                                    </button>
                                </div>

                                {/* Description */}
                                {coupon.description && (
                                    <p className="text-gray-300 text-sm mb-3">{coupon.description}</p>
                                )}

                                {/* Details */}
                                <div className="space-y-1 text-xs text-gray-400 border-t border-gray-700 pt-3">
                                    {coupon.minPurchase && (
                                        <p>
                                            <i className="fa-solid fa-cart-shopping me-1"></i>
                                            Min. purchase: {parseFloat(coupon.minPurchase).toLocaleString()} MMK
                                        </p>
                                    )}
                                    {isPercentage && coupon.maxDiscount && (
                                        <p>
                                            <i className="fa-solid fa-arrow-down me-1"></i>
                                            Max discount: {parseFloat(coupon.maxDiscount).toLocaleString()} MMK
                                        </p>
                                    )}
                                    <p>
                                        <i className="fa-solid fa-calendar me-1"></i>
                                        Valid until: {new Date(coupon.validUntil).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
