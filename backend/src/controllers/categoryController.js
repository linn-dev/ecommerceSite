import fs from "fs";
import prisma from "../config/database.js"
import { uploadToCloudinary, deleteFromCloudinary} from "../config/cloudinary.js";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { products: true } // Count products in each category
                }
            }
        });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    }catch(err) {
        next(err);
    }
}

// @desc    Get single category
// @route   GET /api/categories/:identifier
// @access  Public

export const getCategory = async (req, res, next) => {
    try{
        const { identifier } = req.params;
        const isId = !isNaN(identifier);

        const category = await prisma.category.findUnique({
            where: isId ? { id: parseInt(identifier) } : {slug: identifier},
            include: {
                products: {
                    take: 10,
                    include: {
                        images: {
                            where: {isPrimary: true},
                            take: 1
                        }
                    }
                }
            }
        });

        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    }catch(err) {
        next(err);
    }
}

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
    try{
        const { name, description } = req.body;

        if(!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const slug = name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const existingCategory = await prisma.category.findUnique({
            where: {slug}
        });

        if(!existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        //** Handle image upload **\\
        let imageUrl = null;
        let publicId = null;

        if(req.file) {
            const result = await uploadToCloudinary(req.file, 'categories');
            imageUrl =result.url;
            publicId = result.publicId;

            //** Delete temp file **\\
            fs.unlinkSync(req.file.path);
        }

        const category = await prisma.category.create({
            data: {
                name,
                slug,
                description,
                imageUrl
            }
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        })
    }catch(err) {
        //** Delete uploaded image if category creation fails **\\
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
}

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin

export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await prisma.category.findUnique({
            where: {id: parseInt(id)}
        });

        if(!category) {
            return res.status(404).json({
                success: false,
                message: "Category Not Found"
            });
        }

        //** Generate new slug if name changed **\\
        let slug = category.slug;
        if (name && name !== category.name) {
            slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        let imageUrl = category.imageUrl;
        if(req.file) {
            if(category.imageUrl) {
                //** Extract publicId from url **\\
                const urlParts = category.imageUrl.split('/');
                const publicId = urlParts.slice(-2).join('/').split('.')[0];
                await deleteFromCloudinary(publicId);
            }
        }

        const result = await uploadToCloudinary(req.file, 'categories');
        imageUrl = result.url;

        fs.unlinkSync(req.file.path);

        //** Update category **\\
        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name, slug }),
                ...(description !== undefined && { description }),
                ...(imageUrl && { imageUrl })
            }
        });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    }catch(err) {
        if(req.file) {
            fs.unlinkSync(req.file.path);
        }
        next(err);
    }
}

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Prevent deletion if category has products
        if (category._count.products > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${category._count.products} products. Please delete products first.`
            });
        }

        if (category.imageUrl) {
            const urlParts = category.imageUrl.split('/');
            const publicId = urlParts.slice(-2).join('/').split('.')[0];
            await deleteFromCloudinary(publicId);
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};