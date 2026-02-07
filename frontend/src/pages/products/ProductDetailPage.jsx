import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '../../hooks/queries/useProductQueries.js'

import GlassCard from "../../components/glasses/GlassCard.jsx";
import GlassButton from "../../components/glasses/GlassButton.jsx";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError } = useProduct(slug);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    const product = data?.data;

    useEffect(() => {
        if(product) {
            setSelectedImage(0);
            setSelectedSize('');
            setSelectedColor('');
            setQuantity(1);
        }
    }, [product]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (isError || !product) return <div className="text-center py-10">Product not found</div>;

    const hasVariants = product?.hasVariants;
    const variants = product?.variants ?? [];

    // Extract unique sizes and colors
    const sizes = [...new Set((variants || []).map((variant) => variant.size).filter(Boolean))];
    const colors = [...new Set((variants || []).map((variant) => variant.color).filter(Boolean))];

    // Find selected variant
    const selectedVariant = hasVariants ? variants.find(v =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    ) : null;

    // Determine display values
    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    const isOutOfStock = currentStock === 0;

    const handleAddToCart = () => {
        if (hasVariants) {
            if (sizes.length > 0 && !selectedSize) return alert('Please select a size');
            if (colors.length > 0 && !selectedColor) return alert('Please select a color');
        }
        const cartItem = {
            productId: product.id,
            variantId: selectedVariant?.id,
            quantity,
            price: currentPrice
        };

        console.log('Adding to cart:', cartItem);
        alert('Added to cart! (Check console)');
    };

    return (
        <div className="container mx-auto px-4 py-8 min-h-full">
            <GlassCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {product.images?.length > 0 ? (
                                <img
                                    src={product.images[selectedImage].imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 ${
                                            selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                                        }`}
                                    >
                                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl mb-2 line-clamp-2">{product.name}</h1>
                        <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b-2 border-gray-200/40 border-dashed">
                            <span className="text-2xl font-bold"><span className="font-light me-1 text-xl">Ks</span>{Number(currentPrice).toLocaleString()} MMK</span>
                            <div className="flex items-center text-yellow-500 text-sm">
                                ★ {product.avgRating || 0} ({product.reviewCount} reviews)
                            </div>
                        </div>
                        <div className="pb-4 border-b-2 border-gray-200/40 border-dashed">
                            <h3>Description :</h3>
                            <p className="whitespace-pre line-clamp-6">{product.description}</p>
                        </div>
                        {/* Variant Selectors */}
                        {hasVariants && (
                            <div className="space-y-6 mb-8">
                                {sizes.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Size</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {sizes.map(size => (
                                                <button
                                                    key={size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`px-4 py-2 border rounded-md text-sm ${
                                                        selectedSize === size
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {colors.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-medium mt-4 mb-2">Color Family :</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {colors.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`px-4 py-2 border rounded-md text-sm ${
                                                        selectedColor === color
                                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {color}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Add to Cart Section */}
                        <div className="flex gap-4 mb-8">
                            <div className="w-24">
                                <label className="sr-only">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={currentStock}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full border border-gray-300 rounded-lg py-3 px-3 text-center"
                                />
                            </div>

                            <GlassButton
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}

                            >
                                {!isOutOfStock && <i className="fa-solid fa-basket-shopping me-2"></i>}
                                <span>
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </span>
                            </GlassButton>
                        </div>
                        {/* Additional Info */}
                        <div className="border-t-2 border-dashed border-gray-200/40 pt-6 text-sm space-y-2">
                            <div className="flex justify-between">
                                <span>Category:</span>
                                <span className="">{product.category.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Stock:</span>
                                <span className={isOutOfStock ? 'text-red-500' : 'text-green-600'}>
                                    {isOutOfStock ? 'Sold Out' : `${currentStock} available`}
                                </span>
                            </div>
                            {selectedVariant && (
                                <div className="flex justify-between">
                                    <span>Product Code:</span>
                                    <span className="">{selectedVariant.sku}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </GlassCard>
        </div>

        /*<div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate(-1)} className="mb-6 text-gray-600 hover:text-blue-600">
                ← Back to Products
            </button>

                {/!* RIGHT: Product Info *!/}

            </div>
            {/!* Reviews Section *!/}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                {product.reviews.length === 0 ? (
                    <p className="text-gray-500">No reviews yet.</p>
                ) : (
                    <div className="space-y-6">
                        {product.reviews.map(review => (
                            <div key={review.id} className="border-b pb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="font-bold">{review.user.firstName} {review.user.lastName}</div>
                                    <span className="text-gray-400 text-sm">• {new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex text-yellow-500 text-sm mb-2">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>*/
    );
}