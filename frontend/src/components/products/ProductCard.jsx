import { Link } from 'react-router-dom';
import GlassCard from "../glasses/GlassCard.jsx";

export default function GlassCardProductCard({ product }) {
    const renderPrice = () => {
        // if (product.hasVariants) {
        //     return `$${product.priceRange.min} - $${product.priceRange.max}`;
        // }
        return `${product.priceRange.min.toLocaleString()} MMK`;
    };

    return (
        <GlassCard className="overflow-hidden hover:shadow-lg transition-shadow p-0! border border-gray-200">
            <Link to={`/products/${product.slug}`}>
                <div className="h-48 overflow-hidden bg-gray-100 relative">
                    {product.images?.[0]?.imageUrl ? (
                        <img
                            src={product.images[0].imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                        </div>
                    )}
                    {!product.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Out of Stock
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <p className="text-sm mb-1">{product.category.name}</p>
                <Link to={`/products/${product.slug}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-gray-300 truncate">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex justify-between items-center mt-2">
                    <span className="font-bold">{renderPrice()}</span>
                    <div className="flex items-center text-sm text-yellow-500">
                        ★ {product.avgRating || 0} ({product.reviewCount})
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}