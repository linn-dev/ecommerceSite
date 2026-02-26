import prisma from "../config/database.js"

function calculateDiscount(coupon, subtotal) {
    let discount = 0;
    if(coupon.discountType === "PERCENTAGE") {
        discount = (parseFloat(coupon.discountValue) / 100) * subtotal;
        if(coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) {
            discount = parseFloat(coupon.maxDiscount)
        }
    }else {
        discount = (parseFloat(coupon.discountValue));
    }

    return Math.round(Math.min(discount, subtotal) * 100) / 100;
}

function validateCouponData(coupon, subtotal) {
    if(!coupon) {
        return { valid: false, message: "Coupon not found" };
    }

    if(!coupon.isActive) {
        return { valid: false, message: "This coupon is no longer active" };
    }

    const now = new Date();
    if(now < new Date(coupon.validFrom)) {
        return { valid: false, message: "This coupon is not yet valid" };
    }

    if(now > new Date(coupon.validUntil)) {
        return { valid: false, message: "This coupon has expired" };
    }

    if(coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: "This coupon has reached its usage limit" }
    }

    if(coupon.minPurchase && subtotal < coupon.minPurchase) {
        return { valid: false, message: `Minimum of ${parseFloat(coupon.minPurchase).toLocaleString()} MMK required`}
    }

    return {
        valid: true
    }
}

export { calculateDiscount, validateCouponData }; // to used from order controller

// @desc Get available coupons (public)
// @routes Get /api/coupons/available
// @access Public
export const getAvailableCoupons = async (req, res, next) => {
    try {
        const now = new Date();
        const coupons = await prisma.coupon.findMany({
            where: {
                isActive:true,
                validFrom: { lte: now },
                validUntil: { gte: now },
                OR: [
                    { usageLimit: null },
                    { usedCount: { lt: prisma.coupon.fields?.usageLimit } }
                ]
            },
            select: {
                id: true,
                code: true,
                description: true,
                discountType: true,
                discountValue: true,
                minPurchase: true,
                maxDiscount: true,
                validFrom: true,
                validUntil: true,
            },
            orderBy: { validUntil: 'asc'}
        });

        const availableCoupons = [];

        const allCoupons = await prisma.coupon.findMany({
            where: {
                isActive: true,
                validFrom: { lte: now },
                validUntil: { gte: now }
            },
            orderBy: { validUntil: 'asc' }
        });

        for (const coupon of allCoupons) {
            if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
                availableCoupons.push({
                    id: coupon.id,
                    code: coupon.code,
                    description: coupon.description,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    minPurchase: coupon.minPurchase,
                    maxDiscount: coupon.maxDiscount,
                    validFrom: coupon.validFrom,
                    validUntil: coupon.validUntil
                });
            }
        }

        res.status(200).json({
            success: true,
            data: availableCoupons
        });
    }catch(err) {
        next(err);
    }
}

// @desc    Validate and preview coupon discount
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || !subtotal) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code and subtotal are required'
            });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() }
        });

        const validation = validateCouponData(coupon, parseFloat(subtotal));
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message
            });
        }

        const discountAmount = calculateDiscount(coupon, parseFloat(subtotal));

        const newTotal = parseFloat(subtotal) - discountAmount;

        res.status(200).json({
            success: true,
            data: {
                valid: true,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount,
                newTotal: Math.round(newTotal * 100) / 100
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: coupons
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single coupon (admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({
            where: { id: parseInt(id) }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            validFrom,
            validUntil,
            usageLimit
        } = req.body;

        // Validation
        if (!code || !discountType || !discountValue || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Code, discount type, discount value, valid from, and valid until are required'
            });
        }

        if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: 'Discount type must be PERCENTAGE or FIXED'
            });
        }

        if (parseFloat(discountValue) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Discount value must be greater than 0'
            });
        }

        if (discountType === 'PERCENTAGE' && parseFloat(discountValue) > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount cannot exceed 100%'
            });
        }

        if (new Date(validUntil) <= new Date(validFrom)) {
            return res.status(400).json({
                success: false,
                message: 'Valid until must be after valid from'
            });
        }

        // Check for duplicate code
        const existing = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase().trim() }
        });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A coupon with this code already exists'
            });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase().trim(),
                description: description || null,
                discountType,
                discountValue: parseFloat(discountValue),
                minPurchase: minPurchase ? parseFloat(minPurchase) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                validFrom: new Date(validFrom),
                validUntil: new Date(validUntil),
                usageLimit: usageLimit ? parseInt(usageLimit) : null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            validFrom,
            validUntil,
            usageLimit,
            isActive
        } = req.body;

        const coupon = await prisma.coupon.findUnique({
            where: { id: parseInt(id) }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // If code is being changed, check uniqueness
        if (code && code.toUpperCase().trim() !== coupon.code) {
            const existing = await prisma.coupon.findUnique({
                where: { code: code.toUpperCase().trim() }
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'A coupon with this code already exists'
                });
            }
        }

        // Validate discount type if provided
        if (discountType && !['PERCENTAGE', 'FIXED'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: 'Discount type must be PERCENTAGE or FIXED'
            });
        }

        const updatedCoupon = await prisma.coupon.update({
            where: { id: parseInt(id) },
            data: {
                ...(code && { code: code.toUpperCase().trim() }),
                ...(description !== undefined && { description: description || null }),
                ...(discountType && { discountType }),
                ...(discountValue && { discountValue: parseFloat(discountValue) }),
                ...(minPurchase !== undefined && { minPurchase: minPurchase ? parseFloat(minPurchase) : null }),
                ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
                ...(validFrom && { validFrom: new Date(validFrom) }),
                ...(validUntil && { validUntil: new Date(validUntil) }),
                ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
                ...(isActive !== undefined && { isActive })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: updatedCoupon
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params;
        const coupon = await prisma.coupon.findUnique({
            where: { id: parseInt(id) }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        await prisma.coupon.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};