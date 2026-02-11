import prisma from '../config/database.js'

// @desc Get user's address
// @route GET /api/address
// @access Private
export const getAddresses = async (req, res, next) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc'}
            ]
        });

        res.status(200).json({
            success: true,
            data: addresses,
        })
    }catch (err) {
        next(err);
    }
}

// @desc Create new address
// @route POST api/addresses
// @access Private
export const createAddress = async (req, res, next) => {
    try {
        const { fullName, phone, addressLine, city, state, zipCode, country, type, isDefault } = req.body;

        if(!fullName || !phone || !addressLine || !city || !state || !country) {
            return res.status(400).json({
                success: false,
                message: 'Please provide fullName, phone, addressLine, city, state, and country'
            });
        }

        if(isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.user.id,
                    type: type || 'SHIPPING',
                    isDefault: true
                },
                data: { isDefault: false }
            })
        }

        // If this is user's first address, make it default automatically
        const existingCount = await prisma.address.count({
            where: { userId: req.user.id }
        });

        const address = await prisma.address.create({
            fullName,
            phone,
            addressLine,
            city,
            state,
            zipCode: zipCode || null,
            country,
            type: type || 'SHIPPING',
            isDefault: isDefault || existingCount === 0
        });

         return res.status(201).json({
             success: true,
             message: 'Address created successfully',
             data: address,
         })
    }catch (err) {
        next(err);
    }
}

// @desc Update address
// @route PUT /api/addresses/:id
// @access Private
export const updateAddress = async (req, res, next) => {
    try{
        const { id } = req.params;
        const { fullName, phone, addressLine, city, state, zipCode, country, type, isDefault } = req.body;

        const address = await prisma.address.findUnique({
            where: { id: parseInt(id) },
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this address'
            });
        }

        if (isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: req.user.id,
                    type: type || address.type,
                    isDefault: true,
                    id: { not: parseInt(id) }
                },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: parseInt(id) },
            data: {
                ...(fullName && { fullName }),
                ...(phone && { phone }),
                ...(addressLine && { addressLine }),
                ...(city && { city }),
                ...(state && { state }),
                ...(zipCode !== undefined && { zipCode: zipCode || null }),
                ...(country && { country }),
                ...(type && { type }),
                ...(isDefault !== undefined && { isDefault })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddress
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await prisma.address.findUnique({
            where: { id: parseInt(id) }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this address'
            });
        }

        // Check if address is used in any order
        const orderCount = await prisma.order.count({
            where: { shippingAddressId: parseInt(id) }
        });

        if (orderCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete address linked to existing orders. You can update it instead.'
            });
        }

        await prisma.address.delete({
            where: { id: parseInt(id) }
        });

        // If deleted address was default, set another one as default
        if (address.isDefault) {
            const nextAddress = await prisma.address.findFirst({
                where: { userId: req.user.id, type: address.type }
            });

            if (nextAddress) {
                await prisma.address.update({
                    where: { id: nextAddress.id },
                    data: { isDefault: true }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
export const setDefault = async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await prisma.address.findUnique({
            where: { id: parseInt(id) }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        if (address.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Unset all defaults of same type, then set this one
        await prisma.$transaction([
            prisma.address.updateMany({
                where: {
                    userId: req.user.id,
                    type: address.type,
                    isDefault: true
                },
                data: { isDefault: false }
            }),
            prisma.address.update({
                where: { id: parseInt(id) },
                data: { isDefault: true }
            })
        ]);

        res.status(200).json({
            success: true,
            message: 'Default address updated'
        });
    } catch (error) {
        next(error);
    }
}
