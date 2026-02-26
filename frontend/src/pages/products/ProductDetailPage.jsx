import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProduct } from '../../hooks/queries/useProductQueries.js'
import { useAddToCart } from '../../hooks/queries/useCardMutation.js';
import { useCreateReview, useUpdateReview, useDeleteReview } from '../../hooks/queries/useReviewMutation.js';
import { useAuth } from '../../context/AuthContext';

import GlassCard from "../../components/glasses/GlassCard.jsx";
import GlassButton from "../../components/glasses/GlassButton.jsx";

export default function ProductDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const { mutate: addToCartMutation, isPending: isAddingToCart } = useAddToCart();
    const { mutate: submitReview, isPending: isSubmitting } = useCreateReview();
    const { mutate: editReview, isPending: isEditing } = useUpdateReview();
    const { mutate: removeReview, isPending: isDeleting } = useDeleteReview();

    const { data, isLoading, isError } = useProduct(slug);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Review state
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);

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

    const increaseQuantity = () => setQuantity(Math.min(currentStock, quantity + 1));
    const decreaseQuantity = () => setQuantity(Math.max(1, quantity - 1));

    // Check if current user already reviewed this product
    const existingReview = user
        ? product.reviews.find(r => r.user.id === user.id)
        : null;

    // ─── Cart Handler ───
    const handleAddToCart = () => {
        if (!user) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        if (hasVariants) {
            if (sizes.length > 0 && !selectedSize) return alert('Please select a size');
            if (colors.length > 0 && !selectedColor) return alert('Please select a color');
        }
        addToCartMutation(
            {
                productId: product.id,
                variantId: selectedVariant?.id || null,
                quantity
            },
            {
                onSuccess: () => alert('Added to cart!'),
                onError: (error) => alert(error.response?.data?.message || 'Failed to add to cart')
            }
        );
    };

    // ─── Review Handlers ───
    const handleSubmitReview = () => {
        if (reviewRating < 1 || reviewRating > 5) {
            return alert('Please select a rating (1-5 stars)');
        }
        submitReview(
            { productId: product.id, rating: reviewRating, comment: reviewComment || null },
            {
                onSuccess: () => {
                    setReviewRating(0);
                    setReviewComment('');
                },
                onError: (err) => alert(err.response?.data?.message || 'Failed to submit review')
            }
        );
    };

    const startEditingReview = (review) => {
        setEditingReviewId(review.id);
        setReviewRating(review.rating);
        setReviewComment(review.comment || '');
    };

    const cancelEditingReview = () => {
        setEditingReviewId(null);
        setReviewRating(0);
        setReviewComment('');
    };

    const handleUpdateReview = () => {
        if (reviewRating < 1 || reviewRating > 5) {
            return alert('Please select a rating (1-5 stars)');
        }
        editReview(
            { id: editingReviewId, rating: reviewRating, comment: reviewComment || null },
            {
                onSuccess: () => cancelEditingReview(),
                onError: (err) => alert(err.response?.data?.message || 'Failed to update review')
            }
        );
    };

    const handleDeleteReview = (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        removeReview(id, {
            onError: (err) => alert(err.response?.data?.message || 'Failed to delete review')
        });
    };

    // ─── Star Picker Component ───
    const StarPicker = ({ size = 'text-3xl' }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`${size} transition-colors`}
                >
                    <span className={
                        star <= (hoverRating || reviewRating)
                            ? 'text-yellow-400'
                            : 'text-gray-500'
                    }>★</span>
                </button>
            ))}
            {reviewRating > 0 && (
                <span className="text-sm text-gray-400 ml-2 self-center">
                    {reviewRating}/5
                </span>
            )}
        </div>
    );

    return (
        <div className="relative container mx-auto px-4 py-8 min-h-full">
            <GlassButton onClick={() => navigate(-1)} className="absolute! top-8 -left-8 p-2 w-8 h-8">
                <i className="fa-solid fa-arrow-left text-sm"></i>
            </GlassButton>
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
                        <div className="flex items-center gap-4 my-4">
                            <div className="w-30">
                                <div className="flex items-center justify-between">
                                    <GlassButton className="h-4 p-4" onClick={decreaseQuantity}>-</GlassButton>
                                    <input
                                        type="number"
                                        min="1"
                                        max={currentStock}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full font-bold text-center border-none outline-none focus:ring-0 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <GlassButton className="h-4 p-4" onClick={increaseQuantity}>+</GlassButton>
                                </div>
                            </div>

                            <GlassButton
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || isAddingToCart}
                                className="px-4 md:px-8 py-4"
                            >
                                {isAddingToCart ? (
                                    <span>Adding...</span>
                                ) : (
                                    <>
                                        {!isOutOfStock && <i className="fa-solid fa-basket-shopping me-2"></i>}
                                        <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                                    </>
                                )}
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

            {/* ═══════════════════════════════════════ */}
            {/*  Reviews Section                       */}
            {/* ═══════════════════════════════════════ */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold mb-6 text-white">Customer Reviews</h2>

                {/* ─── Review Form (logged in + no existing review + not editing) ─── */}
                {user && !existingReview && !editingReviewId && (
                    <GlassCard className="mb-8">
                        <h3 className="font-bold text-lg mb-4">Write a Review</h3>

                        {/* Star Picker */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Your Rating</label>
                            <StarPicker />
                        </div>

                        {/* Comment */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Your Comment (optional)</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={3}
                                placeholder="Share your thoughts about this product..."
                                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <GlassButton
                            onClick={handleSubmitReview}
                            disabled={isSubmitting || reviewRating === 0}
                            className="px-6 py-2"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </GlassButton>
                    </GlassCard>
                )}

                {/* Not logged in prompt */}
                {!user && (
                    <GlassCard className="mb-8 text-center">
                        <p className="text-gray-400 mb-3">Log in to write a review</p>
                        <GlassButton
                            onClick={() => navigate('/login', { state: { from: location.pathname } })}
                            className="px-6 py-2"
                        >
                            Log In
                        </GlassButton>
                    </GlassCard>
                )}

                {/* ─── Reviews List ─── */}
                {product.reviews.length === 0 ? (
                    <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="space-y-4">
                        {product.reviews.map(review => {
                            const isOwner = user && review.user.id === user.id;
                            const isAdmin = user?.role === 'ADMIN';
                            const isEditingThis = editingReviewId === review.id;

                            return (
                                <GlassCard key={review.id} className={isEditingThis ? 'border border-blue-500!' : ''}>
                                    {isEditingThis ? (
                                        /* ─── Inline Edit Mode ─── */
                                        <div>
                                            <h3 className="text-sm font-semibold text-blue-400 mb-3">
                                                Editing Your Review
                                            </h3>

                                            {/* Star Picker */}
                                            <div className="mb-4">
                                                <StarPicker />
                                            </div>

                                            {/* Comment */}
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                rows={3}
                                                className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 resize-none mb-4"
                                            />

                                            <div className="flex gap-3">
                                                <GlassButton
                                                    onClick={handleUpdateReview}
                                                    disabled={isEditing || reviewRating === 0}
                                                    className="px-6 py-2"
                                                >
                                                    {isEditing ? 'Saving...' : 'Save Changes'}
                                                </GlassButton>
                                                <button
                                                    onClick={cancelEditingReview}
                                                    className="text-gray-400 hover:text-white px-4 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ─── View Mode ─── */
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    {/* User Avatar */}
                                                    <div className="w-9 h-9 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-bold text-blue-400">
                                                        {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            {review.user.firstName} {review.user.lastName}
                                                        </span>
                                                        <span className="text-gray-500 text-sm ml-2">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                {(isOwner || isAdmin) && (
                                                    <div className="flex gap-2">
                                                        {isOwner && (
                                                            <button
                                                                onClick={() => startEditingReview(review)}
                                                                className="text-xs text-yellow-400 hover:text-yellow-300 px-2 py-1 border border-yellow-500/30 rounded"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            disabled={isDeleting}
                                                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 border border-red-500/30 rounded"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stars */}
                                            <div className="flex text-yellow-400 text-sm mb-2">
                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                            </div>

                                            {/* Comment */}
                                            {review.comment && (
                                                <p className="text-gray-300">{review.comment}</p>
                                            )}
                                        </div>
                                    )}
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
