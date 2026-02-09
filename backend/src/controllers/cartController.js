import prisma from "../config/database.js"

const getCartWithDetails = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: {
                                where: { isPrimary: true },
                                take: 1
                            }
                        }
                    },
                    variant: true
                }
            }
        }
    });
    // If no cart exists, return empty structure
    if (!cart) {
        return {
            id: null,
            userId,
            items: [],
            itemCount: 0,
            subtotal: 0
        };
    }
    // Calculate totals
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => {
        const price = item.variant ? parseFloat(item.variant.price) : parseFloat(item.product.price);
        return sum + (price * item.quantity);
    }, 0);
    return {
        ...cart,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100
    };
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await getCartWithDetails(userId);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { productId, variantId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const pId = parseInt(productId);
        const vId = variantId ? parseInt(variantId) : null;
        const qty = parseInt(quantity);

        if (qty < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await prisma.product.findUnique({
            where: { id: pId },
            include: { variants: true }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.hasVariants && !vId) {
            return res.status(400).json({ success: false, message: "Please select variant (size/color)" });
        }

        let variant = null;
        if (vId) {
            variant = product.variants.find(v => v.id === vId);
            if (!variant) {
                return res.status(404).json({ success: false, message: 'Variant not found' });
            }
        }

        const availableStock = variant ? variant.stock : product.stock;

        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId_variantId: {
                    cartId: cart.id,
                    productId: pId,
                    variantId: vId,
                }
            }
        });

        if (existingItem) {
            const newQuantity = existingItem.quantity + qty;
            if (newQuantity > availableStock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Stock limit: ${availableStock}`
                });
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        } else {
            if (qty > availableStock) {
                return res.status(400).json({ success: false, message: "Insufficient stock" });
            }

            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: pId,
                    variantId: vId,
                    quantity: qty
                }
            });
        }

        const updatedCart = await getCartWithDetails(userId);

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: updatedCart
        });

    } catch (err) {
        console.error("Add To Cart Error:", err);
        next(err);
    }
}

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if(!quantity || quantity < 1) {
            return res.status(400).json({
                success: "false",
                message: "Quantity must be at least 1"
            });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: parseInt(itemId)},
            include: {
                cart: true,
                product: true,
                quantity: true
            }
        });

        if(!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            })
        }

        // Security: verify item of user's cart
        if(cartItem.cart.userId !== userId) {
            return res.status(400).json({
                success: "false",
                message: "Not authorized to update this item"
            });
        }

        const availableStock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
        if (quantity > availableStock) {
            return res.status(400).json({
                success: false,
                message: `Only ${availableStock} items available in stock`
            });
        }

        await prisma.cartItem.update({
            where: {id: parseInt(itemId)},
            data: { quantity }
        });

        const updatedCart = await getCartWithDetails(userId);

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: updatedCart
        });

    }catch(err) {
        next(err);
    }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
export const removeCartItem = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: parseInt(itemId) },
            include: { cart: true }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Security: verify item of user's cart
        if (cartItem.cart.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to remove this item'
            });
        }

        await prisma.cartItem.delete({
            where: { id: parseInt(itemId) }
        });

        const updatedCart = await getCartWithDetails(userId);

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: updatedCart
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Clear all items from cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: {
                id: cart?.id || null,
                userId,
                items: [],
                itemCount: 0,
                subtotal: 0
            }
        });
    } catch (error) {
        next(error);
    }
};