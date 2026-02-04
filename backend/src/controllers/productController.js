import prisma from '../config/database.js';
import { uploadToCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

// @desc    Get all products with filters & pagination
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            search,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build filter object
        const where = {};

        if (category) {
            where.category = {
                slug: category
            };
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Price filter - check both base price and variant prices
        if (minPrice || maxPrice) {
            where.OR = [
                // Products without variants
                {
                    hasVariants: false,
                    price: {
                        ...(minPrice && { gte: parseFloat(minPrice) }),
                        ...(maxPrice && { lte: parseFloat(maxPrice) })
                    }
                },
                // Products with variants
                {
                    hasVariants: true,
                    variants: {
                        some: {
                            price: {
                                ...(minPrice && { gte: parseFloat(minPrice) }),
                                ...(maxPrice && { lte: parseFloat(maxPrice) })
                            }
                        }
                    }
                }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get products with relationships
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { [sortBy]: order },
                include: {
                    category: {
                        select: { id: true, name: true, slug: true }
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    variants: {
                        select: {
                            id: true,
                            sku: true,
                            size: true,
                            color: true,
                            price: true,
                            stock: true
                        }
                    },
                    reviews: {
                        select: { rating: true }
                    }
                }
            }),
            prisma.product.count({ where })
        ]);

        // Calculate average rating and determine price range for each product
        const productsWithMeta = products.map(product => {
            const avgRating = product.reviews.length > 0
                ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
                : 0;

            // Determine price range
            let priceRange = { min: null, max: null };
            if (product.hasVariants && product.variants.length > 0) {
                const prices = product.variants.map(v => parseFloat(v.price));
                priceRange = {
                    min: Math.min(...prices),
                    max: Math.max(...prices)
                };
            } else {
                priceRange = {
                    min: parseFloat(product.price),
                    max: parseFloat(product.price)
                };
            }

            // Calculate total stock
            const totalStock = product.hasVariants
                ? product.variants.reduce((sum, v) => sum + v.stock, 0)
                : product.stock;

            return {
                ...product,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: product.reviews.length,
                priceRange,
                totalStock,
                inStock: totalStock > 0,
                reviews: undefined // Remove from response
            };
        });

        res.status(200).json({
            success: true,
            data: productsWithMeta,
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

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
export const getProduct = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        const isId = !isNaN(identifier);

        const product = await prisma.product.findUnique({
            where: isId ? { id: parseInt(identifier) } : { slug: identifier },
            include: {
                category: true,
                images: {
                    orderBy: { isPrimary: 'desc' } // Primary image first
                },
                variants: {
                    orderBy: [
                        { size: 'asc' },
                        { color: 'asc' }
                    ]
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Calculate average rating
        const avgRating = product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
            : 0;

        // Calculate total stock
        const totalStock = product.hasVariants
            ? product.variants.reduce((sum, v) => sum + v.stock, 0)
            : product.stock;

        res.status(200).json({
            success: true,
            data: {
                ...product,
                avgRating: Math.round(avgRating * 10) / 10,
                reviewCount: product.reviews.length,
                totalStock,
                inStock: totalStock > 0
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            stock,
            categoryId,
            hasVariants,
            variants // JSON string of variants array
        } = req.body;

        // Validate required fields
        if (!name || !description || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, description, and category'
            });
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Generate slug
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Check if slug exists
        const existingProduct = await prisma.product.findUnique({
            where: { slug }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product with this name already exists'
            });
        }

        // Parse hasVariants
        const useVariants = hasVariants === 'true' || hasVariants === true;

        // Validate: if no variants, must have price and stock
        if (!useVariants && (!price || !stock)) {
            return res.status(400).json({
                success: false,
                message: 'Products without variants must have price and stock'
            });
        }

        // Validate: if has variants, must provide variants array
        if (useVariants && !variants) {
            return res.status(400).json({
                success: false,
                message: 'Products with variants must provide variants data'
            });
        }

        // Upload images to Cloudinary
        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadToCloudinary(file, 'products');
                uploadedImages.push({
                    imageUrl: result.url,
                    publicId: result.publicId
                });
                // Delete temp file
                fs.unlinkSync(file.path);
            }
        }

        // Create product with transaction
        const product = await prisma.$transaction(async (tx) => {
            // Create product
            const newProduct = await tx.product.create({
                data: {
                    name,
                    slug,
                    description,
                    price: !useVariants ? parseFloat(price) : null,
                    discountPrice: discountPrice ? parseFloat(discountPrice) : null,
                    stock: !useVariants ? parseInt(stock) : null,
                    categoryId: parseInt(categoryId),
                    hasVariants: useVariants
                }
            });

            // Create images
            if (uploadedImages.length > 0) {
                await tx.productImage.createMany({
                    data: uploadedImages.map((img, index) => ({
                        productId: newProduct.id,
                        imageUrl: img.imageUrl,
                        publicId: img.publicId,
                        isPrimary: index === 0
                    }))
                });
            }

            // Create variants if applicable
            if (useVariants && variants) {
                const variantsData = JSON.parse(variants);

                await tx.productVariant.createMany({
                    data: variantsData.map(v => ({
                        productId: newProduct.id,
                        sku: v.sku,
                        size: v.size || null,
                        color: v.color || null,
                        price: parseFloat(v.price),
                        stock: parseInt(v.stock)
                    }))
                });
            }

            return newProduct;
        });

        // Fetch complete product with relationships
        const completeProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                images: true,
                variants: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: completeProduct
        });

    } catch (error) {
        // Clean up uploaded images if product creation fails
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            discountPrice,
            stock,
            categoryId
        } = req.body;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Generate new slug if name changed
        let slug = product.slug;
        if (name && name !== product.name) {
            slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        // Update product
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name, slug }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(discountPrice !== undefined && {
                    discountPrice: discountPrice ? parseFloat(discountPrice) : null
                }),
                ...(stock && { stock: parseInt(stock) }),
                ...(categoryId && { categoryId: parseInt(categoryId) })
            },
            include: {
                category: true,
                images: true,
                variants: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                images: true
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete images from Cloudinary
        if (product.images.length > 0) {
            const publicIds = product.images.map(img => img.publicId);
            await deleteMultipleFromCloudinary(publicIds);
        }

        // Delete product (cascade will handle variants, cart items, etc.)
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Add images to existing product
// @route   POST /api/products/:id/images
// @access  Private/Admin
export const addProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }

        // Upload images to Cloudinary
        const uploadedImages = [];
        for (const file of req.files) {
            const result = await uploadToCloudinary(file, 'products');
            uploadedImages.push({
                productId: parseInt(id),
                imageUrl: result.url,
                publicId: result.publicId,
                isPrimary: false
            });
            fs.unlinkSync(file.path);
        }

        // Save to database
        await prisma.productImage.createMany({
            data: uploadedImages
        });

        // Fetch updated product
        const updatedProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
                images: true
            }
        });

        res.status(200).json({
            success: true,
            message: 'Images added successfully',
            data: updatedProduct
        });

    } catch (error) {
        if (req.files) {
            for (const file of req.files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
        next(error);
    }
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
export const deleteProductImage = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;

        const image = await prisma.productImage.findUnique({
            where: { id: parseInt(imageId) }
        });

        if (!image || image.productId !== parseInt(id)) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(image.publicId);

        // Delete from database
        await prisma.productImage.delete({
            where: { id: parseInt(imageId) }
        });

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};