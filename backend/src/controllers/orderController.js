import prisma from "../config/database.js";

// @desc Create order from cart
// @route POST api/orders
// @access Private
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { shippingAddressId, paymentMethod = "COD" } = req.body;

        if(!shippingAddressId) {
            return res.status(400).json({
                success: false,
                message: "Please select a shipping address"
            });
        }

        const address = await prisma.address.findUnique({
            where: { id: parseInt(shippingAddressId) }
        });

        if(!address || address.userId !== userId) {
            return res.status(404).json({
                success: false,
                message: "Shipping address not found"
            });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    }
                }
            }
        });

        if(!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        const order = await prisma.$transaction(async (tx) => {
            const orderItems = [];
            let subtotal = 0;

            for (const item of cart.items) {
                const product = item.product;
                const variant = item.variant;
                const availableStock = variant ? variant.stock : product.stock;

                if(item.quantity > availableStock) {
                    throw new Error(`"${product.name}"${variant ? ` (${variant.size || ''})` : ''} only has ${availableStock} in stock`);
                }

                // Get price from DB
                const price = variant ? parseFloat(variant.price) : parseFloat(product.price);

                subtotal += price * item.quantity;

                orderItems.push({
                    productId: product.id,
                    variantId: variant?.id || null,
                    quantity: item.quantity,
                    price,
                    size: variant?.size || null,
                    color: variant?.color || null
                });

                // Prepare stock deduction
                if (variant) {
                    await tx.productVariant.update({
                        where: { id: variant.id },
                        data: { stock: { decrement: item.quantity } }
                    });
                } else {
                    await tx.product.update({
                        where: { id: product.id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }

            const total = subtotal;

            const newOrder = await tx.order.create({
                data: {
                    userId,
                    shippingAddressId: parseInt(shippingAddressId),
                    subtotal, tax: 0, shippingCost: 0, total,
                    paymentMethod,
                    items: { create: orderItems }
                }
            });

            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return newOrder;
        }, {
            timeout: 10000
        });

        // Fetch complete order
        const completeOrder = await prisma.order.findUnique({
            where: { id: order.id },
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
                        }
                    }
                },
                shippingAddress: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: completeOrder
        });
    }catch(err) {
        if (err.message.includes('stock')) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(err);
    }
}

// @desc    Get current user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
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
                            }
                        }
                    },
                    shippingAddress: true
                }
            }),
            prisma.order.count({ where: { userId } })
        ]);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch(err) {
        next(err);
    }
}

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
export const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
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
                        }
                    }
                },
                shippingAddress: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Only owner or admin can view
        if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            paymentStatus,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: order },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                            price: true
                        }
                    },
                    shippingAddress: true
                }
            }),
            prisma.order.count({ where })
        ]);

        // Add item count to each order
        const ordersWithMeta = orders.map(o => ({
            ...o,
            itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0)
        }));
        res.status(200).json({
            success: true,
            data: ordersWithMeta,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate status transitions
        const validTransitions = {
            PENDING: ['PROCESSING', 'CANCELLED'],
            PROCESSING: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: []
        };

        if (status && !validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        // If cancelling, restore stock
        if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: parseInt(id) }
            });
            await prisma.$transaction(async (tx) => {
                for (const item of orderItems) {
                    if (item.variantId) {
                        await tx.productVariant.update({
                            where: { id: item.variantId },
                            data: { stock: { increment: item.quantity } }
                        });
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } }
                        });
                    }
                }
                await tx.order.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'CANCELLED',
                        ...(paymentStatus && { paymentStatus })
                    }
                });
            });
        } else {
            await prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    ...(status && { status }),
                    ...(paymentStatus && { paymentStatus })
                }
            });
        }

        // Fetch updated order
        const updatedOrder = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: true,
                shippingAddress: true,
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { items: true }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        if (order.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            });
        }

        // Restore stock and cancel in transaction
        await prisma.$transaction(async (tx) => {
            for (const item of order.items) {
                if (item.variantId) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: { increment: item.quantity } }
                    });
                } else {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }

            await tx.order.update({
                where: { id: parseInt(id) },
                data: { status: 'CANCELLED' }
            });
        });

        const cancelledOrder = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: { where: { isPrimary: true }, take: 1 }
                            }
                        }
                    }
                },
                shippingAddress: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: cancelledOrder
        });
    } catch (error) {
        next(error);
    }
};