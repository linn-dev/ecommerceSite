import prisma from "../config/database.js"

// @desc Create review from product
// @route POST /api/reviews
// @access Private
export const createReview = async (req, res, next) => {
    try{
        const userId = req.user.id;
        const { productId, rating, comment } = req.body;

        if( !productId || !rating ){
            return res.status(400).json({
                status: "error",
                message: "Need Product Id & Rating"
            });
        }

        if(rating < 1 || rating > 5) {
            return res.status(400).json({
                status: "error",
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await prisma.review.create({
            data: {
                productId: Number(productId),
                userId: Number(userId),
                rating: Number(rating),
                comment: comment || null
            }
        });

        res.status(200).json({
            status: "success",
            message: "Review created",
            data: review
        })
    }catch(err){
        console.log(err);
        next(err);
    }
}

// @desc    Get current user's reviews
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = async (req, res, next) => {
    try{
        const userId = req.user.id;

        const reviews = await prisma.review.findMany({
            where: {userId: Number(userId)},
            include: {
                product: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if(!reviews) {
            return res.status(400).json({
                status: "error",
                message: "No Reviews Found"
            });
        }

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data:reviews
        })
    }catch(err){
        next(err);
    }
}

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/all
// @access  Private/Admin
export const getAllReviews = async (req, res, next) => {
    try{
        const reviews = await prisma.review.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if(!reviews) {
            return res.status(400).json({
                status: "error",
                message: "No Reviews Found"
            });
        }

        res.status(200).json({
            status: "success",
            results: reviews.length,
            data:reviews
        })
    }catch(err){
        next(err);
    }
}

// @desc Update reviews
// @route PUT api/reviews/:id
// @access Private
export const updateReview = async (req, res, next) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        const review = await prisma.review.findUnique({
            where: {id: Number(id)}
        })

        if(!review) {
            return res.status(400).json({
                status: "error",
                message: "Review not found"
            });
        }

        if(!rating) {
            return res.status(400).json({
                status: "error",
                message: "Rating must be between 1 and 5"
            })
        }

        if(review.userId !== Number(userId)) {
            return res.status(403).json({
                status: "error",
                message: "You haven't authorized to update this review"
            })
        }

        const updateReview = await prisma.review.update({
            where: {id: Number(id)},
            data: {
                rating: Number(rating),
                comment: comment !== undefined ? comment : review.comment
            }
        });

        res.status(200).json({
            status: "success",
            message: "Review updated successfully",
            data: updateReview
        })
    }catch(err){
        next(err);
    }
}

// @desc Delete a review (admin or user)
// @route DELETE /api/reviews/:id
// @access Private/Admin/User
export const deleteReview = async (req, res, next) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const review = await prisma.review.findUnique({
            where: {id: Number(id)}
        });

        if(!review) {
            return res.status(400).json({
                status: "error",
                message: "Review not found"
            });
        }

        const isOwner = review.userId === Number(userId);
        const isAdmin = req.user.role === "ADMIN";

        console.log(isAdmin);

        if(!isOwner && !isAdmin) {
            return res.status(403).json({
                status: "error",
                message: "You haven't authorized to delete this review"
            })
        }

        await prisma.review.delete({
            where: { id: Number(id) }
        });

        res.status(200).json({
            status: "success",
            message: "Review deleted successfully"
        });
    }catch(err){
        next(err);
    }
}